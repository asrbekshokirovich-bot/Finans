import { useState } from "react";
import { Mic, Plus, Send } from "lucide-react";
import { useFinans } from "../lib/store";
import { useToast } from "../lib/toast";
import { fmtDate } from "../lib/format";
import type { TaskStatus } from "../lib/types";

const statusStyle: Record<TaskStatus, string> = {
  yangi: "bg-slate-100 text-slate-600",
  jarayonda: "bg-amber-100 text-amber-700",
  bajarildi: "bg-emerald-100 text-emerald-700",
};
const nextStatus: Record<TaskStatus, TaskStatus> = {
  yangi: "jarayonda",
  jarayonda: "bajarildi",
  bajarildi: "yangi",
};

export default function Tasks() {
  const { tasks, workers, addTask, setTaskStatus, currentUser, canAssignTasks } = useFinans();
  const toast = useToast();
  const ishchilar = workers.filter((w) => w.role === "ishchi");
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState((ishchilar[0] ?? workers[0]).name);
  const [voiceMode, setVoiceMode] = useState(false);

  // Ishchi faqat o'ziga berilgan vazifalarni ko'radi; owner/admin hammasini
  const visibleTasks = canAssignTasks ? tasks : tasks.filter((t) => t.assignedTo === currentUser.name);

  const add = (viaVoice: boolean) => {
    if (!title.trim()) return;
    addTask({ title: title.trim(), assignedTo, viaVoice });
    setTitle("");
    toast(viaVoice ? `${assignedTo}ga ovozli vazifa yuborildi` : `Vazifa ${assignedTo}ga biriktirildi`, "success");
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Ishchilar vazifalari</h1>
        <p className="text-slate-500 text-sm">
          {canAssignTasks
            ? "Admin vazifa biriktiradi — Telegram bot ishchiga yetkazadi (real integratsiya keyin)"
            : "Sizga biriktirilgan vazifalar"}
        </p>
      </div>

      {/* Vazifa yaratish — faqat owner/admin */}
      {canAssignTasks && (
      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceMode((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${
              voiceMode ? "bg-brand-600 text-white border-brand-600" : "border-slate-200 text-slate-600"
            }`}
          >
            <Mic size={15} /> Ovozli buyruq
          </button>
          <span className="text-xs text-slate-400">
            {voiceMode ? "Admin ovozda ism + vazifani aytadi, AI ajratadi (taqlid)" : "Qo'lda kiritish"}
          </span>
        </div>

        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={voiceMode ? "Masalan: Jasur omborni sanasin..." : "Vazifa matni"}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
            {ishchilar.map((w) => (
              <option key={w.id} value={w.name}>{w.name}</option>
            ))}
          </select>
          <button
            onClick={() => add(voiceMode)}
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 rounded-lg text-sm font-medium"
          >
            {voiceMode ? <Send size={15} /> : <Plus size={15} />}
            {voiceMode ? "Yuborish" : "Qo'shish"}
          </button>
        </div>
      </div>
      )}

      {/* Vazifalar ro'yxati */}
      <div className="space-y-2">
        {visibleTasks.map((t) => (
          <div key={t.id} className="card p-4 flex items-center justify-between transition-all hover:shadow-card animate-slideUp">
            <div>
              <div className="font-medium flex items-center gap-2">
                {t.viaVoice && <Mic size={14} className="text-brand-500" />}
                {t.title}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {t.assignedTo} · {fmtDate(t.createdAt)}
              </div>
            </div>
            <button
              onClick={() => setTaskStatus(t.id, nextStatus[t.status])}
              className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyle[t.status]}`}
            >
              {t.status}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
