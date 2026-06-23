import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Square, Sparkles } from "lucide-react";
import { useFinans } from "../lib/store";
import { sourceLabel, categoryLabel, fmtMoney } from "../lib/format";
import type { BusinessSource, TxCategory, TxType } from "../lib/types";
import { parseTransactionFromText, aiEnabled } from "../lib/ai/assistant";
import { startDictation, voiceSupported } from "../lib/ai/voice";

const sources: BusinessSource[] = ["uzum", "yandex", "alicargo", "store", "click", "payme", "naqd", "boshqa"];
const categories: TxCategory[] = ["sotuv", "cargo", "tovar_xarid", "maosh", "ijara", "reklama", "patent", "komissiya", "boshqa"];

export default function AddTransaction() {
  const { addTransaction, workers } = useFinans();
  const navigate = useNavigate();

  const [type, setType] = useState<TxType>("chiqim");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TxCategory>("cargo");
  const [source, setSource] = useState<BusinessSource>("alicargo");
  const [note, setNote] = useState("");
  const [createdBy, setCreatedBy] = useState(workers[0].name);
  const [recording, setRecording] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [heard, setHeard] = useState("");
  const [viaVoice, setViaVoice] = useState(false);

  const applyParsed = async (text: string) => {
    setHeard(text);
    setThinking(true);
    const p = await parseTransactionFromText(text);
    setType(p.type);
    setAmount(String(p.amount));
    setCategory(p.category);
    setSource(p.source);
    setNote(p.note);
    setViaVoice(true);
    setThinking(false);
  };

  const handleVoice = () => {
    // Real ovozli kiritish — agar brauzer qo'llamasa, namuna matn bilan
    if (!voiceSupported()) {
      applyParsed("Alicargo cargo to'lovi 1500000 so'm");
      return;
    }
    setRecording(true);
    const d = startDictation(
      (text) => {
        setRecording(false);
        applyParsed(text);
      },
      () => {
        setRecording(false);
        applyParsed("Alicargo cargo to'lovi 1500000 so'm");
      },
    );
    if (!d) setRecording(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num) return;
    addTransaction({ type, amount: num, category, source, note: note || "—", createdBy, viaVoice });
    navigate("/transactions");
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold">Yangi yozuv</h1>

      {/* Ovozli kiritish bloki */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-5">
        <div className="flex items-center gap-2 text-brand-700 font-semibold mb-2">
          <Sparkles size={18} /> Ovozli kiritish (AI)
        </div>
        <p className="text-sm text-slate-600 mb-3">
          Ishchi gapirib kirim/chiqimni aytadi — {aiEnabled ? "Gemini AI" : "tizim"} avtomatik to'ldiradi.
          <span className="text-slate-400"> {aiEnabled ? "(Gemini ulangan)" : "(AI kalitsiz — mock)"}</span>
        </p>
        <button
          type="button"
          onClick={handleVoice}
          disabled={recording || thinking}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium ${
            recording ? "bg-red-500 animate-pulse" : "bg-brand-600 hover:bg-brand-700"
          }`}
        >
          {recording ? <Square size={16} /> : <Mic size={16} />}
          {recording ? "Tinglanmoqda..." : thinking ? "AI tahlil qilmoqda..." : "Gapirib kiritish"}
        </button>
        {heard && <p className="text-xs text-slate-500 mt-2">Eshitildi: "{heard}"</p>}
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex gap-2">
          {(["kirim", "chiqim"] as TxType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border ${
                type === t
                  ? t === "kirim"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-red-50 border-red-300 text-red-700"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Field label="Summa (so'm)">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          {amount && <span className="text-xs text-slate-400">{fmtMoney(Number(amount))}</span>}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Manba">
            <select value={source} onChange={(e) => setSource(e.target.value as BusinessSource)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              {sources.map((s) => (
                <option key={s} value={s}>{sourceLabel[s]}</option>
              ))}
            </select>
          </Field>
          <Field label="Kategoriya">
            <select value={category} onChange={(e) => setCategory(e.target.value as TxCategory)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              {categories.map((c) => (
                <option key={c} value={c}>{categoryLabel[c]}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Izoh">
          <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        </Field>

        <Field label="Kim kiritdi">
          <select value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
            {workers.map((w) => (
              <option key={w.id} value={w.name}>{w.name} — {w.position}</option>
            ))}
          </select>
        </Field>

        <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-medium">
          Saqlash
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-600 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
