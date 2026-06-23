import { geminiGenerate, aiEnabled } from "./gemini";
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

// Mock fallback (kalitsiz holatda) — matndan oddiy qoidalar bilan ajratadi
function mockParse(text: string): ParsedTx {
  const t = text.toLowerCase();
  const amtMatch = t.match(/(\d[\d\s.,]*)\s*(mln|million|ming|so'm|som)?/);
  let amount = 0;
  if (amtMatch) {
    amount = Number(amtMatch[1].replace(/[\s.,]/g, ""));
    if (/mln|million/.test(amtMatch[2] ?? "")) amount *= 1_000_000;
    else if (/ming/.test(amtMatch[2] ?? "")) amount *= 1_000;
  }
  const type: TxType = /sot|tushum|kirim|keldi/.test(t) ? "kirim" : "chiqim";
  let category: TxCategory = "boshqa";
  if (/cargo|yetkaz/.test(t)) category = "cargo";
  else if (/maosh|oylik/.test(t)) category = "maosh";
  else if (/sot/.test(t)) category = "sotuv";
  else if (/ijara/.test(t)) category = "ijara";
  else if (/reklama/.test(t)) category = "reklama";
  else if (/patent|soliq/.test(t)) category = "patent";
  let source: BusinessSource = "naqd";
  if (/uzum/.test(t)) source = "uzum";
  else if (/yandex/.test(t)) source = "yandex";
  else if (/click/.test(t)) source = "click";
  else if (/payme/.test(t)) source = "payme";
  else if (/cargo|ali/.test(t)) source = "alicargo";
  return { type, amount, category, source, note: text.trim() || "Ovozli yozuv" };
}

export async function parseTransactionFromText(text: string): Promise<ParsedTx> {
  if (!aiEnabled) return mockParse(text);

  const prompt = `Sen moliya yordamchisisan. Quyidagi o'zbekcha xabardan kirim/chiqim yozuvini ajrat va FAQAT JSON qaytar.
Xabar: "${text}"
Maydonlar:
- type: "kirim" yoki "chiqim"
- amount: raqam (so'mda, masalan 1500000)
- category: ${categories.join(", ")}
- source: ${sources.join(", ")}
- note: qisqa izoh
JSON namuna: {"type":"chiqim","amount":1500000,"category":"cargo","source":"alicargo","note":"Cargo to'lovi"}`;

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
