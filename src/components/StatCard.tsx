import type { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  accent = "#4f46e5",
  icon,
  hint,
}: {
  label: string;
  value: string;
  accent?: string;
  icon?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        {icon && <span style={{ color: accent }}>{icon}</span>}
      </div>
      <div className="mt-2 text-2xl font-bold" style={{ color: accent }}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
