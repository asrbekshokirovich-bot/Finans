import { useState } from "react";
import { Mic, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useFinans } from "../lib/store";
import { fmtMoney, fmtDate, sourceLabel, sourceColor, categoryLabel, channelLabel } from "../lib/format";
import type { TxType } from "../lib/types";

export default function Transactions() {
  const { transactions } = useFinans();
  const [filter, setFilter] = useState<"all" | TxType>("all");
  const [query, setQuery] = useState("");

  const list = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .filter((t) => t.note.toLowerCase().includes(query.toLowerCase()));

  const kirim = list.filter((t) => t.type === "kirim").reduce((s, t) => s + t.amount, 0);
  const chiqim = list.filter((t) => t.type === "chiqim").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tranzaksiyalar</h1>
          <p className="text-slate-500 text-sm">
            {list.length} ta yozuv · kirim {fmtMoney(kirim)} · chiqim {fmtMoney(chiqim)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qidirish..."
            className="input w-40"
          />
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg text-sm">
            {(["all", "kirim", "chiqim"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md capitalize transition ${
                  filter === f ? "bg-white shadow-sm font-medium" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f === "all" ? "Hammasi" : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Izoh</th>
              <th className="px-4 py-3 font-medium">Manba</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Kategoriya</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Kanal</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Kim</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Sana</th>
              <th className="px-4 py-3 font-medium text-right">Summa</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 ${
                        t.type === "kirim" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                      }`}
                    >
                      {t.type === "kirim" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    </span>
                    {t.viaVoice && <Mic size={13} className="text-brand-500" />}
                    <span className="truncate max-w-[180px]">{t.note}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="chip"
                    style={{ background: `${sourceColor[t.source]}18`, color: sourceColor[t.source] }}
                  >
                    {sourceLabel[t.source]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{categoryLabel[t.category]}</td>
                <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{channelLabel[t.channel]}</td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{t.createdBy}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{fmtDate(t.createdAt)}</td>
                <td
                  className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${
                    t.type === "kirim" ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {t.type === "kirim" ? "+" : "−"}
                  {fmtMoney(t.amount)}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  Yozuv topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
