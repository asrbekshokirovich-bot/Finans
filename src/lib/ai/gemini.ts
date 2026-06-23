// ════════════════════════════════════════════════════════════════════════
// Gemini AI klienti (integratsiyaga TAYYOR, lekin kalitsiz ham ishlaydi)
//
// Sozlash: loyiha ildizida .env fayl yarating:
//   VITE_GEMINI_API_KEY=sizning_kalitingiz
//
// Kalit bo'lmasa — mock (taqlid) javob qaytadi, localhost buzilmaydi.
// Kalit qo'yilsa — real Gemini chaqiruvi bo'ladi. UI o'zgarmaydi.
// ════════════════════════════════════════════════════════════════════════

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MODEL = "gemini-2.0-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export const aiEnabled = Boolean(API_KEY);

interface GenerateOptions {
  json?: boolean; // JSON javob talab qilinsa
}

// Past darajadagi matn generatsiyasi
export async function geminiGenerate(prompt: string, opts: GenerateOptions = {}): Promise<string> {
  if (!API_KEY) {
    // Kalitsiz rejim — chaqiruvchi mock fallback'ni ishlatadi
    throw new Error("AI_DISABLED");
  }

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: opts.json ? { responseMimeType: "application/json" } : undefined,
    }),
  });

  if (!res.ok) throw new Error(`Gemini xato: ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
