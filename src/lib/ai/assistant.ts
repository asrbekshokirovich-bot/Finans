import { geminiGenerate, aiEnabled } from "./gemini";
import { parseAmount } from "./numberWords";
import type { BusinessSource, TxCategory, TxType } from "../types";
import { fmtMoney } from "../format";

export { aiEnabled };

// ── Ovozli/matn yozuvni tahlil qilib kirim-chiqim maydonlariga aylantirish ──

export interface ParsedTx {
  type: TxType;
  amount: number;
  category: TxCategory;
  source: BusinessSource;
  note: string;
}

const sources: BusinessSource[] = ["uzum", "yandex", "alicargo", "store", "click", "payme", "naqd", "boshqa"];
const categories: TxCategory[] = ["sotuv", "cargo", "tovar_xarid", "maosh", "ijara", "reklama", "patent", "komissiya", "boshqa"];

// Mock fallback (kalitsiz holatda) — o'zbek + rus + jonli til qoidalari bilan
function mockParse(text: string): ParsedTx {
  const t = text.toLowerCase().replace(/[’`]/g, "'");

  // Summa — so'z bilan ham, raqam bilan ham
  const amount = parseAmount(t);

  // Kirim/chiqim aniqlash — fe'l va kalit so'zlar (o'zbek + rus + jonli)
  // Pul KIRDI (kirim): kimdir berdi/o'tkazdi/tashladi, sotildi, tushdi, keldi
  const kirimRe =
    /\b(kirim|kirdi|kird|tushdi|tushum|keldi|kel|sot(d|i|u|v)|sotildi|sotdim|berishdi|berdi|o'tkazishdi|o'tkazdi|tashlashdi|tashladi|oldim|olindi|qaytdi)\b|приход|продаж|продал|пришл|поступил|получил|оплатил[аи]|закинул|перевел[аи]|вернул/;
  // Pul CHIQDI (chiqim): men berdim/to'ladim/o'tkazdim, xarid, to'lov
  const chiqimRe =
    /\b(chiqim|chiqdi|berdim|to'ladim|to'lov|to'la|xarid|sotib oldim|harid|o'tkazdim|sarfladim|ketdi)\b|расход|оплатил|заплатил|потратил|купил|перевёл|отдал/;

  let type: TxType = "chiqim";
  if (kirimRe.test(t) && !chiqimRe.test(t)) type = "kirim";
  else if (chiqimRe.test(t) && !kirimRe.test(t)) type = "chiqim";
  else if (/\b(berishdi|berdi|o'tkazishdi|tushdi|keldi|sot)\b/.test(t)) type = "kirim"; // 3-shaxs "berishdi" = menga berdi
  else if (/\b(berdim|to'ladim|oldim)\b/.test(t)) type = "chiqim";

  let category: TxCategory = "boshqa";
  if (/cargo|yetkaz|карго|доставк/.test(t)) category = "cargo";
  else if (/maosh|oylik|зарплат|зп/.test(t)) category = "maosh";
  else if (/sot|продаж|продал/.test(t)) category = "sotuv";
  else if (/ijara|аренд/.test(t)) category = "ijara";
  else if (/reklama|реклам/.test(t)) category = "reklama";
  else if (/patent|soliq|налог/.test(t)) category = "patent";
  else if (/tovar|xarid|закуп|товар/.test(t)) category = "tovar_xarid";
  else if (/komiss|комисси/.test(t)) category = "komissiya";

  let source: BusinessSource = "naqd";
  if (/uzum|узум/.test(t)) source = "uzum";
  else if (/yandex|яндекс/.test(t)) source = "yandex";
  else if (/click|клик/.test(t)) source = "click";
  else if (/payme|пайми/.test(t)) source = "payme";
  else if (/cargo|ali|карго/.test(t)) source = "alicargo";
  else if (/do'kon|dukon|магазин|store/.test(t)) source = "store";

  return { type, amount, category, source, note: text.trim() || "Ovozli yozuv" };
}

export async function parseTransactionFromText(text: string): Promise<ParsedTx> {
  if (!aiEnabled) return mockParse(text);

  const prompt = `Sen O'zbekistondagi biznes uchun moliya yordamchisisan. Xabar o'zbek tilida, rus tilida yoki ARALASH (kod-almashinuv), jonli/ko'cha tilida bo'lishi mumkin. Shevalar va so'z bilan aytilgan raqamlarni ham tushun.

Xabar: "${text}"

Quyidagilarni ajrat va FAQAT JSON qaytar (boshqa matn yozma):
- type: "kirim" (pul kelgan: sotuv, kimdir to'lagan/o'tkazgan/bergan, tushum) yoki "chiqim" (pul ketgan: men to'ladim, xarid, cargo, maosh)
- amount: butun raqam so'mda. So'z bilan aytilsa hisobla: "yuz ming"=100000, "ikki yarim million"=2500000, "besh yuz ming"=500000, "сто тысяч"=100000, "два лимона"=2000000.
- category: ${categories.join(", ")}
- source: ${sources.join(", ")}
- note: qisqa izoh (asl tilda)

Muhim: "berishdi/o'tkazishdi/tushdi/keldi" = kirim. "berdim/to'ladim/oldim" = chiqim.

JSON namuna: {"type":"kirim","amount":100000,"category":"sotuv","source":"naqd","note":"Mijoz yuz ming berdi"}`;

  try {
    const raw = await geminiGenerate(prompt, { json: true });
    const parsed = JSON.parse(raw) as Partial<ParsedTx>;
    return {
      type: parsed.type === "kirim" ? "kirim" : "chiqim",
      amount: Number(parsed.amount) || 0,
      category: categories.includes(parsed.category as TxCategory) ? (parsed.category as TxCategory) : "boshqa",
      source: sources.includes(parsed.source as BusinessSource) ? (parsed.source as BusinessSource) : "naqd",
      note: parsed.note?.trim() || text.trim(),
    };
  } catch {
    return mockParse(text);
  }
}

// ── Kunlik moliya xulosasi (AI) ──

export interface DailyStats {
  kirim: number;
  chiqim: number;
  foyda: number;
  txCount: number;
}

// ── Ishchi hisobotini AI bilan tuzish/qisqartirish ──
export async function summarizeWorkerReport(text: string): Promise<string> {
  if (!aiEnabled) {
    // Mock: oddiy qisqartma
    const clean = text.trim().replace(/\s+/g, " ");
    const short = clean.length > 140 ? clean.slice(0, 140) + "…" : clean;
    return `Xulosa: ${short}`;
  }
  const prompt = `Sen menejer yordamchisisan. Ishchining kunlik hisobotini o'zbek tilida 1-2 gapda tuzib ber, asosiy raqamlarni (sotuv, qoldiq, bajarilgan ish) ajratib ko'rsat. Hisobot: "${text}"`;
  try {
    return await geminiGenerate(prompt);
  } catch {
    return `Xulosa: ${text.slice(0, 140)}`;
  }
}

export async function generateDailySummary(s: DailyStats): Promise<string> {
  if (!aiEnabled) {
    const holat = s.foyda >= 0 ? "ijobiy" : "salbiy";
    return `Bugun ${s.txCount} ta yozuv. Kirim ${fmtMoney(s.kirim)}, chiqim ${fmtMoney(s.chiqim)}. Sof natija ${holat}: ${fmtMoney(s.foyda)}.`;
  }
  const prompt = `O'zbek tilida 2 gaplik qisqa moliya xulosasi yoz. Kirim: ${s.kirim}, chiqim: ${s.chiqim}, foyda: ${s.foyda}, yozuvlar soni: ${s.txCount}. Tavsiya ham qo'sh.`;
  try {
    return await geminiGenerate(prompt);
  } catch {
    return `Bugun ${s.txCount} ta yozuv. Sof natija: ${fmtMoney(s.foyda)}.`;
  }
}
