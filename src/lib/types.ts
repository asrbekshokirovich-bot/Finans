// ── Finans tizimi uchun asosiy turlar (UI prototip) ──

// Biznes manbalari — kelajakda real integratsiya shu yorliqlar bo'yicha ulanadi
export type BusinessSource =
  | "uzum"
  | "yandex"
  | "alicargo"
  | "store" // o'z onlayn do'koni
  | "click"
  | "payme"
  | "naqd" // naqd pul / karta
  | "boshqa";

export type TxType = "kirim" | "chiqim";

// Chiqim/kirim kategoriyalari
export type TxCategory =
  | "sotuv" // tovar sotuvidan tushum
  | "cargo" // yetkazib berish xarajati
  | "tovar_xarid" // tovar sotib olish
  | "maosh" // ishchi maoshi
  | "ijara"
  | "reklama"
  | "patent" // patent / soliq
  | "komissiya" // marketplace komissiyasi
  | "boshqa";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number; // so'mda
  category: TxCategory;
  source: BusinessSource;
  note: string;
  createdAt: string; // ISO sana
  createdBy: string; // ishchi/admin ismi
  viaVoice?: boolean; // ovozli xabar orqali kiritilganmi
}

export type TaskStatus = "yangi" | "jarayonda" | "bajarildi";

export interface WorkerTask {
  id: string;
  title: string;
  assignedTo: string; // ishchi ismi
  status: TaskStatus;
  createdAt: string;
  viaVoice?: boolean; // admin ovozli buyruq orqali yaratganmi
}

export interface Worker {
  id: string;
  name: string;
  role: string;
}

// Hisob (karta / patent / naqd) qoldiqlari
export type AccountType = "karta" | "naqd" | "patent" | "bank";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number; // so'mda
  // Qo'lda kiritiladigan rekvizitlar (integratsiyasiz). Kelajakda bank API yoki
  // Payme/Click shu maydonlar orqali ulanadi.
  bankName?: string; // bank nomi (Kapitalbank, Hamkorbank...)
  cardNumber?: string; // karta raqami (oxirgi 4 raqam yoki to'liq)
  accountNumber?: string; // hisob-kitob raqami (20 xonali)
  updatedAt?: string; // qoldiq oxirgi marta yangilangan vaqt
}
