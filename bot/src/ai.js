// ════════════════════════════════════════════════════════════════════════
// AI — ovozni matnga (STT) va matnni tuzilgan yozuvga aylantirish
//
// Hozircha MAKET:
//   - transcribeVoice: GEMINI_API_KEY bo'lsa Gemini audio, bo'lmasa stub matn
//   - parseMessage: o'zbek/rus raqam-so'zlarni va kirim/chiqimni ajratadi
// KEYIN: real Gemini audio + aniqroq tahlil ulanadi.
// ════════════════════════════════════════════════════════════════════════
import { GEMINI_API_KEY } from "./config.js";

// ── O'zbek + rus raqam-so'z tahlilchisi (saytdagi numberWords bilan bir xil) ──
const UNITS = {
  bir: 1, ikki: 2, uch: 3, "to'rt": 4, tort: 4, besh: 5, olti: 6, yetti: 7,
  sakkiz: 8, "to'qqiz": 9, toqqiz: 9, "o'n": 10, on: 10, yigirma: 20, "o'ttiz": 30,
  ottiz: 30, qirq: 40, ellik: 50, oltmish: 60, yetmish: 70, sakson: 80, "to'qson": 90, toqson: 90,
  один: 1, одна: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5, шесть: 6, семь: 7,
  восемь: 8, девять: 9, десять: 10, двадцать: 20, тридцать: 30, сорок: 40, пятьдесят: 50,
  сто: 100, двести: 200, триста: 300, пятьсот: 500,
};
const SCALES = {
  yuz: 100, ming: 1000, "тысяча": 1000, "тысяч": 1000, тыс: 1000,
  million: 1e6, mln: 1e6, limon: 1e6, миллион: 1e6, миллиона: 1e6, млн: 1e6, лимон: 1e6,
  milliard: 1e9, mlrd: 1e9, миллиард: 1e9,
};

function wordsToNumber(tokens) {
  let result = 0, current = 0, touched = false;
  for (const tok of tokens) {
    if (tok in UNITS) { current += UNITS[tok]; touched = true; }
    else if (tok === "yuz") { current = (current === 0 ? 1 : current) * 100; touched = true; }
    else if (tok in SCALES) { result += (current === 0 ? 1 : current) * SCALES[tok]; current = 0; touched = true; }
  }
  return touched ? result + current : 0;
}

export function parseAmount(raw) {
  const text = raw.toLowerCase().replace(/[’`]/g, "'");
  const digit = text.match(/(\d[\d\s.,]*\d|\d)\s*(mln|млн|million|миллион|limon|лимон|ming|тыс|тысяч|k|к)?/);
  if (digit) {
    let num = parseFloat(digit[1].replace(/\s/g, "").replace(",", "."));
    const suf = digit[2] ?? "";
    if (/mln|млн|million|миллион|limon|лимон/.test(suf)) num *= 1e6;
    else if (/ming|тыс|тысяч|k|к/.test(suf)) num *= 1000;
    if (!Number.isNaN(num) && num > 0) return Math.round(num);
  }
  const tokens = text.split(/[^a-zа-яё']+/i).filter(Boolean);
  let value = wordsToNumber(tokens);
  // "yarim" / "пол" — yarmini qo'shamiz
  if (/\b(yarim|yarm|пол|половина)\b/.test(text)) {
    const mln = /million|миллион|mln|млн|limon/.test(text);
    const ming = /\bming\b|тысяч|тыс/.test(text);
    if (value === 0) value = mln ? 5e5 : ming ? 500 : 0;
    else if (mln && value % 1e6 === 0) value += 5e5;
    else if (ming && value % 1000 === 0) value += 500;
  }
  return value;
}

// Matndan kirim/chiqim yozuvini ajratish
export function parseTransaction(text) {
  const t = text.toLowerCase();
  const amount = parseAmount(t);
  const kirim = /berishdi|berdi|tushdi|tushum|keldi|sot|kirim|приход|продаж|продал|пришл|получил|оплатил[аи]|перевел[аи]/.test(t);
  const chiqim = /berdim|to'ladim|to'lov|xarid|chiqim|oldim|расход|оплатил|потратил|купил|заплатил/.test(t);
  let type = "chiqim";
  if (kirim && !chiqim) type = "kirim";
  let category = "boshqa";
  if (/cargo|yetkaz|карго|доставк/.test(t)) category = "cargo";
  else if (/maosh|oylik|зарплат/.test(t)) category = "maosh";
  else if (/sot|продаж/.test(t)) category = "sotuv";
  else if (/ijara|аренд/.test(t)) category = "ijara";
  else if (/reklama|реклам/.test(t)) category = "reklama";
  else if (/patent|soliq|налог/.test(t)) category = "patent";
  let source = "naqd";
  if (/uzum|узум/.test(t)) source = "uzum";
  else if (/yandex|яндекс/.test(t)) source = "yandex";
  else if (/click|клик/.test(t)) source = "click";
  else if (/payme/.test(t)) source = "payme";
  else if (/cargo|карго/.test(t)) source = "alicargo";
  return { type, amount, category, source, note: text.trim() };
}

// Ovozni matnga aylantirish — HOZIRCHA STUB
export async function transcribeVoice(_buffer) {
  // TODO(keyin): GEMINI_API_KEY bilan Gemini audio yoki Whisper ulanadi.
  //   const text = await geminiAudio(_buffer);
  if (!GEMINI_API_KEY) {
    return "[maket] Uzumdan ikki million so'm tushdi"; // namuna transkripsiya
  }
  // TODO: real STT chaqiruvi
  return "[maket] ovoz qabul qilindi";
}
