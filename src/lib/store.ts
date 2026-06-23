import { createContext, createElement, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { Transaction, WorkerTask, BusinessSource, Account } from "./types";
import { transactions as seedTx, tasks as seedTasks, accounts as seedAccounts, workers } from "./mockData";

// ── Markaziy holat + biznes mantiq (mock, integratsiyasiz) ──

interface State {
  transactions: Transaction[];
  tasks: WorkerTask[];
  accounts: Account[];
}

type Action =
  | { type: "ADD_TX"; tx: Transaction }
  | { type: "ADD_TASK"; task: WorkerTask }
  | { type: "SET_TASK_STATUS"; id: string; status: WorkerTask["status"] }
  | { type: "ADD_ACCOUNT"; account: Account }
  | { type: "UPDATE_ACCOUNT"; account: Account }
  | { type: "DELETE_ACCOUNT"; id: string };

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
    case "ADD_ACCOUNT":
      return { ...state, accounts: [...state.accounts, action.account] };
    case "UPDATE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.map((a) => (a.id === action.account.id ? action.account : a)),
      };
    case "DELETE_ACCOUNT":
      return { ...state, accounts: state.accounts.filter((a) => a.id !== action.id) };
    default:
      return state;
  }
}

// ── Hisoblarni brauzerda saqlash (localStorage, integratsiyasiz) ──
const ACCOUNTS_KEY = "finans.accounts";

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw) as Account[];
  } catch {
    /* localStorage mavjud bo'lmasligi mumkin */
  }
  return seedAccounts;
}

interface Ctx extends State {
  workers: typeof workers;
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  addTask: (task: Omit<WorkerTask, "id" | "createdAt" | "status">) => void;
  setTaskStatus: (id: string, status: WorkerTask["status"]) => void;
  addAccount: (account: Omit<Account, "id" | "updatedAt">) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  totals: { kirim: number; chiqim: number; foyda: number };
  bySource: { source: BusinessSource; kirim: number; chiqim: number; net: number }[];
}

const FinansContext = createContext<Ctx | null>(null);

export function FinansProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    transactions: seedTx,
    tasks: seedTasks,
    accounts: loadAccounts(),
  }));

  // Hisoblar o'zgarganda brauzerga saqlash
  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(state.accounts));
    } catch {
      /* yozib bo'lmasa, e'tiborsiz qoldiramiz */
    }
  }, [state.accounts]);

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
      addAccount: (account) =>
        dispatch({
          type: "ADD_ACCOUNT",
          account: { ...account, id: crypto.randomUUID(), updatedAt: new Date().toISOString() },
        }),
      updateAccount: (account) =>
        dispatch({ type: "UPDATE_ACCOUNT", account: { ...account, updatedAt: new Date().toISOString() } }),
      deleteAccount: (id) => dispatch({ type: "DELETE_ACCOUNT", id }),
    };
  }, [state]);

  return createElement(FinansContext.Provider, { value }, children);
}

export function useFinans() {
  const ctx = useContext(FinansContext);
  if (!ctx) throw new Error("useFinans FinansProvider ichida ishlatilishi kerak");
  return ctx;
}
