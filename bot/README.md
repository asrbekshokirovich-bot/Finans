# Finans Telegram bot (maket)

Ishchilar uchun Telegram bot: **buyruqlar berish**, **AI orqali hisobot**, **ovozli kirim/chiqim**.
Guruhda ham, shaxsiy chatda ham ishlaydi.

> ⚠️ Hozircha **MAKET**. Token, AI API va baza keyin ulanadi — kod tayyor, faqat `.env` to'ldiriladi.

## Imkoniyatlar
- 🎙 **Ovozli xabar** → tahlil → kirim/chiqim sifatida bazaga
- 📝 `/hisobot <matn>` — kunlik hisobot (AI xulosa)
- ✅ `/vazifa <Ism> <matn>` — ishchiga vazifa biriktirish
- Guruh + shaxsiy chat (guruhda faqat buyruq/ovoz/mention'ga javob beradi)

## Ishga tushirish

### 1. Maket rejimi (tokensiz — hozir sinash uchun)
```bash
cd bot
npm start
```
Telegramsiz, namuna xabarlar qanday tahlil qilinishini konsolda ko'rsatadi.

### 2. Real rejim (token bilan)
1. [@BotFather](https://t.me/BotFather) dan bot oching, tokenni oling
2. `.env` fayl yarating (`.env.example` dan nusxa):
   ```
   BOT_TOKEN=123456:ABC...
   GEMINI_API_KEY=...      # ovoz tahlili uchun (keyin)
   DATABASE_URL=...        # baza (keyin)
   ```
3. Guruhga qo'shsangiz — BotFather'da **Group Privacy**ni OFF qiling (guruh xabarlarini ko'rishi uchun)
4. Ishga tushiring:
   ```bash
   npm start
   ```

## Keyin ulanadigan joylar (TODO)
| Fayl | Nima ulanadi |
|------|--------------|
| `src/ai.js` → `transcribeVoice` | Real STT (Gemini audio / Whisper) |
| `src/db.js` | Real baza (Supabase: finance_transactions, worker_reports, tasks) |
| `src/index.js` | Long polling → webhook (ishlab chiqarishda) |

## Tuzilma
```
bot/
├── package.json
├── .env.example
└── src/
    ├── config.js      # env o'qish, maket rejimi
    ├── telegram.js    # Telegram API (sendMessage, getFile, ...)
    ├── ai.js          # ovoz→matn (stub) + matn→yozuv (o'zbek/rus raqamlar)
    ├── db.js          # baza maketi (xotira + konsol, TODO real DB)
    ├── handlers.js    # buyruqlar + ovoz + guruh/shaxsiy mantiq
    └── index.js       # ishga tushirish (polling / maket demo)
```
