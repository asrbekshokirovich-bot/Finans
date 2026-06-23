import { createContext, createElement, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { Transaction, WorkerTask, BusinessSource } from "./types";
import { transactions as seedTx, tasks as seedTasks, accounts, workers } from "./mockData";

// ── Markaziy holat + biznes mantiq (mock, integratsiyasiz) ──

interface State {
  transactions: Transaction[];
  tasks: WorkerTask[];
}

type Action =
  | { type: "ADD_TX"; tx: Transaction }
  | { type: "ADD_TASK"; task: WorkerTask }
  | { type: "SET_TASK_STATUS"; id: string; status: WorkerTask["status"] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TX":
      return { ...state, transactions: [action.tx, ...state.transactions] };
    case "ADD_TASK":
      return { ...state, tasks: [action.task, ...state.tasks] };
    case "SET_TASK_STATUS":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, status: action.status } : t)),
      };
    default:
      return state;
  }
}

interface Ctx extends State {
  accounts: typeof accounts;
  workers: typeof workers;
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  addTask: (task: Omit<WorkerTask, "id" | "createdAt" | "status">) => void;
  setTaskStatus: (id: string, status: WorkerTask["status"]) => void;
  totals: { kirim: number; chiqim: number; foyda: number };
  bySource: { source: BusinessSource; kirim: number; chiqim: number; net: number }[];
}

const FinansContext = createContext<Ctx | null>(null);

export function FinansProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { transactions: seedTx, tasks: seedTasks });

  const value = useMemo<Ctx>(() => {
    const kirim = state.transactions.filter((t) => t.type === "kirim").reduce((s, t) => s + t.amount, 0);
    const chiqim = state.transactions.filter((t) => t.type === "chiqim").reduce((s, t) => s + t.amount, 0);

    const map = new Map<BusinessSource, { kirim: number; chiqim: number }>();
    for (const t of state.transactions) {
      const cur = map.get(t.source) ?? { kirim: 0, chiqim: 0 };
      if (t.type === "kirim") cur.kirim += t.amount;
      else cur.chiqim += t.amount;
      map.set(t.source, cur);
    }
    const bySource = [...map.entries()].map(([source, v]) => ({
      source,
      kirim: v.kirim,
      chiqim: v.chiqim,
      net: v.kirim - v.chiqim,
    }));

    return {
      ...state,
      accounts,
      workers,
      totals: { kirim, chiqim, foyda: kirim - chiqim },
      bySource,
      addTransaction: (tx) =>
        dispatch({ type: "ADD_TX", tx: { ...tx, id: crypto.randomUUID(), createdAt: new Date().toISOString() } }),
      addTask: (task) =>
        dispatch({
          type: "ADD_TASK",
          task: { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: "yangi" },
        }),
      setTaskStatus: (id, status) => dispatch({ type: "SET_TASK_STATUS", id, status }),
    };
  }, [state]);

  return createElement(FinansContext.Provider, { value }, children);
}

export function useFinans() {
  const ctx = useContext(FinansContext);
  if (!ctx) throw new Error("useFinans FinansProvider ichida ishlatilishi kerak");
  return ctx;
}
