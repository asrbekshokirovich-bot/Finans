import { useState } from "react";
import { Sparkles, Mic, Square, Send, Loader2, FileText } from "lucide-react";
import { useFinans } from "../lib/store";
import { useToast } from "../lib/toast";
import { fmtDate } from "../lib/format";
import { summarizeWorkerReport, aiEnabled } from "../lib/ai/assistant";
import { startDictation, voiceSupported } from "../lib/ai/voice";

export default function Reporting() {
  const { reports, addReport, currentUser, canAssignTasks } = useFinans();
  const toast = useToast();

  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viaVoice, setViaVoice] = useState(false);

  // owner/admin barcha hisobotlarni ko'radi, ishchi faqat o'zinikini
  const visible = canAssignTasks ? reports : reports.filter((r) => r.author === currentUser.name);

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
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">AI orqali hisobot topshirish</h1>
        <p className="text-slate-500 text-sm">
          Ishchi kunlik ishini yozadi yoki gapiradi — AI tuzib, rahbarga yetkazadi
        </p>
      </div>

      {/* Hisobot kiritish */}
      <div className="card p-5 space-y-3 animate-slideUp">
        <div className="flex items-center gap-2 text-brand-700 font-semibold">
          <Sparkles size={18} /> Hisobot — {aiEnabled ? "Gemini AI" : "AI (mock)"}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Masalan: Bugun 15 ta buyurtma qadoqladim, 2 million so'm sotuv bo'ldi, omborda 3 ta tovar tugadi."
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

      {/* Topshirilgan hisobotlar */}
      <div className="space-y-3">
        <h2 className="font-semibold text-slate-700">
          {canAssignTasks ? "Barcha hisobotlar" : "Mening hisobotlarim"} ({visible.length})
        </h2>
        {visible.length === 0 ? (
          <div className="text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl py-12">
            Hozircha hisobot yo'q.
          </div>
        ) : (
          visible.map((r) => (
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
