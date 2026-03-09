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
  XCircle,
} from "lucide-react";

export const ActiveTimerView = ({
  settings,
  setSettings,
  blockState,
  focusCount,
  setFocusCount,
  timeLeft,
  isActive,
  setIsActive,
  formData,
  setFormData,
  adjustTimer,
  forceFinish,
  resetTimer,
  playPeep,
  advanceBlock
}) => {
  return (
    <div className="max-w-2xl mx-auto w-full py-4 text-main">
      <div className="glass-card p-10 flex flex-col items-center space-y-8 relative overflow-hidden border border-white/10">
        <div className="absolute top-0 left-0 w-full h-1 accent-bg opacity-30"></div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
            {settings.latencyBlocks ? (
              <>
                <Activity size={14} className={blockState === 'A' ? "accent-text" : blockState === 'B' ? "text-amber-500" : "text-green-500"} />{" "}
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${blockState === 'A' ? "accent-text" : blockState === 'B' ? "text-amber-500" : "text-green-500"}`}>
                  {blockState === 'A' ? "Block A: Prompting/Test Start" : blockState === 'B' ? "Block B: Manual Diagramming/Log Review" : "Block C: The Blog"}
                </span>
              </>
            ) : (
              <>
                <Zap size={14} className="accent-text" />{" "}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] accent-text">
                  Deep Work Focus
                </span>
              </>
            )}
          </div>
          {settings.latencyBlocks && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-lg animate-in zoom-in duration-300">
              <Tally5 size={12} className="accent-text" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                Cycles: {focusCount}
              </span>
            </div>
          )}
        </div>

        {!settings.latencyBlocks && (
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
        )}

        <div className="flex gap-4">
          {settings.latencyBlocks ? (
            blockState === 'A' ? (
               <button
                 onClick={() => advanceBlock(true)}
                 className="px-10 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all accent-bg accent-contrast-text"
               >
                 <Play fill="currentColor" size={20} /> START TEST
               </button>
            ) : blockState === 'B' ? (
              <>
               <button
                 onClick={() => advanceBlock(false)}
                 className="px-8 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all bg-red-500/20 border border-red-500/50 text-red-500"
               >
                 <XCircle fill="currentColor" size={20} /> FAILED
               </button>
               <button
                 onClick={() => advanceBlock(true)}
                 className="px-8 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all bg-green-500/20 border border-green-500/50 text-green-500"
               >
                 <CheckCircle fill="currentColor" size={20} /> DEPLOY SUCCESS
               </button>
              </>
            ) : (
               <button
                 onClick={() => advanceBlock(true)}
                 className="px-10 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all accent-bg accent-contrast-text"
               >
                 <CheckCircle fill="currentColor" size={20} /> FINISH CYCLE
               </button>
            )
          ) : (
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
                  <Play fill="currentColor" size={20} /> START FOCUS
                </>
              )}
            </button>
          )}
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
              {settings.latencyBlocks
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
              settings.latencyBlocks ? "I will work on..." : "I will finish..."
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
                latencyBlocks: !prev.latencyBlocks,
              }));
              resetTimer();
            }}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all border ${settings.latencyBlocks ? "accent-bg accent-border accent-contrast-text shadow-[0_0_20px_rgba(0,0,0,0.2)]" : "border-white/10 opacity-30 hover:opacity-100"}`}
          >
            {settings.latencyBlocks ? (
              <Box size={12} fill="currentColor" />
            ) : (
              <Clock size={12} />
            )}
            {settings.latencyBlocks ? "LATENCY BLOCKS: ON" : "DEEP WORK: ON"}
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