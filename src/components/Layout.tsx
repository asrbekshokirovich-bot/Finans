import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  ListTodo,
  PieChart,
  Wallet,
  Users,
  Menu,
  X,
  Crown,
  Shield,
  User,
} from "lucide-react";
import { useFinans } from "../lib/store";
import ReminderBar from "./ReminderBar";
import type { Role } from "../lib/types";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Tranzaksiyalar", icon: ArrowLeftRight },
  { to: "/add", label: "Yangi yozuv", icon: PlusCircle },
  { to: "/tasks", label: "Vazifalar", icon: ListTodo },
  { to: "/reports", label: "Hisobotlar", icon: PieChart },
  { to: "/accounts", label: "Hisoblar", icon: Wallet },
  { to: "/workers", label: "Ishchilar", icon: Users },
];

const roleIcon: Record<Role, typeof Crown> = { owner: Crown, admin: Shield, ishchi: User };

export default function Layout() {
  const { currentUser } = useFinans();
  const [open, setOpen] = useState(false);
  const RoleIcon = roleIcon[currentUser.role];

  const sidebar = (
    <div className="flex flex-col h-full bg-gradient-to-b from-brand-700 to-brand-900 text-white">
      <div className="px-5 py-5 flex items-center justify-between">
        <div>
          <div className="text-xl font-bold flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-white/15 grid place-items-center text-sm">₣</span>
            Finans
          </div>
          <div className="text-[11px] text-white/50 mt-0.5 ml-9">Moliya boshqaruvi</div>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden text-white/70 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-brand-700 shadow-glow"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 p-3 rounded-xl bg-white/10 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/20 grid place-items-center font-semibold">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{currentUser.name}</div>
            <div className="text-[11px] text-white/60 flex items-center gap-1 capitalize">
              <RoleIcon size={11} /> {currentUser.role} · {currentUser.position}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f6f7fb]">
      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 hidden lg:block sticky top-0 h-screen">{sidebar}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 animate-fadeIn" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 animate-slideIn">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 bg-white/80 backdrop-blur border-b border-slate-200 px-4 py-3">
          <button onClick={() => setOpen(true)} className="text-slate-600">
            <Menu size={22} />
          </button>
          <span className="font-bold text-brand-700">Finans</span>
        </div>

        <main className="p-5 sm:p-7 max-w-[1240px] mx-auto animate-fadeIn">
          <ReminderBar />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
