import { useFinans } from "../lib/store";
import { fmtMoney, sourceLabel, categoryLabel } from "../lib/format";
import { productPnl } from "../lib/mockData";
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

  // Mahsulot bo'yicha foyda (SKU P&L)
  const products = productPnl
    .map((p) => {
      const profit = p.revenue - p.cost;
      const margin = p.revenue ? (profit / p.revenue) * 100 : 0;
      return { ...p, profit, margin };
    })
    .sort((a, b) => b.profit - a.profit);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Hisobotlar</h1>

      <div className="card p-5">
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

      <div className="card p-5">
        <h2 className="font-semibold mb-4">Chiqimlar kategoriya bo'yicha</h2>
        <div className="space-y-3">
          {cats.map(([cat, val]) => (
            <div key={cat}>
              <div className="flex justify-between text-sm mb-1">
                <span>{categoryLabel[cat]}</span>
                <span className="text-slate-500">{fmtMoney(val)}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${(val / maxCat) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mahsulot bo'yicha foyda — SKU P&L */}
      <div className="card p-5">
        <h2 className="font-semibold mb-1">Mahsulot bo'yicha foyda (SKU)</h2>
        <p className="text-xs text-slate-400 mb-4">Tushum − (tannarx + komissiya + cargo). Real holatda Uzum/Yandex hisobotidan keladi.</p>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[520px]">
            <thead className="text-slate-400 text-left text-xs">
              <tr>
                <th className="px-5 py-2 font-medium">Mahsulot</th>
                <th className="px-3 py-2 font-medium text-right">Sotildi</th>
                <th className="px-3 py-2 font-medium text-right">Tushum</th>
                <th className="px-3 py-2 font-medium text-right">Foyda</th>
                <th className="px-5 py-2 font-medium text-right">Marja</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-3 py-3 text-right text-slate-500">{p.sold}</td>
                  <td className="px-3 py-3 text-right text-slate-500">{fmtMoney(p.revenue)}</td>
                  <td className={`px-3 py-3 text-right font-semibold ${p.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {fmtMoney(p.profit)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`chip ${
                        p.margin >= 25 ? "bg-emerald-50 text-emerald-600" : p.margin >= 10 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"
                      }`}
                    >
                      {p.margin.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
