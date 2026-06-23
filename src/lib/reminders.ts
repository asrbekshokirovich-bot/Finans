import type { Transaction } from "./types";
import { fmtMoney } from "./format";

// ── Proaktiv eslatmalar (statistika asosida) ──
// Barcha sahifalarda yuqorida ko'rsatiladi: kirim/chiqim holati,
// "bugungi hisobotni yozdingizmi?" kabi turtkilar.

export type ReminderTone = "info" | "warning" | "success";

export interface Reminder {
  id: string;
  text: string;
  tone: ReminderTone;
}

const isToday = (iso: string) => {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
};

export function buildReminders(transactions: Transaction[]): Reminder[] {
  const today = transactions.filter((t) => isToday(t.createdAt));
  const kirim = today.filter((t) => t.type === "kirim").reduce((s, t) => s + t.amount, 0);
  const chiqim = today.filter((t) => t.type === "chiqim").reduce((s, t) => s + t.amount, 0);

  const out: Reminder[] = [];

  if (today.length === 0) {
    out.push({
      id: "no-tx-today",
      text: "Bugun hali kirim/chiqim kiritilmadi. Bugungi hisobotni yozdingizmi?",
      tone: "warning",
    });
  } else {
    out.push({
      id: "today-stat",
      text: `Bugun: kirim ${fmtMoney(kirim)}, chiqim ${fmtMoney(chiqim)} (${today.length} ta yozuv).`,
      tone: chiqim > kirim ? "warning" : "success",
    });
  }

  if (chiqim > kirim && today.length > 0) {
    out.push({
      id: "negative-today",
      text: `Diqqat: bugun chiqim kirimdan ${fmtMoney(chiqim - kirim)} ko'p.`,
      tone: "warning",
    });
  }

  // Kun oxiri turtki (soat 17:00 dan keyin)
  if (new Date().getHours() >= 17) {
    out.push({
      id: "evening-report",
      text: "Kun yakunlanmoqda — bugungi hisobotni yakunlab, AI xulosani oling.",
      tone: "info",
    });
  }

  return out;
}
