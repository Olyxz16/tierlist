import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import cors from "cors";

import {
  checkAuthenticatedUser,
  createSession,
  logout,
  exchangeCode,
  fetchDiscordUser,
  findOrCreateUser,
  DISCORD_CLIENT_ID,
  DISCORD_OAUTH_URL,
  DISCORD_REDIRECT_URI,
  AuthenticatedRequest,
} from "./auth";
import {
  people, initDb, ADMIN_DISCORD_IDS,
  hasUserSubmitted, saveResult, getAllResults
} from "./db";
import { ResultEntry } from "./models";

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
}));

const apiRouter = express.Router();
app.use("/api", apiRouter);

// ─── Auth routes ──────────────────────────────────────────────────

/**
 * GET /auth/discord
 * Redirects the user to Discord's OAuth2 authorization page.
 */
apiRouter.get("/auth/discord", (_req, res) => {
  if (!DISCORD_CLIENT_ID || !DISCORD_REDIRECT_URI) {
    return res.status(500).send("Discord OAuth configuration missing.");
  }

  const url = new URL(DISCORD_OAUTH_URL);
  url.searchParams.set("client_id",     DISCORD_CLIENT_ID);
  url.searchParams.set("redirect_uri",  DISCORD_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope",         "identify");

  res.redirect(url.toString());
});

/**
 * GET /auth/discord/callback
 * Handles the redirect from Discord, exchanges the code for a token,
 * fetches user info, and creates a local session.
 */
apiRouter.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/?error=discord_denied`);
  }

  try {
    const accessToken = await exchangeCode(code);
    const discordUser = await fetchDiscordUser(accessToken);
    const user        = await findOrCreateUser(discordUser);
    const session     = await createSession(user.id);

    // Set secure, http-only session cookie
    res.cookie("session", session.token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });

    res.redirect(`${process.env.FRONTEND_URL}/`);
  } catch (err) {
    console.error("OAuth error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/?error=oauth_failed`);
  }
});

/**
 * GET /auth/me
 * Returns information about the currently logged-in user.
 */
apiRouter.get("/auth/me", checkAuthenticatedUser, (req: AuthenticatedRequest, res) => {
  const u = req.user!;
  res.json({
    id:         u.id,
    discord_id: u.discord_id,
    username:   u.username,
    isAdmin:    ADMIN_DISCORD_IDS.has(u.discord_id),
    avatar:     u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.discord_id}/${u.avatar}.png`
      : null,
  });
});

/**
 * POST /auth/logout
 * Destroys the current session.
 */
apiRouter.post("/auth/logout", async (req: AuthenticatedRequest, res) => {
  const token = req.cookies["session"];
  if (token) await logout(token);
  res.clearCookie("session");
  res.status(200).json({ status: "ok" });
});

// ─── Data routes ──────────────────────────────────────────────────

/**
 * GET /new
 * Returns the list of all professors (people).
 */
apiRouter.get("/new", checkAuthenticatedUser, (_req, res) => {
  // Only send small image info, not full local paths
  const publicPeople = people.map((p) => ({
    name:  p.name,
    image: { id: p.image.id },
  }));
  res.json(publicPeople);
});

/**
 * POST /send
 * Receives the professor placement data from a user.
 */
apiRouter.post("/send", checkAuthenticatedUser, async (req: AuthenticatedRequest, res) => {
  const newResults = req.body.results as ResultEntry[];

  if (!Array.isArray(newResults)) {
    return res.status(400).json({ error: "Invalid results format" });
  }

  const user = req.user!;
  const discordId = user.discord_id;

  // Track submission - allow multiple for admins
  const isAdmin = ADMIN_DISCORD_IDS.has(discordId);
  if (!isAdmin && await hasUserSubmitted(discordId)) {
    return res.status(403).json({ error: "Tu as déjà soumis ton alignment chart !" });
  }

  for (const entry of newResults) {
    if (
      !entry.personne ||
      typeof entry.QualityValue !== "number" ||
      typeof entry.CoolValue    !== "number"
    ) {
      return res.status(400).json({ error: "Invalid result entry" });
    }
    if (
      entry.QualityValue < -50 || entry.QualityValue > 50 ||
      entry.CoolValue    < -50 || entry.CoolValue    > 50
    ) {
      return res.status(400).json({ error: "Values must be between -50 and 50" });
    }
  }

  await saveResult(user, newResults);

  res.status(200).json({ status: "ok" });
});

/**
 * GET /stats
 * Returns the average values for each person.
 */
apiRouter.get("/stats", async (_req, res) => {
  const results = await getAllResults();
  const stats: Record<string, { totalQ: number; totalC: number; count: number; name: string }> = {};

  results.forEach(r => {
    r.entries.forEach((e: ResultEntry) => {
      const id = e.personne.image.id;
      if (!stats[id]) {
        stats[id] = { totalQ: 0, totalC: 0, count: 0, name: e.personne.name };
      }
      stats[id].totalQ += e.QualityValue;
      stats[id].totalC += e.CoolValue;
      stats[id].count += 1;
    });
  });

  const averages = Object.keys(stats).map(id => ({
    id,
    name: stats[id].name,
    avgQuality: parseFloat((stats[id].totalQ / stats[id].count).toFixed(2)),
    avgCool: parseFloat((stats[id].totalC / stats[id].count).toFixed(2)),
    count: stats[id].count
  }));

  res.json(averages);
});

/**
 * GET /image/:id
 * Serves the professor's photo from the local filesystem.
 */
apiRouter.get("/image/:id", (req, res) => {
  const person = people.find((p) => p.image.id === req.params.id);

  if (!person) return res.status(404).send("Image not found");

  const fullPath = person.image.image_local_path;
  if (fs.existsSync(fullPath)) {
    res.sendFile(fullPath);
  } else {
    res.status(404).send("File not found on disk");
  }
});

// ─── Serve static frontend (must be after all API routes) ─────────
const frontendPath = path.join(__dirname, "frontend-out");
app.use(express.static(frontendPath, {
  index: "index.html",
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-cache");
    }
  },
}));

// ─── Final startup ────────────────────────────────────────────────
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀  API running on http://localhost:${PORT}`);
    console.log(`   Discord redirect URI: ${process.env.DISCORD_REDIRECT_URI || "(not set)"}`);
    console.log(`   PostgreSQL database initialized`);
  });
}).catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
