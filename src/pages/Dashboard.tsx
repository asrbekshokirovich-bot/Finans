import { TrendingUp, TrendingDown, Wallet, Building2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import StatCard from "../components/StatCard";
import { useFinans } from "../lib/store";
import { fmtMoney, sourceLabel, sourceColor, channelLabel, channelColor } from "../lib/format";

export default function Dashboard() {
  const { totals, bySource, byChannel, accounts, transactions } = useFinans();

  const barData = bySource.map((s) => ({
    name: sourceLabel[s.source],
    Kirim: s.kirim,
    Chiqim: s.chiqim,
  }));

  const pieData = bySource
    .filter((s) => s.kirim > 0)
    .map((s) => ({ name: sourceLabel[s.source], value: s.kirim, color: sourceColor[s.source] }));

  const cardBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Umumiy ko'rinish</h1>
        <p className="text-slate-500 text-sm">Barcha bizneslar bo'yicha birlashgan moliya</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Umumiy kirim" value={fmtMoney(totals.kirim)} accent="#10b981" icon={<TrendingUp size={20} />} />
        <StatCard label="Umumiy chiqim" value={fmtMoney(totals.chiqim)} accent="#ef4444" icon={<TrendingDown size={20} />} />
        <StatCard
          label="Sof foyda"
          value={fmtMoney(totals.foyda)}
          accent={totals.foyda >= 0 ? "#4f46e5" : "#ef4444"}
          icon={<Building2 size={20} />}
        />
        <StatCard label="Kartalar/kassa qoldig'i" value={fmtMoney(cardBalance)} accent="#0ea5e9" icon={<Wallet size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-semibold mb-4">Biznes bo'yicha kirim / chiqim</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis tickFormatter={(v) => `${v / 1_000_000}M`} fontSize={12} />
              <Tooltip formatter={(v: number) => fmtMoney(v)} />
              <Bar dataKey="Kirim" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Chiqim" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Kirim manbalari</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80}>
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => fmtMoney(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-1">Ma'lumot manbalari bo'yicha</h2>
        <p className="text-xs text-slate-400 mb-4">Kirim/chiqim Telegram bot va saytdagi ma'lumotlardan yig'iladi</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {byChannel.map((c) => (
            <div key={c.channel} className="border border-slate-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: channelColor[c.channel] }} />
                <span className="font-medium text-sm">{channelLabel[c.channel]}</span>
                <span className="text-xs text-slate-400 ml-auto">{c.count} ta</span>
              </div>
              <div className="text-xs text-emerald-600">Kirim: {fmtMoney(c.kirim)}</div>
              <div className="text-xs text-red-500">Chiqim: {fmtMoney(c.chiqim)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">So'nggi yozuvlar</h2>
        <div className="space-y-2">
          {transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: t.type === "kirim" ? "#10b981" : "#ef4444" }}
                />
                {t.note}
              </span>
              <span className={t.type === "kirim" ? "text-emerald-600" : "text-red-500"}>
                {t.type === "kirim" ? "+" : "−"}
                {fmtMoney(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
