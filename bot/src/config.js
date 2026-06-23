// ── Bot sozlamalari (env'dan o'qiydi) ──
// Token/API/baza KEYIN qo'shiladi. Hozircha bo'sh bo'lsa — maket rejimida ishlaydi.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Oddiy .env o'qish (paketlarsiz)
function loadEnv() {
  try {
    const dir = dirname(fileURLToPath(import.meta.url));
    const raw = readFileSync(join(dir, "..", ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* .env yo'q — maket rejimi */
  }
}
loadEnv();

export const BOT_TOKEN = process.env.BOT_TOKEN || "";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const DATABASE_URL = process.env.DATABASE_URL || "";

export const MOCK_MODE = !BOT_TOKEN; // token bo'lmasa maket rejimi
