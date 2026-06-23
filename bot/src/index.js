// ── Bot ishga tushirish (long polling) ──
import { BOT_TOKEN, MOCK_MODE } from "./config.js";
import { getUpdates } from "./telegram.js";
import { handleUpdate } from "./handlers.js";
import { parseTransaction } from "./ai.js";

async function pollLoop() {
  let offset;
  console.log("🤖 Finans bot ishga tushdi (long polling)...");
  while (true) {
    try {
      const updates = await getUpdates(offset);
      for (const u of updates) {
        offset = u.update_id + 1;
        await handleUpdate(u);
      }
    } catch (e) {
      console.error("Polling xato:", e.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

// ── Maket rejimi: token bo'lmasa, lokal demo (Telegramsiz) ──
function mockDemo() {
  console.log("⚠️  BOT_TOKEN yo'q — MAKET rejimi (Telegramga ulanmaydi).\n");
  console.log("Token qo'shish: bot/.env faylida BOT_TOKEN=... yozing.\n");
  console.log("Namuna: ovozli/matn xabar qanday tahlil qilinishini ko'rsatamiz:\n");

  const samples = [
    "Uzumdan ikki million so'm tushdi",
    "Cargoga bir yarim million berdim",
    "yuz ming so'm berishdi",
    "сто тысяч продажа",
  ];
  for (const s of samples) {
    console.log(`📨 "${s}"`);
    console.log("   →", JSON.stringify(parseTransaction(s)), "\n");
  }

  console.log("Token qo'shgach: npm start — bot Telegramda ishlaydi (guruh + shaxsiy).");
}

if (MOCK_MODE) {
  mockDemo();
} else {
  console.log(`Token topildi (…${BOT_TOKEN.slice(-6)}).`);
  pollLoop();
}
