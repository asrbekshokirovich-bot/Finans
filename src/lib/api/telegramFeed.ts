import type { Transaction } from "../types";

// ════════════════════════════════════════════════════════════════════════
// Telegram bot manbai (HOZIRCHA MOCK — integratsiyasiz)
//
// Ishchilar Telegram bot orqali ovozli/matn xabar yuboradi ("bugun 1.2 mln
// cargo to'lovi qildim"). Bot xabarni AI bilan sort qilib, kirim/chiqim
// yozuviga aylantiradi va shu yerdan keladi.
//
// KELAJAKDA: bu funksiya o'rniga real so'rov bo'ladi, masalan:
//   const res = await fetch(`${API}/telegram/transactions`);
//   return res.json();
// UI va hisob mantig'i o'zgarmaydi — faqat shu funksiya almashtiriladi.
// ════════════════════════════════════════════════════════════════════════

const daysAgo = (d: number) => {
  const x = new Date();
  x.setDate(x.getDate() - d);
  return x.toISOString();
};

const mock: Transaction[] = [
  { id: "tg1", type: "chiqim", amount: 1_750_000, category: "cargo", source: "alicargo", note: "Xitoydan partiya yetkazish", createdAt: daysAgo(2), createdBy: "Bekzod", channel: "telegram", viaVoice: true },
  { id: "tg2", type: "chiqim", amount: 2_400_000, category: "maosh", source: "naqd", note: "Ishchilar maoshi", createdAt: daysAgo(4), createdBy: "Asrbek", channel: "telegram", viaVoice: true },
  { id: "tg3", type: "chiqim", amount: 650_000, category: "patent", source: "naqd", note: "Oylik patent to'lovi", createdAt: daysAgo(5), createdBy: "Asrbek", channel: "telegram", viaVoice: true },
  { id: "tg4", type: "kirim", amount: 1_280_000, category: "sotuv", source: "naqd", note: "Do'kondan naqd sotuv", createdAt: daysAgo(1), createdBy: "Dilnoza", channel: "telegram", viaVoice: true },
];

export async function fetchTelegramTransactions(): Promise<Transaction[]> {
  // Mock: darhol qaytaramiz. Real holatda bu fetch bo'ladi.
  return mock;
}
