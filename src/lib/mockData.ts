import type { Account, Transaction, Worker, WorkerTask } from "./types";

// ── DIQQAT: bu mock (namuna) ma'lumotlar. Real integratsiya keyin ulanadi. ──

export const workers: Worker[] = [
  { id: "w1", name: "Asrbek", role: "Admin" },
  { id: "w2", name: "Jasur", role: "Ombor" },
  { id: "w3", name: "Dilnoza", role: "Sotuv" },
  { id: "w4", name: "Bekzod", role: "Cargo" },
];

export const accounts: Account[] = [
  { id: "a1", name: "Uzcard ****1234", type: "karta", balance: 18_500_000 },
  { id: "a2", name: "Humo ****5678", type: "karta", balance: 7_200_000 },
  { id: "a3", name: "Naqd kassa", type: "naqd", balance: 3_400_000 },
  { id: "a4", name: "Patent hisobi", type: "patent", balance: 1_250_000 },
];

const daysAgo = (d: number) => {
  const x = new Date();
  x.setDate(x.getDate() - d);
  return x.toISOString();
};

export const transactions: Transaction[] = [
  { id: "t1", type: "kirim", amount: 4_350_000, category: "sotuv", source: "uzum", note: "Uzum FBO buyurtmalar", createdAt: daysAgo(0), createdBy: "Tizim" },
  { id: "t2", type: "kirim", amount: 2_100_000, category: "sotuv", source: "yandex", note: "Yandex Market sotuv", createdAt: daysAgo(0), createdBy: "Tizim" },
  { id: "t3", type: "kirim", amount: 1_280_000, category: "sotuv", source: "payme", note: "Onlayn do'kon — Payme", createdAt: daysAgo(1), createdBy: "Dilnoza" },
  { id: "t4", type: "kirim", amount: 940_000, category: "sotuv", source: "click", note: "Onlayn do'kon — Click", createdAt: daysAgo(1), createdBy: "Dilnoza" },
  { id: "t5", type: "chiqim", amount: 1_750_000, category: "cargo", source: "alicargo", note: "Xitoydan partiya yetkazish", createdAt: daysAgo(2), createdBy: "Bekzod", viaVoice: true },
  { id: "t6", type: "chiqim", amount: 5_600_000, category: "tovar_xarid", source: "boshqa", note: "1688 — yangi tovar", createdAt: daysAgo(3), createdBy: "Asrbek" },
  { id: "t7", type: "chiqim", amount: 820_000, category: "komissiya", source: "uzum", note: "Uzum komissiyasi", createdAt: daysAgo(3), createdBy: "Tizim" },
  { id: "t8", type: "chiqim", amount: 2_400_000, category: "maosh", source: "naqd", note: "Ishchilar maoshi", createdAt: daysAgo(4), createdBy: "Asrbek" },
  { id: "t9", type: "chiqim", amount: 650_000, category: "patent", source: "naqd", note: "Oylik patent to'lovi", createdAt: daysAgo(5), createdBy: "Asrbek" },
  { id: "t10", type: "kirim", amount: 3_200_000, category: "sotuv", source: "uzum", note: "Uzum haftalik hisob-kitob", createdAt: daysAgo(6), createdBy: "Tizim" },
  { id: "t11", type: "chiqim", amount: 480_000, category: "reklama", source: "boshqa", note: "Telegram reklama", createdAt: daysAgo(6), createdBy: "Dilnoza" },
  { id: "t12", type: "chiqim", amount: 300_000, category: "ijara", source: "naqd", note: "Ombor ijarasi", createdAt: daysAgo(7), createdBy: "Asrbek" },
];

export const tasks: WorkerTask[] = [
  { id: "k1", title: "Ombordagi yangi partiyani qabul qilish", assignedTo: "Jasur", status: "jarayonda", createdAt: daysAgo(0), viaVoice: true },
  { id: "k2", title: "Uzum buyurtmalarini qadoqlash", assignedTo: "Dilnoza", status: "yangi", createdAt: daysAgo(0) },
  { id: "k3", title: "Cargo to'lovini amalga oshirish", assignedTo: "Bekzod", status: "bajarildi", createdAt: daysAgo(1), viaVoice: true },
  { id: "k4", title: "Qaytgan tovarlarni tekshirish", assignedTo: "Jasur", status: "yangi", createdAt: daysAgo(1) },
];
