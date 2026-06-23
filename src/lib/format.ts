import type { BusinessSource, TxCategory } from "./types";

export const fmtMoney = (n: number) =>
  new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const sourceLabel: Record<BusinessSource, string> = {
  uzum: "Uzum",
  yandex: "Yandex",
  alicargo: "AliCargo",
  store: "Onlayn do'kon",
  click: "Click",
  payme: "Payme",
  naqd: "Naqd/Karta",
  boshqa: "Boshqa",
};

export const sourceColor: Record<BusinessSource, string> = {
  uzum: "#7c3aed",
  yandex: "#eab308",
  alicargo: "#0ea5e9",
  store: "#10b981",
  click: "#2563eb",
  payme: "#06b6d4",
  naqd: "#64748b",
  boshqa: "#94a3b8",
};

export const categoryLabel: Record<TxCategory, string> = {
  sotuv: "Sotuv",
  cargo: "Cargo / yetkazish",
  tovar_xarid: "Tovar xaridi",
  maosh: "Maosh",
  ijara: "Ijara",
  reklama: "Reklama",
  patent: "Patent / soliq",
  komissiya: "Komissiya",
  boshqa: "Boshqa",
};
