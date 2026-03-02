import React from "react";
import { Music, X, Sliders, Volume2 } from "lucide-react";

export const CustomToneModal = ({
  showToneModal,
  setShowToneModal,
  settings,
  setSettings,
  playReminder,
}) => {
  if (!showToneModal) return null;
  const scope = showToneModal;
  const config = settings.reminders[scope];
  const upd = (u) =>
    setSettings((prev) => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        [scope]: {
          ...prev.reminders[scope],
          tone: { ...prev.reminders[scope].tone, ...u },
        },
      },
    }));

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[var(--bg-color)]/95 backdrop-blur-xl">
      <div className="glass-card max-w-md w-full p-8 space-y-8 border border-white/10 text-main">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Music size={24} className="accent-text" /> {scope} Alert Sound
          </h2>
          <button
            onClick={() => setShowToneModal(null)}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase opacity-40">
              Pitch ({config.tone.freq}Hz)
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              value={config.tone.freq}
              onChange={(e) => upd({ freq: parseInt(e.target.value) })}
              className="w-full accent-accent-color"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase opacity-40">
              Volume ({Math.round(config.tone.volume * 100)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.tone.volume}
              onChange={(e) => upd({ volume: parseFloat(e.target.value) })}
              className="w-full accent-accent-color"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase opacity-40">
              Duration ({config.tone.duration}s)
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={config.tone.duration}
              onChange={(e) => upd({ duration: parseFloat(e.target.value) })}
              className="w-full accent-accent-color"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase opacity-40">
              Sound Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["sine", "triangle", "square", "sawtooth"].map((t) => (
                <button
                  key={t}
                  onClick={() => upd({ type: t })}
                  className={`py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${config.tone.type === t ? "accent-bg accent-contrast-text border-transparent" : "border-white/10"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => playReminder(config.tone)}
            className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 text-main"
          >
            <Volume2 size={16} /> Test Sound
          </button>
          <button
            onClick={() => setShowToneModal(null)}
            className="flex-1 py-4 accent-bg accent-contrast-text rounded-2xl font-black uppercase tracking-widest"
          >
            Apply Sound
          </button>
        </div>
      </div>
    </div>
  );
};
