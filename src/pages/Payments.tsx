import { useEffect, useMemo, useState } from "react";
import { Wallet, CreditCard, Clock, Hash } from "lucide-react";
import { fmtMoney } from "../lib/format";
import { fetchPayments } from "../lib/api/paymentsFeed";
import type { Payment, PaymentProvider, PaymentStatus } from "../lib/types";

const providerStyle: Record<PaymentProvider, { label: string; cls: string }> = {
  payme: { label: "Payme", cls: "bg-cyan-50 text-cyan-600" },
  click: { label: "Click", cls: "bg-blue-50 text-blue-600" },
};
const statusStyle: Record<PaymentStatus, string> = {
  muvaffaqiyatli: "bg-emerald-50 text-emerald-600",
  kutilmoqda: "bg-amber-50 text-amber-600",
  bekor: "bg-red-50 text-red-500",
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("uz-UZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<"all" | PaymentProvider>("all");

  useEffect(() => {
    fetchPayments().then(setPayments);
  }, []);

  const list = useMemo(
    () => payments.filter((p) => filter === "all" || p.provider === filter),
    [payments, filter],
  );

  const jami = list.filter((p) => p.status === "muvaffaqiyatli").reduce((s, p) => s + p.amount, 0);
  const paymeSum = payments.filter((p) => p.provider === "payme" && p.status === "muvaffaqiyatli").reduce((s, p) => s + p.amount, 0);
  const clickSum = payments.filter((p) => p.provider === "click" && p.status === "muvaffaqiyatli").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">To'lovlar — Payme / Click</h1>
        <p className="text-slate-500 text-sm">Kim qancha o'tkazgani · buyurtma ID va yashirilgan karta orqali</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 animate-slideUp">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Jami qabul qilingan</span>
            <span className="w-9 h-9 rounded-xl grid place-items-center bg-brand-50 text-brand-600"><Wallet size={18} /></span>
          </div>
          <div className="mt-3 text-2xl font-bold text-brand-600">{fmtMoney(jami)}</div>
        </div>
        <div className="card p-5 animate-slideUp">
          <div className="text-sm text-slate-500">Payme</div>
          <div className="mt-3 text-xl font-bold text-cyan-600">{fmtMoney(paymeSum)}</div>
        </div>
        <div className="card p-5 animate-slideUp">
          <div className="text-sm text-slate-500">Click</div>
          <div className="mt-3 text-xl font-bold text-blue-600">{fmtMoney(clickSum)}</div>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg text-sm w-fit">
        {(["all", "payme", "click"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md capitalize transition ${
              filter === f ? "bg-white shadow-sm font-medium" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f === "all" ? "Hammasi" : providerStyle[f].label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left text-xs">
            <tr>
              <th className="px-4 py-3 font-medium">Tizim</th>
              <th className="px-4 py-3 font-medium">Buyurtma / Kim</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Karta</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Vaqt</th>
              <th className="px-4 py-3 font-medium">Holat</th>
              <th className="px-4 py-3 font-medium text-right">Summa</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition">
                <td className="px-4 py-3">
                  <span className={`chip ${providerStyle[p.provider].cls}`}>{providerStyle[p.provider].label}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Hash size={13} className="text-slate-300" />
                    {p.orderId}
                  </div>
                  {p.payer && <div className="text-xs text-slate-400 mt-0.5">{p.payer}</div>}
                </td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1.5">
                    <CreditCard size={13} className="text-slate-300" /> {p.cardMask}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} /> {fmtTime(p.paidAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`chip ${statusStyle[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                  {fmtMoney(p.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Hozircha namuna ma'lumot. Real ulanganda: Payme <code>receipts.get_all</code> va Click webhook orqali
        avtomatik to'ladi. To'liq ism banklardan kelmaydi — "kim" buyurtma ID / telefon orqali aniqlanadi.
      </p>
    </div>
  );
}
