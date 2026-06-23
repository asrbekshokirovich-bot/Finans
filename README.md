# Finans — Yagona moliya boshqaruv tizimi

Barcha bizneslarni (Uzum, Yandex, AliCargo, onlayn do'kon, Click/Payme) bitta
joyda birlashtiruvchi moliya tizimi. **Hozircha bu UI + mantiq prototipi** —
real integratsiya (AliBrand, evobot, marketplace API'lari) keyin ulanadi.

## Hozircha tayyor

- **Dashboard** — umumiy kirim/chiqim/foyda, biznes bo'yicha grafiklar
- **Tranzaksiyalar** — kirim/chiqim ro'yxati, filtr
- **Yangi yozuv** — qo'lda + **ovozli kiritish** (AI taqlidi)
- **Vazifalar** — ishchilarga to-do, **ovozli buyruq** rejimi (taqlid)
- **Hisobotlar** — biznes va kategoriya bo'yicha tahlil
- **Hisoblar** — kartalar, naqd, patent qoldiqlari

> Barcha ma'lumotlar `src/lib/mockData.ts` da — namuna (mock). Integratsiya yo'q.

## Ishga tushirish (localhost)

```sh
npm install
npm run dev
```

So'ng brauzerda: http://localhost:5173

## Texnologiya

React + Vite + TypeScript + Tailwind CSS + Recharts + React Router.

## Tuzilma

```
src/
  lib/        # types, mock data, store (biznes mantiq), formatlash
  components/ # Layout, StatCard
  pages/      # Dashboard, Transactions, AddTransaction, Tasks, Reports, Accounts
```
