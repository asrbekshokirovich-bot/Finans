# Finans — Tadqiqot xulosasi va yo'nalish

> Sizning vaziyatingiz uchun (Uzum + Yandex + AliCargo + onlayn do'kon + Click/Payme + Telegram bot + Gemini AI, O'zbekiston bozori). Manbalar tekshirilgan (2026-iyun holati).

---

## 1. Asosiy xulosa (TL;DR)

Sizning g'oyangiz **to'g'ri va bozorda bor** — lekin O'zbekistonda aynan shunday **birlashtirilgan** yechim deyarli yo'q. Rossiyada bu segment to'la (MoySklad, MPSTATS, MPFINASSIST), O'zbekistonda esa bo'sh — bu **imkoniyat**.

**Eng muhim haqiqat:** O'zbekistondagi to'lov tizimlari (Click/Payme/Paynet) "bugun qancha pul tushdi" degan **tayyor ro'yxat (pull API) bermaydi** — ular faqat **siz to'lovni boshlaganingizda** yoki **webhook** orqali xabar beradi. Demak, "barcha tushumlar" ko'rinishi uchun ishonchli manba — **bank ko'chirmasi (vipiska)** yoki har platformaning **hisobot (Excel) eksporti**.

---

## 2. Har bir integratsiya — real holat

### 🟢 Uzum Market — Seller API bor
- **API:** `https://api-seller.uzum.uz` (Swagger bor). Auth: **Bearer token** (seller kabinetdan olinadi).
- **Bor:** buyurtmalar, mahsulotlar, qoldiqlar, FBO + FBS.
- **⚠️ Muammo:** moliya/payout/komissiya **API'da yo'q ko'rinadi** — komissiya hisoboti kabinetdan **PDF/Excel** sifatida olinadi.
- **Yechim:** mahsulot/qoldiq/buyurtmani API'dan, **moliyani Excel hisobot yuklash** orqali oling.

### 🟢 Yandex Market — Partner API kuchli
- **API:** `https://api.partner.market.yandex.ru/v2` — hujjatlar yaxshi, OpenAPI GitHub'da.
- Auth: **API-Key** (OAuth eskirgan). `businessId` + `campaignId` kerak.
- **Moliya API'da BOR:** `generateUnitedNettingReport` (to'lovlar), komissiya/xizmat hisobotlari, tovar aylanmasi — generatsiya→poll→yuklab olish.
- Rate limit: hujjatlangan (HTTP 420 oshib ketganda).

### 🟡 Click / Payme / Paynet — callback asosida
- **Hammasi** to'lov boshlanganda yoki webhook bilan ishlaydi — **"bugun tushgan pul" ro'yxati yo'q**.
- **Bitta istisno:** Payme **Subscribe API** → `receipts.get_all` (sana oralig'i bilan ro'yxat). Bu yagona ishonchli "pull".
- Click: faqat har bir to'lovni ID bo'yicha tekshirish. Umumiy ro'yxat — `merchant.click.uz` kabinetdan.
- **Tavsiya:** webhook'larni o'z bazangizga yozib boring + Payme `receipts.get_all` bilan solishtiring.

