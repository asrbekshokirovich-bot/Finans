// ── Baza qatlami — HOZIRCHA MAKET (xotirada + konsolga) ──
// KEYIN: Supabase yoki Postgres ulanadi. Quyidagi funksiyalar imzosi o'zgarmaydi.

const memory = { transactions: [], reports: [], tasks: [] };

function ts() {
  return new Date().toISOString();
}

// Kirim/chiqim yozuvini saqlash
export async function saveTransaction(rec) {
  const row = { id: cryptoId(), createdAt: ts(), ...rec };
  memory.transactions.push(row);
  console.log("💾 [DB maket] transaction:", row);
  // TODO(keyin): await supabase.from('finance_transactions').insert(row)
  return row;
}

// Ishchi hisobotini saqlash
export async function saveReport(rec) {
  const row = { id: cryptoId(), createdAt: ts(), ...rec };
  memory.reports.push(row);
  console.log("💾 [DB maket] report:", row);
  // TODO(keyin): await supabase.from('worker_reports').insert(row)
  return row;
}

// Vazifani saqlash
export async function saveTask(rec) {
  const row = { id: cryptoId(), createdAt: ts(), status: "yangi", ...rec };
  memory.tasks.push(row);
  console.log("💾 [DB maket] task:", row);
  // TODO(keyin): await supabase.from('tasks').insert(row)
  return row;
}

function cryptoId() {
  return "id_" + Math.random().toString(36).slice(2, 10);
}

export const _memory = memory; // test/debug uchun
