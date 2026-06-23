import { CreditCard, Banknote, FileText } from "lucide-react";
import { useFinans } from "../lib/store";
import { fmtMoney } from "../lib/format";
import type { Account } from "../lib/types";

const icon: Record<Account["type"], React.ReactNode> = {
  karta: <CreditCard size={20} />,
  naqd: <Banknote size={20} />,
  patent: <FileText size={20} />,
};
const typeLabel: Record<Account["type"], string> = {
  karta: "Bank kartasi",
  naqd: "Naqd kassa",
  patent: "Patent hisobi",
};

export default function Accounts() {
  const { accounts } = useFinans();
  const total = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Hisoblar va qoldiqlar</h1>
        <p className="text-slate-500 text-sm">Kartalar, naqd kassa va patentdagi pul miqdori</p>
      </div>

      <div className="bg-brand-600 text-white rounded-xl p-5">
        <div className="text-sm opacity-80">Umumiy qoldiq</div>
        <div className="text-3xl font-bold mt-1">{fmtMoney(total)}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              {icon[a.type]}
            </div>
            <div>
              <div className="font-medium">{a.name}</div>
              <div className="text-xs text-slate-400">{typeLabel[a.type]}</div>
              <div className="text-lg font-bold text-slate-800 mt-1">{fmtMoney(a.balance)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
