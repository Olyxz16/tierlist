import { User, Session, Personne, ResultEntry } from "./models";
import path from "path";
import fs from "fs";
import { Pool } from "pg";

// ─── Professors List (Static) ────────────────────────────────────
const imagesBasePath = path.join(__dirname, "..", "Prof_subtitles");
export const people: Personne[] = [
  { name: "Agnès Arnould",            image: { id: "agnes_arnould",      image_local_path: path.join(imagesBasePath, "Agnes_Arnould.png") } },
  { name: "Alex Defayes",             image: { id: "alex_defayes",       image_local_path: path.join(imagesBasePath, "Alex Defayes.png") } },
  { name: "Ali Hariri",               image: { id: "ali_hariri",         image_local_path: path.join(imagesBasePath, "Ali Hariri.png") } },
  { name: "Alicia Morris",            image: { id: "alicia_morris",      image_local_path: path.join(imagesBasePath, "Alicia Morris.png") } },
  { name: "Antoine",                  image: { id: "antoine",            image_local_path: path.join(imagesBasePath, "Antoine.jpg") } },
  { name: "Benoit Loisel",            image: { id: "benoit_loisel",      image_local_path: path.join(imagesBasePath, "Benoit Loisel.png") } },
  { name: "Boris Pasquier",           image: { id: "boris_pasquier",     image_local_path: path.join(imagesBasePath, "Boris Pasquier.png") } },
  { name: "Botman (Saidi Boumediene)",image: { id: "botman_saidi",       image_local_path: path.join(imagesBasePath, "Botman (saidi boumediene).png") } },
  { name: "Charles Lepaire",          image: { id: "charles_lepaire",    image_local_path: path.join(imagesBasePath, "Charles Lepaire.png") } },
  { name: "David Helbert",            image: { id: "david_helbert",      image_local_path: path.join(imagesBasePath, "David_Helbert.png") } },
  { name: "Emmanuelle Darles",        image: { id: "emmanuelle_darles",  image_local_path: path.join(imagesBasePath, "Emmanuelle_Darles.png") } },
  { name: "Eric Andres",              image: { id: "eric_andres",        image_local_path: path.join(imagesBasePath, "Eric_Andres.png") } },
  { name: "Frédéric Bosio",           image: { id: "frederic_bosio",     image_local_path: path.join(imagesBasePath, "Frederic_Bosio.png") } },
  { name: "Gaëlle Largeteau Skapin", image: { id: "gaelle_largeteau",   image_local_path: path.join(imagesBasePath, "Gaelle Largeteau Skapin.png") } },
  { name: "Gilles Subrenat",          image: { id: "gilles_subrenat",    image_local_path: path.join(imagesBasePath, "Gilles_Subrenat.png") } },
  { name: "Hakim",                    image: { id: "hakim",              image_local_path: path.join(imagesBasePath, "Hakim.png") } },
  { name: "Lancelot Pecquet",         image: { id: "lancelot_pecquet",   image_local_path: path.join(imagesBasePath, "Lancelot_Pecquet.png") } },
  { name: "Laurent Fuchs",            image: { id: "laurent_fuchs",      image_local_path: path.join(imagesBasePath, "Laurent_Fuchs.png") } },
  { name: "Lilian Aveneau",           image: { id: "lilian_aveneau",     image_local_path: path.join(imagesBasePath, "Lilian_Aveneau.png") } },
  { name: "Marcus VanLeuwen",         image: { id: "marcus_vanleuwen",   image_local_path: path.join(imagesBasePath, "Marcus VanLeuwen.png") } },
  { name: "Nicolas James",            image: { id: "nicolas_james",      image_local_path: path.join(imagesBasePath, "Nicolas James.png") } },
  { name: "Nicolas Courrilleau",      image: { id: "nicolas_courrilleau",image_local_path: path.join(imagesBasePath, "Nicolas_Courrilleau.png") } },
  { name: "Noël Richard",             image: { id: "noel_richard",       image_local_path: path.join(imagesBasePath, "Noel_Richard.png") } },
  { name: "Pascal Lienhardt",         image: { id: "pascal_lienhardt",   image_local_path: path.join(imagesBasePath, "Pascal_Lienhardt.png") } },
  { name: "Philippe Meseure",         image: { id: "philippe_meseure",   image_local_path: path.join(imagesBasePath, "Philippe_Meseure.png") } },
  { name: "Pol Vanhaecke",            image: { id: "pol_vanhaecke",      image_local_path: path.join(imagesBasePath, "Pol_Vanhaecke.png") } },
  { name: "Rita Zrour",               image: { id: "rita_zrour",         image_local_path: path.join(imagesBasePath, "Rita_Zrour.png") } },
  { name: "Samuel Peltier",           image: { id: "samuel_peltier",     image_local_path: path.join(imagesBasePath, "Samuel_Peltier.png") } },
  { name: "Stéphane Jean",            image: { id: "stephane_jean",      image_local_path: path.join(imagesBasePath, "Stephane_Jean.png") } },
  { name: "Sylvie Allayrangue",       image: { id: "sylvie_allayrangue", image_local_path: path.join(imagesBasePath, "Sylvie_Allayrangue.png") } },
  { name: "Sylvie Girard",            image: { id: "sylvie_girard",      image_local_path: path.join(imagesBasePath, "Sylvie_Girard.png") } },
  { name: "Xavier Skapin",            image: { id: "xavier_skapin",      image_local_path: path.join(imagesBasePath, "Xavier_Skapin.png") } },
  { name: "Yanis Pousset",            image: { id: "yanis_pousset",      image_local_path: path.join(imagesBasePath, "Yanis_Pousset.png") } },
  { name: "Yannick Degardin",         image: { id: "yannick_degardin",   image_local_path: path.join(imagesBasePath, "Yannick_Degardin.png") } },
  { name: "Yves Bertrand",            image: { id: "yves_bertrand",      image_local_path: path.join(imagesBasePath, "Yves_Bertrand.png") } },
  { name: "Larbi Belchicha",          image: { id: "larbi_belchicha",    image_local_path: path.join(imagesBasePath, "larbi Belchicha.png") } },
];

