import type { Payment } from "../types";

// ════════════════════════════════════════════════════════════════════════
// Payme / Click to'lovlari (HOZIRCHA MOCK — integratsiyasiz)
//
// Kelajakda real ulanish:
//   - Payme: Subscribe API `receipts.get_all` (sana oralig'i bo'yicha ro'yxat)
//   - Click: webhook'larni bazaga yozish + merchant kabinet eksporti
//
// "Kim qancha o'tkazgani" — orderId (siz biriktirgan buyurtma/hisob ID) va
// yashirilgan karta orqali aniqlanadi. To'liq ism banklardan kelmaydi.
// ════════════════════════════════════════════════════════════════════════

const hoursAgo = (h: number) => {
  const x = new Date();
  x.setHours(x.getHours() - h);
  return x.toISOString();
};

const mock: Payment[] = [
  { id: "pm1", provider: "payme", amount: 1_280_000, cardMask: "**** 4419", orderId: "#A-1043", payer: "+998 90 123 45 67", status: "muvaffaqiyatli", paidAt: hoursAgo(1) },
  { id: "cl1", provider: "click", amount: 940_000, cardMask: "**** 7782", orderId: "#A-1042", payer: "Dilnoza X.", status: "muvaffaqiyatli", paidAt: hoursAgo(3) },
  { id: "pm2", provider: "payme", amount: 2_150_000, cardMask: "**** 1190", orderId: "#A-1041", status: "muvaffaqiyatli", paidAt: hoursAgo(6) },
  { id: "cl2", provider: "click", amount: 460_000, cardMask: "**** 3025", orderId: "#A-1040", payer: "+998 93 555 11 22", status: "kutilmoqda", paidAt: hoursAgo(7) },
  { id: "pm3", provider: "payme", amount: 780_000, cardMask: "**** 8841", orderId: "#A-1039", status: "muvaffaqiyatli", paidAt: hoursAgo(22) },
  { id: "cl3", provider: "click", amount: 1_530_000, cardMask: "**** 6610", orderId: "#A-1038", payer: "Bekzod T.", status: "bekor", paidAt: hoursAgo(26) },
  { id: "pm4", provider: "payme", amount: 320_000, cardMask: "**** 4419", orderId: "#A-1037", status: "muvaffaqiyatli", paidAt: hoursAgo(30) },
];

export async function fetchPayments(): Promise<Payment[]> {
  // Mock: darhol qaytaramiz. Real holatda Payme/Click so'rovi bo'ladi.
  return mock.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
}
