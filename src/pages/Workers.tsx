import { useState } from "react";
import { UserPlus, Shield, Crown, User, X } from "lucide-react";
import { useFinans } from "../lib/store";
import type { Role } from "../lib/types";

const roleLabel: Record<Role, string> = {
  owner: "Egasi (owner)",
  admin: "Admin",
  ishchi: "Ishchi",
};
const roleIcon: Record<Role, React.ReactNode> = {
  owner: <Crown size={16} />,
  admin: <Shield size={16} />,
  ishchi: <User size={16} />,
};
const roleStyle: Record<Role, string> = {
  owner: "bg-amber-100 text-amber-700",
  admin: "bg-brand-100 text-brand-700",
  ishchi: "bg-slate-100 text-slate-600",
};

export default function Workers() {
  const { workers, currentUser, canManageWorkers, addWorker, setCurrentUser } = useFinans();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState<Role>("ishchi");

  function save() {
    if (!name.trim()) return;
    addWorker({ name: name.trim(), position: position.trim() || "Xodim", role });
    setName("");
    setPosition("");
    setRole("ishchi");
    setOpen(false);
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ishchilar va rollar</h1>
          <p className="text-slate-500 text-sm">Jamoa a'zolari, rollar va huquqlar</p>
        </div>
        {canManageWorkers && (
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 bg-brand-600 text-white text-sm font-medium rounded-lg px-3.5 py-2 hover:bg-brand-700"
          >
            <UserPlus size={16} /> Ishchi qo'shish
          </button>
        )}
      </div>

      {/* Joriy foydalanuvchi (rol almashtirish — sinov uchun) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 flex-wrap">
        <span className="text-sm text-slate-500">Joriy foydalanuvchi:</span>
        <select
          value={currentUser.id}
          onChange={(e) => setCurrentUser(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
        >
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} — {roleLabel[w.role]}
            </option>
          ))}
        </select>
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${roleStyle[currentUser.role]}`}>
          {roleIcon[currentUser.role]} {roleLabel[currentUser.role]}
        </span>
        {!canManageWorkers && (
          <span className="text-xs text-slate-400">Ishchi ishchi qo'sha olmaydi</span>
        )}
      </div>

      {/* Ro'yxat */}
      <div className="space-y-2">
        {workers.map((w) => (
          <div key={w.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-semibold">
              {w.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-medium">{w.name}</div>
              <div className="text-xs text-slate-400">{w.position}</div>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${roleStyle[w.role]}`}>
              {roleIcon[w.role]} {roleLabel[w.role]}
            </span>
          </div>
        ))}
      </div>

      <div className="text-xs text-slate-400 space-y-1">
        <p><b>Egasi (owner)</b> — to'liq huquq: ishchi qo'shadi, vazifa beradi, barcha hisobotlarni ko'radi.</p>
        <p><b>Admin</b> — vazifa beradi, hisobot oladi, ishchi qo'sha oladi.</p>
        <p><b>Ishchi</b> — faqat o'ziga berilgan vazifalar va kirim/chiqim kiritish.</p>
      </div>

      {open && canManageWorkers && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Yangi ishchi</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <label className="block">
              <span className="text-sm text-slate-600">Ism</span>
              <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ism familiya" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-600">Lavozim</span>
              <input className="input mt-1" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Ombor, Sotuv, Cargo..." />
            </label>
            <label className="block">
              <span className="text-sm text-slate-600">Rol</span>
              <select className="input mt-1" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="ishchi">Ishchi</option>
                <option value="admin">Admin</option>
                {currentUser.role === "owner" && <option value="owner">Egasi (owner)</option>}
              </select>
            </label>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setOpen(false)} className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Bekor qilish
              </button>
              <button onClick={save} className="flex-1 bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-brand-700">
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
