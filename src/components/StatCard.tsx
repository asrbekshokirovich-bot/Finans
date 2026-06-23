import type { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  accent = "#4f46e5",
  icon,
  hint,
  trend,
}: {
  label: string;
  value: string;
  accent?: string;
  icon?: ReactNode;
  hint?: string;
  trend?: { up: boolean; text: string };
}) {
  return (
    <div className="card p-5 transition-all hover:shadow-card hover:-translate-y-0.5 animate-slideUp">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        {icon && (
          <span
            className="w-9 h-9 rounded-xl grid place-items-center"
            style={{ color: accent, background: `${accent}15` }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight" style={{ color: accent }}>
        {value}
      </div>
      {trend && (
        <div className={`mt-1 text-xs font-medium ${trend.up ? "text-emerald-600" : "text-red-500"}`}>
          {trend.up ? "▲" : "▼"} {trend.text}
        </div>
      )}
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
