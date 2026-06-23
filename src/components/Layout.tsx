import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  ListTodo,
  PieChart,
  Wallet,
  Users,
} from "lucide-react";
import { useFinans } from "../lib/store";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Tranzaksiyalar", icon: ArrowLeftRight },
  { to: "/add", label: "Yangi yozuv", icon: PlusCircle },
  { to: "/tasks", label: "Vazifalar", icon: ListTodo },
  { to: "/reports", label: "Hisobotlar", icon: PieChart },
  { to: "/accounts", label: "Hisoblar", icon: Wallet },
  { to: "/workers", label: "Ishchilar", icon: Users },
];

export default function Layout() {
  const { currentUser } = useFinans();
  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="text-xl font-bold text-brand-600">Finans</div>
          <div className="text-xs text-slate-400">Moliya boshqaruv tizimi</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="text-sm font-medium text-slate-700">{currentUser.name}</div>
          <div className="text-[11px] text-slate-400 capitalize">{currentUser.role} · {currentUser.position}</div>
          <div className="text-[11px] text-slate-300 mt-2">UI prototip · integratsiyasiz</div>
        </div>
      </aside>
      <main className="flex-1 p-6 max-w-[1200px]">
        <Outlet />
      </main>
    </div>
  );
}
