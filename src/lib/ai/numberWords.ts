// ════════════════════════════════════════════════════════════════════════
// So'z bilan aytilgan summani raqamga aylantirish — o'zbek + rus + jonli til
//
// Misollar:
//   "yuz ming so'm"          -> 100000
//   "ikki yarim million"     -> 2500000
//   "besh yuz ming"          -> 500000
//   "1.5 mln" / "1,5 млн"    -> 1500000
//   "uch yuz ellik ming"     -> 350000
//   "сто тысяч сум"          -> 100000
//   "два миллиона"           -> 2000000
//   "500к" / "2 limon"       -> 500000 / 2000000 (jonli til)
// ════════════════════════════════════════════════════════════════════════

// Birlik va o'nliklar (qiymat qo'shiladi)
const UNITS: Record<string, number> = {
  // o'zbek
  "nol": 0, "bir": 1, "ikki": 2, "uch": 3, "tort": 4, "to'rt": 4, "besh": 5,
  "olti": 6, "yetti": 7, "sakkiz": 8, "toqqiz": 9, "to'qqiz": 9,
  "on": 10, "o'n": 10, "yigirma": 20, "ottiz": 30, "o'ttiz": 30, "qirq": 40,
  "ellik": 50, "oltmish": 60, "yetmish": 70, "sakson": 80, "toqson": 90, "to'qson": 90,
  // rus
  "ноль": 0, "один": 1, "одна": 1, "два": 2, "две": 2, "три": 3, "четыре": 4,
  "пять": 5, "шесть": 6, "семь": 7, "восемь": 8, "девять": 9,
  "десять": 10, "двадцать": 20, "тридцать": 30, "сорок": 40, "пятьдесят": 50,
  "шестьдесят": 60, "семьдесят": 70, "восемьдесят": 80, "девяносто": 90,
  "сто": 100, "двести": 200, "триста": 300, "четыреста": 400, "пятьсот": 500,
  "шестьсот": 600, "семьсот": 700, "восемьсот": 800, "девятьсот": 900,
};

// Masshtab so'zlari (ko'paytiradi)
const SCALES: Record<string, number> = {
  "yuz": 100,
  "ming": 1000, "тысяча": 1000, "тысяч": 1000, "тысячи": 1000, "тыс": 1000,
  "million": 1_000_000, "mln": 1_000_000, "limon": 1_000_000, // "limon" — jonli til
  "миллион": 1_000_000, "миллиона": 1_000_000, "миллионов": 1_000_000, "млн": 1_000_000,
  "milliard": 1_000_000_000, "mlrd": 1_000_000_000, "миллиард": 1_000_000_000, "млрд": 1_000_000_000,
};

const HALF = /\b(yarim|yarm|пол|половина)\b/;

// Matnni tokenlarga ajratib, raqam yig'amiz
function wordsToNumber(tokens: string[]): number {
  let result = 0;
  let current = 0;
  let touched = false;

  for (const tok of tokens) {
    if (tok in UNITS) {
      current += UNITS[tok];
      touched = true;
    } else if (tok === "yuz") {
      current = (current === 0 ? 1 : current) * 100;
      touched = true;
    } else if (tok in SCALES) {
      const scale = SCALES[tok];
      result += (current === 0 ? 1 : current) * scale;
      current = 0;
      touched = true;
    }
    // boshqa so'zlar e'tiborsiz
  }
  result += current;
  return touched ? result : 0;
}

export function parseAmount(raw: string): number {
  const text = raw.toLowerCase().replace(/[’`]/g, "'");

  // 1) To'g'ridan-to'g'ri raqam (1500000, 1.5, 1,5, "500к", "2k")
  const digit = text.match(/(\d[\d\s.,]*\d|\d)\s*(mln|млн|million|миллион|limon|лимон|ming|тыс|тысяч|k|к|so'm|сум|sum)?/);
  if (digit) {
    let num = parseFloat(digit[1].replace(/\s/g, "").replace(",", "."));
    const suffix = digit[2] ?? "";
    if (/mln|млн|million|миллион|limon|лимон/.test(suffix)) num *= 1_000_000;
    else if (/ming|тыс|тысяч|k|к/.test(suffix)) num *= 1_000;
    if (!Number.isNaN(num) && num > 0) {
      // "1.5" kabi kichik son va so'z (million/ming) keyin kelsa yuqorida hisoblandi
      return Math.round(num);
    }
  }

  // 2) So'z bilan: tokenlarga ajratamiz
  const tokens = text.split(/[^a-zа-яё'ʼ]+/i).filter(Boolean);
  let value = wordsToNumber(tokens);

  // "yarim" / "пол" — yarmini qo'shamiz (masalan "ikki yarim million")
  if (HALF.test(text) && value > 0) {
    // eng katta masshtabning yarmi
    const hasMln = /million|миллион|mln|млн|limon/.test(text);
    const hasMing = /\bming\b|тысяч|тыс/.test(text);
    if (hasMln && value % 1_000_000 === 0) value += 500_000;
    else if (hasMing && value % 1_000 === 0) value += 500;
  } else if (HALF.test(text) && value === 0) {
    if (/million|миллион|mln|млн|limon/.test(text)) value = 500_000;
    else if (/\bming\b|тысяч|тыс/.test(text)) value = 500;
  }

  return value;
}
