// ── Xabarlarni qayta ishlash (guruh + shaxsiy) ──
import { sendMessage, getFile, downloadFile } from "./telegram.js";
import { transcribeVoice, parseTransaction } from "./ai.js";
import { saveTransaction, saveReport, saveTask } from "./db.js";
import { MOCK_MODE } from "./config.js";

const fmt = (n) => new Intl.NumberFormat("uz-UZ").format(n) + " so'm";

// Botga murojaat qilinganmi (guruhda faqat buyruq/mention/ovozga javob beramiz)
function isAddressed(msg) {
  const chatType = msg.chat.type;
  if (chatType === "private") return true;
  // guruhda: buyruq, ovoz yoki bot mention bo'lsa
  if (msg.voice) return true;
  if (msg.text && msg.text.startsWith("/")) return true;
  if (msg.entities?.some((e) => e.type === "mention")) return true;
  return false;
}

export async function handleUpdate(update) {
  const msg = update.message;
  if (!msg) return;
  if (!isAddressed(msg)) return;

  const chatId = msg.chat.id;
  const author = msg.from?.first_name || "Noma'lum";

  try {
    // 1) Ovozli xabar — tahlil qilib bazaga
    if (msg.voice) {
      await handleVoice(msg, chatId, author);
      return;
    }

    const text = (msg.text || "").trim();

    // 2) Buyruqlar
    if (text.startsWith("/start")) {
      await sendMessage(chatId, startText());
    } else if (text.startsWith("/help")) {
      await sendMessage(chatId, helpText());
    } else if (text.startsWith("/vazifa")) {
      // /vazifa Jasur omborni sanasin
      const body = text.replace(/^\/vazifa(@\w+)?\s*/, "");
      if (!body) return sendMessage(chatId, "Format: <code>/vazifa Ism vazifa matni</code>");
      const [assignedTo, ...rest] = body.split(" ");
      const task = await saveTask({ assignedTo, title: rest.join(" ") || body, createdBy: author });
      await sendMessage(chatId, `✅ Vazifa biriktirildi: <b>${task.assignedTo}</b> — ${task.title}`);
    } else if (text.startsWith("/hisobot")) {
      // /hisobot Bugun 15 ta buyurtma qadoqladim
      const body = text.replace(/^\/hisobot(@\w+)?\s*/, "");
      if (!body) return sendMessage(chatId, "Format: <code>/hisobot matn</code> yoki ovozli xabar yuboring");
      const report = await saveReport({ author, text: body, aiSummary: `Xulosa: ${body.slice(0, 120)}` });
      await sendMessage(chatId, `📝 Hisobot qabul qilindi (${author}).\n<i>${report.aiSummary}</i>`);
    } else if (text) {
      // 3) Oddiy matn — kirim/chiqim sifatida tahlil qilib ko'ramiz
      await handleText(text, chatId, author);
    }
  } catch (e) {
    console.error("handleUpdate xato:", e.message);
    await sendMessage(chatId, "⚠️ Xatolik yuz berdi. Qayta urinib ko'ring.");
  }
}

async function handleVoice(msg, chatId, author) {
  await sendMessage(chatId, "🎙 Ovoz qabul qilindi, tahlil qilinmoqda...");

  let text;
  if (MOCK_MODE) {
    text = await transcribeVoice(null);
  } else {
    const file = await getFile(msg.voice.file_id);
    const buf = await downloadFile(file.file_path);
    text = await transcribeVoice(buf);
  }

  const tx = parseTransaction(text);
  if (tx.amount > 0 && tx.category !== "boshqa") {
    await saveTransaction({ ...tx, createdBy: author, channel: "telegram", viaVoice: true });
    await sendMessage(
      chatId,
      `✅ <b>${tx.type === "kirim" ? "Kirim" : "Chiqim"}</b> saqlandi\n` +
        `Summa: <b>${fmt(tx.amount)}</b>\nKategoriya: ${tx.category}\nManba: ${tx.source}\n` +
        `<i>Eshitildi: "${text}"</i>`,
    );
  } else {
    await sendMessage(chatId, `🤔 To'liq aniqlanmadi.\nEshitildi: "${text}"\nQayta yuboring yoki <code>/hisobot</code> ishlating.`);
  }
}

async function handleText(text, chatId, author) {
  const tx = parseTransaction(text);
  if (tx.amount > 0) {
    await saveTransaction({ ...tx, createdBy: author, channel: "telegram", viaVoice: false });
    await sendMessage(chatId, `✅ ${tx.type === "kirim" ? "Kirim" : "Chiqim"}: <b>${fmt(tx.amount)}</b> (${tx.category})`);
  }
  // raqam topilmasa — javob bermaymiz (guruhda shovqin bo'lmasligi uchun)
}

function startText() {
  return (
    "👋 <b>Finans bot</b>ga xush kelibsiz!\n\n" +
    "Men ishchilar uchun:\n" +
    "• Kirim/chiqimni <b>ovozli</b> yoki matn bilan qabul qilaman\n" +
    "• AI orqali hisobot yozaman\n" +
    "• Vazifa biriktiraman\n\n" +
    "/help — buyruqlar ro'yxati"
  );
}

function helpText() {
  return (
    "<b>Buyruqlar:</b>\n" +
    "/vazifa <i>Ism matn</i> — ishchiga vazifa\n" +
    "/hisobot <i>matn</i> — kunlik hisobot\n\n" +
    "<b>Ovozli xabar</b> yuboring — avtomatik kirim/chiqimga aylantiraman.\n" +
    "Guruhda ham, shaxsiy chatda ham ishlayman."
  );
}
