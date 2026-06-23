import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

type ToastKind = "success" | "info" | "warning";
interface Toast {
  id: string;
  kind: ToastKind;
  text: string;
}

const ToastCtx = createContext<(text: string, kind?: ToastKind) => void>(() => {});

const style: Record<ToastKind, { cls: string; icon: ReactNode }> = {
  success: { cls: "border-emerald-200", icon: <CheckCircle2 size={18} className="text-emerald-500" /> },
  info: { cls: "border-brand-200", icon: <Info size={18} className="text-brand-500" /> },
  warning: { cls: "border-amber-200", icon: <AlertTriangle size={18} className="text-amber-500" /> },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((text: string, kind: ToastKind = "success") => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] space-y-2 w-[min(92vw,340px)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 bg-white border ${style[t.kind].cls} shadow-card rounded-xl px-4 py-3 text-sm animate-slideIn`}
          >
            {style[t.kind].icon}
            <span className="flex-1">{t.text}</span>
            <button
              onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
              className="text-slate-300 hover:text-slate-500"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
