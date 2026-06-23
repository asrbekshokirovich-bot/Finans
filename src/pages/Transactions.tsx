import { useState } from "react";
import { Mic } from "lucide-react";
import { useFinans } from "../lib/store";
import { fmtMoney, fmtDate, sourceLabel, categoryLabel } from "../lib/format";
import type { TxType } from "../lib/types";

export default function Transactions() {
  const { transactions } = useFinans();
  const [filter, setFilter] = useState<"all" | TxType>("all");

  const list = transactions.filter((t) => filter === "all" || t.type === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tranzaksiyalar</h1>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg text-sm">
          {(["all", "kirim", "chiqim"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md capitalize ${
                filter === f ? "bg-white shadow-sm font-medium" : "text-slate-500"
              }`}
            >
              {f === "all" ? "Hammasi" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Izoh</th>
              <th className="px-4 py-3 font-medium">Manba</th>
              <th className="px-4 py-3 font-medium">Kategoriya</th>
              <th className="px-4 py-3 font-medium">Kim</th>
              <th className="px-4 py-3 font-medium">Sana</th>
              <th className="px-4 py-3 font-medium text-right">Summa</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="px-4 py-3 flex items-center gap-2">
                  {t.viaVoice && <Mic size={14} className="text-brand-500" />}
                  {t.note}
                </td>
                <td className="px-4 py-3">{sourceLabel[t.source]}</td>
                <td className="px-4 py-3 text-slate-500">{categoryLabel[t.category]}</td>
                <td className="px-4 py-3 text-slate-500">{t.createdBy}</td>
                <td className="px-4 py-3 text-slate-500">{fmtDate(t.createdAt)}</td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    t.type === "kirim" ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {t.type === "kirim" ? "+" : "−"}
                  {fmtMoney(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