### 🟡 Bank API (real karta/hisob qoldig'i)
- **Kapitalbank "Kapital API"** va **TBC UZ (CapitalConnect)** — korporativ API bor, lekin **shartnoma orqali** (self-serve kalit yo'q).
- Hamkorbank, Anorbank — common API hujjati topilmadi.
- O'zbekistonda **PSD2 kabi yagona open-banking standarti yo'q** — har bank alohida.
- **Tavsiya:** hozircha qo'lda kiritish (allaqachon qildik), keyin biznes hisob uchun Kapital/TBC bilan shartnoma.

### 🔴 Fiskalizatsiya (onlayn-kassa) — MAJBURIY
- Naqd yoki karta qabul qiladigan **har bir biznes** (shu jumladan onlayn do'kon) uchun majburiy.
- Har tranzaksiya real vaqtda **OFD**ga uzatiladi, chekda **QR-kod** bo'lishi shart. "Virtual kassa" (bulutli) — apparatsiz yo'l.
- Marketplace (Uzum) odatda komissioner sifatida chekni **o'zi** chiqaradi (tasdiqlang).

---

## 3. Soliq / huquqiy (2026 o'zgarishlari — MUHIM)

| Mavzu | Holat (2026) |
|-------|--------------|
| **Patent (fiksirlangan soliq)** | **2026-yildan BEKOR** (PP-247, 12.08.2025) — faqat foizli soliq qoladi |
| **Aylanma soliq** | ≤1 mlrd so'm: **1%** (2026-dan, avval 4%) |
| **E-commerce imtiyoz** | Aylanma **2%** + foyda **7.5%**, agar e-tijorat daromadi **≥90%** bo'lsa (my3.soliq.uz orqali) |
| **QQS (VAT)** | Bo'sag'a 1 mlrd → **5 mlrd** (2026-iyun 1-dan), stavka 12% |
| **e-Faktura** | Majburiy, **api.faktura.uz** — integratsiya API bor |
| **Uzum modeli** | Komissiya shartnomasi: siz=komitent, Uzum=komissioner. Daromad **brutto** (komissiyagacha) hisoblanadi |
| **Milliy e-tijorat reestri** | E-tijorat ≥80% bo'lsa (90% imtiyozdan ALOHIDA bo'sag'a) |

> ⚠️ Tizimga soliq mantig'ini "qattiq" yozishdan oldin **lex.uz**dan PP-247 va 5 mlrd bo'sag'a sanasini tekshiring. "Patent hisobi" degan hisob turini biz qo'shgandik — buni **"soliq hisobi"**ga o'zgartirish kerak bo'lishi mumkin.

---

## 4. O'xshash tizimlardan o'rganganlarimiz

- **MoySklad** (Uzum + Yandex integratsiyasi bor!) — qoldiq/buyurtma sync'da kuchli, lekin chuqur P&L'da zaif. **Sizning raqobatchingiz/hamkoringiz** — Uzum integratsiyasini ular ham qilgan.
- **MPFINASSIST / Litestat** (RU) — aynan **moliyaviy qatlam**: P&L, pul oqimi (ДДС), SKU bo'yicha foyda, zararli SKU'ni aniqlash. **Bu — sizning farqlovchi qiymatingiz.**
- **A2X pattern** (jahon standarti): har payout'ni **bitta jurnal yozuviga** guruhlash (komissiya+soliq+qaytuv+COGS) → bank tushumi bilan oson solishtirish.
- **Eng muhim qoida:** daromadni **tushgan sana bo'yicha emas, hisoblangan sana bo'yicha** tan oling (pul 1-2 hafta keyin keladi) — kalendar chegarasi muammosi.

**Build vs Buy:**
- **Sotib olish/tayyor:** API connector'lar — odatda commodity. Lekin O'zbekistonda tayyor connector kam → ko'pini **o'zingiz qurasiz**.
- **O'zingiz qurish (farqlovchi):** birlashgan foyda modeli (reklama+buyurtma+COGS+komissiya = haqiqiy sof foyda), ovozli/Telegram kiritish, lokal soliq. **Bu yerda raqobat yo'q.**

---

## 5. Telegram bot + AI (Gemini) — aniq pattern

**Tasdiqlangan oqim:**
1. Telegram `voice` → darhol "qabul qilindi" javobi → `getFile` (≤20MB, ovoz kichik).
2. **STT:** ikki variant —
   - **(a)** Gemini 2.5 Flash'ga **audio'ni to'g'ridan** berish (1 chaqiruv: transkripsiya + JSON ajratish) — soddaroq.
   - **(b)** Maxsus ASR (Google **Chirp 3** o'zbekchani yaxshiroq taniydi) → matn → Gemini.
3. **Gemini structured output:** `responseMimeType: "application/json"` + flat schema → `{summa, tur, kategoriya, manba, izoh}`.
4. **⚠️ Tasdiqlash qadami MAJBURIY:** pul yozuvini avtomatik saqlamang — "Tasdiqlash / Tahrirlash / Bekor" tugmalari bilan ko'rsating.
5. Bazaga yozish (Supabase Edge Function webhook).
6. Vazifa: rol → user → saqlangan `chat_id` → `sendMessage`.

**Xavflar:**
- **O'zbekcha STT aniqligi — eng katta risk.** Rasmiy WER e'lon qilinmagan. O'z ishchilaringiz ovozida sinab ko'ring.
- **O'zbek↔rus aralash nutq** — auto-til aniqlash (Chirp 3 / Gemini) yaxshiroq.
- **Maxfiylik:** Gemini **bepul tier ma'lumotni o'qitishga ishlatadi** → real moliya uchun **pullik tier** ishlating.
- Gemini 2.5 Flash bepul ≈ 10 RPM / 250/kun (o'zgaruvchan).

---

## 6. Tavsiya etilgan yo'nalish va yo'l xaritasi

### Arxitektura tamoyili
**Normallashtirilgan tranzaksiya defteri (ledger)** markazda. Har manba (Uzum/Yandex/Payme/Click/Telegram/qo'lda) → bitta umumiy formatga → defterga. Kanal tushunchasini biz allaqachon qo'shdik ✅.

### Bosqichma-bosqich (hozirgi prototip ustiga)

**1-bosqich — UI + mantiq (HOZIR, rahbar ko'rsatmasi)** ✅ qisman tayyor
- Hisoblar, rollar, kanal feed'lari, Gemini qatlami, eslatmalar — bajarildi.
- Qo'shimcha: "patent" → "soliq" hisobi, SKU bo'yicha foyda makети, P&L ko'rinishi.

**2-bosqich — Backend (Supabase)**
- Postgres ledger, edge functions, auth (rollar), Telegram webhook.
- `AliBrandUZ-crm` reposida bu allaqachon bor (~80 edge funksiya) — **undan namuna oling**.

**3-bosqich — Real integratsiya (rahbar ruxsatidan keyin)**
- **Birinchi:** Yandex Partner API (eng oson, moliya API'da bor).
- **Keyin:** Uzum Seller API (mahsulot/qoldiq) + Excel hisobot ingest (moliya).
- **Keyin:** Payme `receipts.get_all` + webhook'lar; Click webhook.
- **Keyin:** e-Faktura (api.faktura.uz), virtual kassa (OFD).
- **Oxirida:** bank API (Kapital/TBC, shartnoma bilan).

**4-bosqich — Telegram + AI**
- Gemini 2.5 Flash (pullik), tasdiqlash UX, o'zbekcha STT sinovi.

### Asosiy qarorlar
1. **"Pull" emas, "yig'ish" mentaliteti** — webhook + Excel + bank vipiska.
2. **Tushgan sana ≠ hisoblangan sana** — buni boshidan to'g'ri modellang.
3. **Farqni o'zingiz quring** (birlashgan foyda + AI + lokal soliq), connector'larni minimal qiling.
4. **AliBrandUZ-crm** — tayyor backend namunasi, noldan yozmang.

---

## 7. Tekshirib bo'lmagan / ehtiyot bo'ling
- Uzum moliya API'da bormi — Swagger 403 berdi, brauzerda tasdiqlang.
- Marketplace fiskalizatsiya (chekni kim chiqaradi) — Uzum shartnomasini o'qing.
- 2026 soliq sanalari — lex.uz'dan tasdiqlang.
- O'zbekcha STT aniqligi — empirik sinov shart.
- Bank API'lar — to'g'ridan-to'g'ri bank bilan bog'laning.
