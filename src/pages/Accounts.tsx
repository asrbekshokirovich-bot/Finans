import { useState } from "react";
import { CreditCard, Banknote, FileText, Landmark, Plus, Pencil, Trash2, X } from "lucide-react";
import { useFinans } from "../lib/store";
import { useToast } from "../lib/toast";
import { fmtMoney } from "../lib/format";
import type { Account, AccountType } from "../lib/types";

const icon: Record<AccountType, React.ReactNode> = {
  karta: <CreditCard size={20} />,
  naqd: <Banknote size={20} />,
  soliq: <FileText size={20} />,
  bank: <Landmark size={20} />,
};
const typeLabel: Record<AccountType, string> = {
  karta: "Bank kartasi",
  naqd: "Naqd kassa",
  soliq: "Soliq hisobi",
  bank: "Bank hisob raqami",
};

type FormState = {
  name: string;
  type: AccountType;
  balance: string;
  bankName: string;
  cardNumber: string;
  accountNumber: string;
};

const emptyForm: FormState = {
  name: "",
  type: "karta",
  balance: "",
  bankName: "",
  cardNumber: "",
  accountNumber: "",
};

export default function Accounts() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useFinans();
  const toast = useToast();
  const total = accounts.reduce((s, a) => s + a.balance, 0);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(a: Account) {
    setEditId(a.id);
    setForm({
      name: a.name,
      type: a.type,
      balance: String(a.balance),
      bankName: a.bankName ?? "",
      cardNumber: a.cardNumber ?? "",
      accountNumber: a.accountNumber ?? "",
    });
    setOpen(true);
  }

  function save() {
    const balance = Number(form.balance.replace(/\s/g, "")) || 0;
    const base = {
      name: form.name.trim() || typeLabel[form.type],
      type: form.type,
      balance,
      bankName: form.bankName.trim() || undefined,
      cardNumber: form.cardNumber.trim() || undefined,
      accountNumber: form.accountNumber.trim() || undefined,
    };
    if (editId) {
      const existing = accounts.find((a) => a.id === editId);
      updateAccount({ ...existing!, ...base, id: editId });
      toast("Hisob yangilandi", "success");
    } else {
      addAccount(base);
      toast("Yangi hisob qo'shildi", "success");
    }
    setOpen(false);
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hisoblar va qoldiqlar</h1>
          <p className="text-slate-500 text-sm">Kartalar, naqd kassa, bank hisobi va patentdagi pul miqdori</p>
        </div>
        <button onClick={openAdd} className="btn-primary shrink-0">
          <Plus size={16} /> Hisob qo'shish
        </button>
      </div>

      <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-2xl p-6 shadow-glow animate-slideUp">
        <div className="text-sm opacity-80">Umumiy qoldiq</div>
        <div className="text-3xl font-bold mt-1 tracking-tight">{fmtMoney(total)}</div>
        <div className="text-xs opacity-60 mt-1">{accounts.length} ta hisob</div>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center text-slate-400 border border-dashed border-slate-200 rounded-xl py-12">
          Hozircha hisob yo'q. "Hisob qo'shish" tugmasini bosing.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accounts.map((a) => (
            <div key={a.id} className="card p-5 group transition-all hover:shadow-card hover:-translate-y-0.5 animate-slideUp">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  {icon[a.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{a.name}</div>
                  <div className="text-xs text-slate-400">{typeLabel[a.type]}</div>
                  {a.bankName && <div className="text-xs text-slate-400 mt-0.5">{a.bankName}</div>}
                  {a.accountNumber && (
                    <div className="text-xs text-slate-400 font-mono">{a.accountNumber}</div>
                  )}
                  <div className="text-lg font-bold text-slate-800 mt-1">{fmtMoney(a.balance)}</div>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(a)}
                    className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    title="Tahrirlash"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${a.name}" hisobini o'chirilsinmi?`)) {
                        deleteAccount(a.id);
                        toast("Hisob o'chirildi", "warning");
                      }
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title="O'chirish"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400">
        Ma'lumotlar brauzeringizda saqlanadi (qo'lda kiritish). Real bank / Payme / Click ulanishi keyin qo'shiladi.
      </p>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editId ? "Hisobni tahrirlash" : "Yangi hisob"}</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <Field label="Hisob nomi">
                <input
                  className="input"
                  placeholder="Masalan: Uzcard ****1234"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>

              <Field label="Turi">
                <select
                  className="input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as AccountType })}
                >
                  <option value="karta">Bank kartasi</option>
                  <option value="bank">Bank hisob raqami</option>
                  <option value="naqd">Naqd kassa</option>
                  <option value="soliq">Soliq hisobi</option>
                </select>
              </Field>

              <Field label="Qoldiq (so'm)">
                <input
                  className="input"
                  inputMode="numeric"
                  placeholder="0"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: e.target.value })}
                />
              </Field>

              {(form.type === "karta" || form.type === "bank") && (
                <Field label="Bank nomi">
                  <input
                    className="input"
                    placeholder="Kapitalbank, Hamkorbank..."
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  />
                </Field>
              )}

              {form.type === "karta" && (
                <Field label="Karta raqami">
                  <input
                    className="input"
                    placeholder="**** **** **** 1234"
                    value={form.cardNumber}
                    onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                  />
                </Field>
              )}

              {form.type === "bank" && (
                <Field label="Hisob-kitob raqami (20 xona)">
                  <input
                    className="input font-mono"
                    placeholder="2020 8000 ..."
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  />
                </Field>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={save}
                className="flex-1 bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-brand-700"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