// ─── DB Initialization ───────────────────────────────────────────
let pool: Pool;

export const ADMIN_DISCORD_IDS = new Set<string>(
  (process.env.ADMIN_DISCORD_IDS ?? "").split(",").map(s => s.trim()).filter(Boolean)
);

export async function initDb() {
  const connectionString = process.env.DATABASE_URL;
  
  if (connectionString) {
    pool = new Pool({ connectionString });
  } else {
    pool = new Pool({
      user:     process.env.DB_USER     || "tierlist",
      password: process.env.DB_PASSWORD || "tierlist",
      host:     process.env.DB_HOST     || "localhost",
      database: process.env.DB_NAME     || "tierlist",
      port:     parseInt(process.env.DB_PORT || "5432"),
    });
  }

  // Create Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      discord_id TEXT UNIQUE NOT NULL,
      username   TEXT NOT NULL,
      avatar     TEXT
    )
  `);

  // Create Sessions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Create Results table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS results (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER NOT NULL,
      discord_id   TEXT NOT NULL,
      username     TEXT NOT NULL,
      entries_json JSONB NOT NULL,
      submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  const jsonPath = path.join(__dirname, "results.json");
  if (fs.existsSync(jsonPath) && fs.statSync(jsonPath).size > 2) {
    try {
      const raw = fs.readFileSync(jsonPath, "utf-8");
      const data = JSON.parse(raw);
      
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const res of (data.results || [])) {
          const discordId = res.discordId as string;
          const username = res.username as string;
          const entries = res.entries as ResultEntry[];
          const submittedAt = res.submittedAt as string;

          await client.query(
            "INSERT INTO users (discord_id, username) VALUES ($1, $2) ON CONFLICT (discord_id) DO NOTHING",
            [discordId, username]
          );
          const userRes = await client.query("SELECT id FROM users WHERE discord_id = $1", [discordId]);
          const userId = userRes.rows[0].id;
          await client.query(
            "INSERT INTO results (user_id, discord_id, username, entries_json, submitted_at) VALUES ($1, $2, $3, $4, $5)",
            [userId, discordId, username, JSON.stringify(entries), submittedAt]
          );
        }
        await client.query("COMMIT");
        // Rename to avoid re-migration
        fs.renameSync(jsonPath, jsonPath + ".old");
        console.log("✅ Migrated results.json to PostgreSQL.");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("Failed to migrate JSON:", err);
    }
  }
}

// ─── DB Accessors ────────────────────────────────────────────────

export async function getUserByDiscordId(discordId: string): Promise<User | undefined> {
  const res = await pool.query("SELECT * FROM users WHERE discord_id = $1", [discordId]);
  const u = res.rows[0];
  if (!u) return undefined;
  return { id: u.id, discord_id: u.discord_id, username: u.username, avatar: u.avatar };
}

export async function createUser(discordId: string, username: string, avatar: string | null): Promise<User> {
  const res = await pool.query(
    "INSERT INTO users (discord_id, username, avatar) VALUES ($1, $2, $3) RETURNING id",
    [discordId, username, avatar]
  );
  return { id: res.rows[0].id, discord_id: discordId, username, avatar };
}

export async function updateUser(id: number, username: string, avatar: string | null): Promise<void> {
  await pool.query("UPDATE users SET username = $1, avatar = $2 WHERE id = $3", [username, avatar, id]);
}

export async function saveSession(token: string, userId: number, expiresAt: Date): Promise<void> {
  await pool.query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
    [token, userId, expiresAt.toISOString()]
  );
}

export async function deleteSession(token: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
}

export async function getSession(token: string): Promise<Session | undefined> {
  const res = await pool.query("SELECT * FROM sessions WHERE token = $1", [token]);
  const s = res.rows[0];
  if (!s) return undefined;
  // Check expiry
  const expiry = new Date(s.expires_at);
  if (expiry < new Date()) {
    await deleteSession(token);
    return undefined;
  }
  return { userId: s.user_id, token: s.token, expiresAt: expiry };
}

export async function getUserById(id: number): Promise<User | undefined> {
  const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  const u = res.rows[0];
  if (!u) return undefined;
  return { id: u.id, discord_id: u.discord_id, username: u.username, avatar: u.avatar };
}

export async function hasUserSubmitted(discordId: string): Promise<boolean> {
  const res = await pool.query("SELECT id FROM results WHERE discord_id = $1", [discordId]);
  return res.rowCount !== null && res.rowCount > 0;
}

export async function saveResult(user: User, entries: ResultEntry[]): Promise<void> {
  await pool.query(
    "INSERT INTO results (user_id, discord_id, username, entries_json) VALUES ($1, $2, $3, $4)",
    [user.id, user.discord_id, user.username, JSON.stringify(entries)]
  );
}

export async function getAllResults(): Promise<{ userId: number; discordId: string; username: string; entries: ResultEntry[]; submittedAt: Date }[]> {
  const res = await pool.query("SELECT * FROM results");
  return res.rows.map(r => ({
    userId: r.user_id,
    discordId: r.discord_id,
    username: r.username,
    entries: r.entries_json as ResultEntry[],
    submittedAt: new Date(r.submitted_at)
  }));
}
