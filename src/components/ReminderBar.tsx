import { useMemo, useState } from "react";
import { Bell, X, Sparkles, Loader2 } from "lucide-react";
import { useFinans } from "../lib/store";
import { buildReminders, type ReminderTone } from "../lib/reminders";
import { generateDailySummary, aiEnabled } from "../lib/ai/assistant";

const toneStyle: Record<ReminderTone, string> = {
  info: "bg-brand-50 border-brand-100 text-brand-700",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
};

export default function ReminderBar() {
  const { transactions, totals } = useFinans();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const reminders = useMemo(
    () => buildReminders(transactions).filter((r) => !dismissed.includes(r.id)),
    [transactions, dismissed],
  );

  async function askSummary() {
    setLoading(true);
    const today = transactions.filter((t) => {
      const d = new Date(t.createdAt);
      const n = new Date();
      return d.toDateString() === n.toDateString();
    });
    const txt = await generateDailySummary({
      kirim: totals.kirim,
      chiqim: totals.chiqim,
      foyda: totals.foyda,
      txCount: today.length,
    });
    setSummary(txt);
    setLoading(false);
  }

  if (reminders.length === 0 && !summary) return null;

  return (
    <div className="space-y-2 mb-5">
      {reminders.map((r) => (
        <div key={r.id} className={`flex items-center gap-2 text-sm border rounded-lg px-3 py-2 ${toneStyle[r.tone]}`}>
          <Bell size={15} className="shrink-0" />
          <span className="flex-1">{r.text}</span>
          {r.id === "evening-report" || r.id === "no-tx-today" ? (
            <button
              onClick={askSummary}
              disabled={loading}
              className="inline-flex items-center gap-1 text-xs font-medium bg-white/70 hover:bg-white rounded-md px-2 py-1"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              AI xulosa
            </button>
          ) : null}
          <button onClick={() => setDismissed((d) => [...d, r.id])} className="opacity-60 hover:opacity-100">
            <X size={15} />
          </button>
        </div>
      ))}

      {summary && (
        <div className="flex items-start gap-2 text-sm border border-brand-100 bg-white rounded-lg px-3 py-2">
          <Sparkles size={15} className="text-brand-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-[11px] text-slate-400 mb-0.5">{aiEnabled ? "Gemini AI xulosasi" : "AI xulosa (mock)"}</div>
            {summary}
          </div>
          <button onClick={() => setSummary("")} className="opacity-60 hover:opacity-100">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
