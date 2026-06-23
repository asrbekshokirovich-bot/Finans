import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Square, Sparkles, Send, Loader2, FileText, ArrowLeftRight } from "lucide-react";
import { useFinans } from "../lib/store";
import { useToast } from "../lib/toast";
import { sourceLabel, categoryLabel, fmtMoney, fmtDate } from "../lib/format";
import type { BusinessSource, TxCategory, TxType } from "../lib/types";
import { parseTransactionFromText, summarizeWorkerReport, aiEnabled } from "../lib/ai/assistant";
import { startDictation, voiceSupported } from "../lib/ai/voice";

const sources: BusinessSource[] = ["uzum", "yandex", "alicargo", "store", "click", "payme", "naqd", "boshqa"];
const categories: TxCategory[] = ["sotuv", "cargo", "tovar_xarid", "maosh", "ijara", "reklama", "patent", "komissiya", "boshqa"];

type Tab = "tx" | "report";

export default function AddTransaction() {
  const { addTransaction, addReport, reports, workers, currentUser, canAssignTasks } = useFinans();
  const toast = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("tx");

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold">Yangi yozuv</h1>

      {/* Tab almashtirish */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-sm w-full sm:w-fit">
        <button
          onClick={() => setTab("tx")}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium transition ${
            tab === "tx" ? "bg-white shadow-sm text-brand-700" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <ArrowLeftRight size={15} /> Kirim / Chiqim
        </button>
        <button
          onClick={() => setTab("report")}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium transition ${
            tab === "report" ? "bg-white shadow-sm text-brand-700" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileText size={15} /> AI hisobot
        </button>
      </div>

      {tab === "tx" ? (
        <TransactionForm addTransaction={addTransaction} workers={workers} toast={toast} navigate={navigate} />
      ) : (
        <ReportForm
          addReport={addReport}
          reports={reports}
          currentUser={currentUser}
          canAssignTasks={canAssignTasks}
          toast={toast}
        />
      )}
    </div>
  );
}

// ─────────────────────────── Kirim / Chiqim formasi ───────────────────────────
function TransactionForm({ addTransaction, workers, toast, navigate }: any) {
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
  const [voiceError, setVoiceError] = useState(false); // AI to'liq aniqlay olmadi
  const [savedFlash, setSavedFlash] = useState(false);

  const applyParsed = async (text: string) => {
    setHeard(text);
    setThinking(true);
    setVoiceError(false);
    setSavedFlash(false);
    const p = await parseTransactionFromText(text);
    setType(p.type);
    setAmount(p.amount ? String(p.amount) : "");
    setCategory(p.category);
    setSource(p.source);
    setNote(p.note);
    setViaVoice(true);
    setThinking(false);

    // To'liq aniqlandimi? Summa > 0 va kategoriya aniq bo'lsa — AVTOMATIK saqlash
    const ok = p.amount > 0 && p.category !== "boshqa";
    if (ok) {
      addTransaction({ type: p.type, amount: p.amount, category: p.category, source: p.source, note: p.note || "—", createdBy, viaVoice: true });
      toast(`Avtomatik saqlandi: ${p.type === "kirim" ? "+" : "−"}${fmtMoney(p.amount)} (${categoryLabel[p.category]})`, "success");
      setSavedFlash(true);
    } else {
      // Aniqlanmadi — qizil, saqlanmaydi, qayta yozish kerak
      setVoiceError(true);
      toast("AI to'liq aniqlay olmadi — tuzating yoki qayta yozing", "warning");
    }
  };

  const handleVoice = () => {
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
        setVoiceError(true);
        toast("Ovoz aniqlanmadi — qayta urinib ko'ring", "warning");
      },
    );
    if (!d) setRecording(false);
  };

  const amountInvalid = !Number(amount);
  const categoryInvalid = category === "boshqa" && voiceError;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num) {
      setVoiceError(true);
      toast("Summa kiritilmadi", "warning");
      return;
    }
    addTransaction({ type, amount: num, category, source, note: note || "—", createdBy, viaVoice });
    toast(`${type === "kirim" ? "Kirim" : "Chiqim"} saqlandi: ${fmtMoney(num)}`, "success");
    navigate("/transactions");
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div
        className={`rounded-2xl p-5 border transition ${
          voiceError ? "bg-red-50 border-red-200" : savedFlash ? "bg-emerald-50 border-emerald-200" : "bg-brand-50 border-brand-100"
        }`}
      >
        <div className={`flex items-center gap-2 font-semibold mb-2 ${voiceError ? "text-red-600" : savedFlash ? "text-emerald-700" : "text-brand-700"}`}>
          <Sparkles size={18} /> Ovozli kiritish (AI)
        </div>
        <p className="text-sm text-slate-600 mb-3">
          Gapirib ayting — to'liq aniqlansa <b>avtomatik saqlanadi</b>.
          <span className="text-slate-400"> {aiEnabled ? "(Gemini ulangan)" : "(AI mock)"}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleVoice}
            disabled={recording || thinking}
            className={`btn ${recording ? "bg-red-500 text-white animate-pulse" : "btn-primary"}`}
          >
            {recording ? <Square size={16} /> : <Mic size={16} />}
            {recording ? "Tinglanmoqda..." : thinking ? "AI tahlil qilmoqda..." : "Gapirib kiritish"}
          </button>
          {(heard || voiceError) && !recording && !thinking && (
            <button type="button" onClick={handleVoice} className="btn-ghost">
              <Mic size={15} /> Qayta yozish
            </button>
          )}
        </div>
        {heard && (
          <p className={`text-xs mt-2 ${voiceError ? "text-red-500" : "text-slate-500"}`}>
            Eshitildi: "{heard}"
            {voiceError && " — to'liq aniqlanmadi, pastdan tuzating yoki qayta yozing"}
            {savedFlash && " ✓ saqlandi"}
          </p>
        )}
      </div>

      <form onSubmit={submit} className="card p-5 space-y-4 animate-slideUp">
        <div className="flex gap-2">
          {(["kirim", "chiqim"] as TxType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition ${
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
            onChange={(e) => { setAmount(e.target.value); setVoiceError(false); }}
            placeholder="0"
            className={`input ${voiceError && amountInvalid ? "border-red-400 ring-2 ring-red-100" : ""}`}
          />
          {amount && Number(amount) > 0 && <span className="text-xs text-slate-400">{fmtMoney(Number(amount))}</span>}
          {voiceError && amountInvalid && <span className="text-xs text-red-500">Summa aniqlanmadi — kiriting</span>}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Manba">
            <select value={source} onChange={(e) => setSource(e.target.value as BusinessSource)} className="input">
              {sources.map((s) => (
                <option key={s} value={s}>{sourceLabel[s]}</option>
              ))}
            </select>
          </Field>
          <Field label="Kategoriya">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value as TxCategory); setVoiceError(false); }}
              className={`input ${categoryInvalid ? "border-red-400 ring-2 ring-red-100" : ""}`}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{categoryLabel[c]}</option>
              ))}
            </select>
            {categoryInvalid && <span className="text-xs text-red-500">Kategoriya aniqlanmadi — tanlang</span>}
          </Field>
        </div>

        <Field label="Izoh">
          <input value={note} onChange={(e) => setNote(e.target.value)} className="input" />
        </Field>

        <Field label="Kim kiritdi">
          <select value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} className="input">
            {workers.map((w: any) => (
              <option key={w.id} value={w.name}>{w.name} — {w.position}</option>
            ))}
          </select>
        </Field>

        <button type="submit" className="btn-primary w-full py-2.5">Saqlash</button>
      </form>
    </div>
  );
}

