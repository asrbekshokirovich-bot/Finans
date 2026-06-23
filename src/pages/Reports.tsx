import { useFinans } from "../lib/store";
import { fmtMoney, sourceLabel, categoryLabel } from "../lib/format";
import type { TxCategory } from "../lib/types";

export default function Reports() {
  const { transactions, bySource, canAssignTasks } = useFinans();

  // Hisobotlar faqat owner/admin uchun
  if (!canAssignTasks) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold">Hisobotlar</h1>
        <div className="mt-4 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl py-12">
          Hisobotlarni faqat egasi (owner) va admin ko'ra oladi.
        </div>
      </div>
    );
  }

  // Kategoriya bo'yicha chiqimlar
  const expByCat = new Map<TxCategory, number>();
  for (const t of transactions) {
    if (t.type === "chiqim") expByCat.set(t.category, (expByCat.get(t.category) ?? 0) + t.amount);
  }
  const cats = [...expByCat.entries()].sort((a, b) => b[1] - a[1]);
  const maxCat = cats[0]?.[1] ?? 1;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Hisobotlar</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold mb-4">Biznes bo'yicha sof natija</h2>
        <div className="space-y-3">
          {bySource
            .slice()
            .sort((a, b) => b.net - a.net)
            .map((s) => (
              <div key={s.source} className="flex items-center justify-between text-sm">
                <span>{sourceLabel[s.source]}</span>
                <span className={s.net >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                  {s.net >= 0 ? "+" : "−"}
                  {fmtMoney(Math.abs(s.net))}
                </span>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold mb-4">Chiqimlar kategoriya bo'yicha</h2>
        <div className="space-y-3">
          {cats.map(([cat, val]) => (
            <div key={cat}>
              <div className="flex justify-between text-sm mb-1">
                <span>{categoryLabel[cat]}</span>
                <span className="text-slate-500">{fmtMoney(val)}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(val / maxCat) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
