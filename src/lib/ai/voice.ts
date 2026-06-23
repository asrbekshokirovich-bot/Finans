// ════════════════════════════════════════════════════════════════════════
// Ovozli kiritish — brauzerning Web Speech API si (o'zbekcha)
//
// Hozir: brauzer nutqni matnga aylantiradi -> matn Gemini'ga yuborilib
//        kirim/chiqim ajratiladi (assistant.ts).
// Kelajakda: aniqroq natija uchun audio Whisper/Gemini audio'ga yuboriladi.
// ════════════════════════════════════════════════════════════════════════

type SR = typeof window & {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
};

export function voiceSupported(): boolean {
  const w = window as SR;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export interface Dictation {
  stop: () => void;
}

// Diktani boshlaydi. onResult — yakuniy matn, onError — xato.
export function startDictation(
  onResult: (text: string) => void,
  onError?: (msg: string) => void,
): Dictation | null {
  const w = window as SR;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) {
    onError?.("Brauzer ovozli kiritishni qo'llamaydi");
    return null;
  }
  const rec = new Ctor();
  rec.lang = "uz-UZ";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onresult = (e: SpeechRecognitionEvent) => {
    const text = e.results[0][0].transcript;
    onResult(text);
  };
  rec.onerror = (e: SpeechRecognitionErrorEvent) => onError?.(e.error);

  rec.start();
  return { stop: () => rec.stop() };
}
