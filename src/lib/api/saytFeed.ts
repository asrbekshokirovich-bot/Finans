import type { Transaction } from "../types";

// ════════════════════════════════════════════════════════════════════════
// Sayt manbai (HOZIRCHA MOCK — integratsiyasiz)
//
// Saytdagi ma'lumotlar: Uzum/Yandex marketplace sotuvlari va komissiyalari,
// onlayn do'kon buyurtmalari, Payme/Click orqali tushgan to'lovlar.
//
// KELAJAKDA: bu funksiya o'rniga real so'rov bo'ladi, masalan:
//   const res = await fetch(`${API}/finance/transactions`);
//   return res.json();
// ════════════════════════════════════════════════════════════════════════

const daysAgo = (d: number) => {
  const x = new Date();
  x.setDate(x.getDate() - d);
  return x.toISOString();
};

const mock: Transaction[] = [
  { id: "s1", type: "kirim", amount: 4_350_000, category: "sotuv", source: "uzum", note: "Uzum FBO buyurtmalar", createdAt: daysAgo(0), createdBy: "Tizim", channel: "sayt" },
  { id: "s2", type: "kirim", amount: 2_100_000, category: "sotuv", source: "yandex", note: "Yandex Market sotuv", createdAt: daysAgo(0), createdBy: "Tizim", channel: "sayt" },
  { id: "s3", type: "kirim", amount: 1_280_000, category: "sotuv", source: "payme", note: "Onlayn do'kon — Payme", createdAt: daysAgo(1), createdBy: "Tizim", channel: "sayt" },
  { id: "s4", type: "kirim", amount: 940_000, category: "sotuv", source: "click", note: "Onlayn do'kon — Click", createdAt: daysAgo(1), createdBy: "Tizim", channel: "sayt" },
  { id: "s5", type: "chiqim", amount: 820_000, category: "komissiya", source: "uzum", note: "Uzum komissiyasi", createdAt: daysAgo(3), createdBy: "Tizim", channel: "sayt" },
  { id: "s6", type: "kirim", amount: 3_200_000, category: "sotuv", source: "uzum", note: "Uzum haftalik hisob-kitob", createdAt: daysAgo(6), createdBy: "Tizim", channel: "sayt" },
];

export async function fetchSaytTransactions(): Promise<Transaction[]> {
  return mock;
}
