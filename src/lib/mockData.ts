import type { Account, Worker, WorkerTask } from "./types";

// ── DIQQAT: bu mock (namuna) ma'lumotlar. Real integratsiya keyin ulanadi. ──

export const workers: Worker[] = [
  { id: "w1", name: "Asrbek", role: "owner", position: "Rahbar" },
  { id: "w2", name: "Nodira", role: "admin", position: "Boshqaruvchi" },
  { id: "w3", name: "Jasur", role: "ishchi", position: "Ombor" },
  { id: "w4", name: "Dilnoza", role: "ishchi", position: "Sotuv" },
  { id: "w5", name: "Bekzod", role: "ishchi", position: "Cargo" },
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

// DIQQAT: kirim/chiqim yozuvlari endi src/lib/api feed'laridan keladi
// (telegramFeed + saytFeed). Bu yerda faqat ishchilar, hisoblar va vazifalar.

export const tasks: WorkerTask[] = [
  { id: "k1", title: "Ombordagi yangi partiyani qabul qilish", assignedTo: "Jasur", status: "jarayonda", createdAt: daysAgo(0), viaVoice: true },
  { id: "k2", title: "Uzum buyurtmalarini qadoqlash", assignedTo: "Dilnoza", status: "yangi", createdAt: daysAgo(0) },
  { id: "k3", title: "Cargo to'lovini amalga oshirish", assignedTo: "Bekzod", status: "bajarildi", createdAt: daysAgo(1), viaVoice: true },
  { id: "k4", title: "Qaytgan tovarlarni tekshirish", assignedTo: "Jasur", status: "yangi", createdAt: daysAgo(1) },
];
