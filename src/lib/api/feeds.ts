import type { Transaction } from "../types";
import { fetchTelegramTransactions } from "./telegramFeed";
import { fetchSaytTransactions } from "./saytFeed";

// ── Barcha manbalarni birlashtiruvchi qatlam ──
// Kirim/chiqim hisobi shu yerda yig'iladigan ma'lumotlardan chiqadi:
//   1) Telegram bot (ishchilar xabarlari)
//   2) Sayt (marketplace / onlayn do'kon / Payme / Click)
// Adminning qo'lda kiritgan yozuvlari ("qol" kanal) store'da ustiga qo'shiladi.

export async function fetchAllTransactions(): Promise<Transaction[]> {
  const [telegram, sayt] = await Promise.all([
    fetchTelegramTransactions(),
    fetchSaytTransactions(),
  ]);
  // Yangidan eskiga tartiblab birlashtiramiz
  return [...telegram, ...sayt].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
