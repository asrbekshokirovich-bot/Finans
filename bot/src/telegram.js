// ── Telegram Bot API o'rovi (raw fetch, paketlarsiz) ──
import { BOT_TOKEN } from "./config.js";

const API = (method) => `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
const FILE_API = (path) => `https://api.telegram.org/file/bot${BOT_TOKEN}/${path}`;

async function call(method, body) {
  const res = await fetch(API(method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`${method}: ${data.description}`);
  return data.result;
}

// Yangiliklarni olish (long polling)
export function getUpdates(offset) {
  return call("getUpdates", { offset, timeout: 30, allowed_updates: ["message"] });
}

// Xabar yuborish (guruh yoki shaxsiy chatga)
export function sendMessage(chatId, text, extra = {}) {
  return call("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", ...extra });
}

// Ovozli fayl yo'lini olish
export function getFile(fileId) {
  return call("getFile", { file_id: fileId });
}

// Faylni yuklab olish (ovoz baytlari)
export async function downloadFile(filePath) {
  const res = await fetch(FILE_API(filePath));
  return Buffer.from(await res.arrayBuffer());
}

// Webhook o'rnatish (ishlab chiqarishda — long polling o'rniga)
export function setWebhook(url) {
  return call("setWebhook", { url, allowed_updates: ["message"] });
}