// ─────────────────────────── AI hisobot formasi ───────────────────────────
function ReportForm({ addReport, reports, currentUser, canAssignTasks, toast }: any) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viaVoice, setViaVoice] = useState(false);

  const visible = canAssignTasks ? reports : reports.filter((r: any) => r.author === currentUser.name);

  const handleVoice = () => {
    if (!voiceSupported()) {
      setText((t) => (t ? t + " " : "") + "Bugun 15 ta buyurtma qadoqladim, 2 million so'm sotuv bo'ldi.");
      setViaVoice(true);
      return;
    }
    setRecording(true);
    startDictation(
      (heard) => {
        setRecording(false);
        setText((t) => (t ? t + " " : "") + heard);
        setViaVoice(true);
      },
      () => setRecording(false),
    );
  };

  const submit = async () => {
    if (!text.trim()) {
      toast("Hisobot matni bo'sh", "warning");
      return;
    }
    setBusy(true);
    const aiSummary = await summarizeWorkerReport(text.trim());
    addReport({ author: currentUser.name, text: text.trim(), aiSummary, viaVoice });
    setBusy(false);
    setText("");
    setViaVoice(false);
    toast("Hisobot AI orqali topshirildi", "success");
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="card p-5 space-y-3 animate-slideUp">
        <div className="flex items-center gap-2 text-brand-700 font-semibold">
          <Sparkles size={18} /> Kunlik hisobot — {aiEnabled ? "Gemini AI" : "AI (mock)"}
        </div>
        <p className="text-sm text-slate-500">Kun ishini yozing yoki gapiring — AI tuzib rahbarga yetkazadi.</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Masalan: Bugun 15 ta buyurtma qadoqladim, 2 mln so'm sotuv, omborda 3 ta tovar tugadi."
          className="input resize-none"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleVoice}
            disabled={recording}
            className={`btn ${recording ? "bg-red-500 text-white animate-pulse" : "btn-ghost"}`}
          >
            {recording ? <Square size={15} /> : <Mic size={15} />}
            {recording ? "Tinglanmoqda..." : "Ovozdan"}
          </button>
          <button onClick={submit} disabled={busy} className="btn-primary">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {busy ? "AI tahlil qilmoqda..." : "Topshirish"}
          </button>
          <span className="text-xs text-slate-400">{currentUser.name} nomidan</span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-slate-700">
          {canAssignTasks ? "Barcha hisobotlar" : "Mening hisobotlarim"} ({visible.length})
        </h2>
        {visible.length === 0 ? (
          <div className="text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl py-12">
            Hozircha hisobot yo'q.
          </div>
        ) : (
          visible.map((r: any) => (
            <div key={r.id} className="card p-4 animate-slideUp">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 grid place-items-center font-semibold text-sm">
                    {r.author.charAt(0)}
                  </span>
                  <span className="font-medium">{r.author}</span>
                  {r.viaVoice && <Mic size={13} className="text-brand-500" />}
                </div>
                <span className="text-xs text-slate-400">{fmtDate(r.createdAt)}</span>
              </div>
              <div className="flex items-start gap-2 bg-brand-50/60 rounded-lg p-3 text-sm">
                <Sparkles size={15} className="text-brand-500 shrink-0 mt-0.5" />
                <span>{r.aiSummary}</span>
              </div>
              <details className="mt-2 text-xs text-slate-400">
                <summary className="cursor-pointer flex items-center gap-1">
                  <FileText size={12} /> Asl matn
                </summary>
                <p className="mt-1 text-slate-500">{r.text}</p>
              </details>
            </div>
          ))
        )}
      </div>
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
