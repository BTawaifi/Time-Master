import React from "react";
import {
  Activity,
  Coffee,
  Zap,
  Tally5,
  Minus,
  Plus,
  Pause,
  Play,
  CheckCircle,
  RotateCcw,
  Target as TargetIcon,
  Box,
  Clock,
  Minimize2,
} from "lucide-react";

export const ActiveTimerView = ({
  settings,
  setSettings,
  pomodoroState,
  setPomodoroState,
  focusCount,
  setFocusCount,
  timeLeft,
  setTimeLeft,
  isActive,
  setIsActive,
  formData,
  setFormData,
  adjustTimer,
  forceFinish,
  resetTimer,
  playPeep,
}) => {
  return (
    <div className="max-w-2xl mx-auto w-full py-4 text-main">
      <div className="glass-card p-10 flex flex-col items-center space-y-8 relative overflow-hidden border border-white/10">
        <div className="absolute top-0 left-0 w-full h-1 accent-bg opacity-30"></div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
            {settings.pomodoroOnly ? (
              pomodoroState === "focus" ? (
                <>
                  <Activity size={14} className="accent-text" />{" "}
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] accent-text">
                    Focusing
                  </span>
                </>
              ) : (
                <>
                  <Coffee size={14} className="text-amber-500" />{" "}
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                    Resting
                  </span>
                </>
              )
            ) : (
              <>
                <Zap size={14} className="accent-text" />{" "}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] accent-text">
                  Deep Work Focus
                </span>
              </>
            )}
          </div>
          {settings.pomodoroOnly && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-lg animate-in zoom-in duration-300">
              <Tally5 size={12} className="accent-text" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                Sessions: {focusCount}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => adjustTimer(-300)}
            className="p-2 hover:bg-white/5 rounded-full opacity-40 hover:opacity-100 transition-all"
          >
            <Minus size={24} />
          </button>
          <div className="text-7xl font-mono font-light tracking-tighter">
            {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </div>
          <button
            onClick={() => adjustTimer(300)}
            className="p-2 hover:bg-white/5 rounded-full opacity-40 hover:opacity-100 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              playPeep(880);
              setIsActive(!isActive);
            }}
            className={`px-10 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${isActive ? "bg-amber-500/20 border border-amber-500/50 text-amber-500" : "accent-bg accent-contrast-text"}`}
          >
            {isActive ? (
              <>
                <Pause fill="currentColor" size={20} /> PAUSE
              </>
            ) : (
              <>
                <Play fill="currentColor" size={20} /> START{" "}
                {pomodoroState === "rest" ? "REST" : "FOCUS"}
              </>
            )}
          </button>
          <button
            onClick={forceFinish}
            className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl transition-all font-bold text-xs uppercase flex items-center gap-2 text-main"
          >
            <CheckCircle size={18} className="text-green-500" /> Finish
          </button>
          <button
            onClick={resetTimer}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl transition-all text-main"
          >
            <RotateCcw size={20} />
          </button>
        </div>
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-3 justify-center">
            <TargetIcon className="accent-text" size={18} />
            <h2 className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">
              {settings.pomodoroOnly
                ? "I'm focusing on"
                : "My Goal for this session"}
            </h2>
          </div>
          <textarea
            value={formData.bet}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bet: e.target.value }))
            }
            placeholder={
              settings.pomodoroOnly ? "I will work on..." : "I will finish..."
            }
            className="input-field h-24 resize-none text-center bg-black/20 border-white/5 focus:border-accent-color/30"
          />
        </div>
        <div className="pt-4 border-t border-white/5 w-full flex flex-col items-center gap-3">
          <button
            onClick={() => {
              playPeep(660, 0.05);
              setFocusCount(0);
              setSettings((prev) => ({
                ...prev,
                pomodoroOnly: !prev.pomodoroOnly,
              }));
              if (pomodoroState === "rest") {
                setPomodoroState("focus");
                setTimeLeft(settings.timerDuration);
              }
            }}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all border ${settings.pomodoroOnly ? "accent-bg accent-border accent-contrast-text shadow-[0_0_20px_rgba(0,0,0,0.2)]" : "border-white/10 opacity-30 hover:opacity-100"}`}
          >
            {settings.pomodoroOnly ? (
              <Box size={12} fill="currentColor" />
            ) : (
              <Clock size={12} />
            )}
            {settings.pomodoroOnly ? "SIMPLE TIMER: ON" : "DEEP WORK: ON"}
          </button>
          <button
            onClick={() => {
              playPeep(660, 0.05);
              setSettings((prev) => ({
                ...prev,
                autoMinimize: !prev.autoMinimize,
              }));
            }}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all border ${settings.autoMinimize ? "accent-bg accent-border accent-contrast-text" : "border-white/10 opacity-20 hover:opacity-100"}`}
          >
            <Minimize2 size={12} />
            {settings.autoMinimize ? "AUTO-HIDE: ON" : "AUTO-HIDE: OFF"}
          </button>
        </div>
      </div>
    </div>
  );
};
