import React from "react";
import {
  Activity,
  ClipboardCheck,
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
  Workflow,
  ArrowRight,
  RefreshCcw,
  Layers,
  Check,
  X as XIcon,
  Trash2,
} from "lucide-react";
import { LATENCY_BLOCKS, SESSION_MODES } from "../constants";
import { shouldShowLatencyReviewAction } from "../sessionReview.mjs";

export const ActiveTimerView = ({
  settings,
  setSettings,
  pomodoroState,
  focusCount,
  timeLeft,
  isActive,
  setIsActive,
  formData,
  setFormData,
  ledger,
  latencySessionTotal,
  advanceLatencyBlock,
  resetLatencyWorkflow,
  addStream,
  switchStream,
  removeStream,
  openManualReview,
  adjustTimer,
    forceFinish,
    resetTimer,
    playPeep,
}) => {
  const [stepNote, setStepNote] = React.useState("");
  const [isAddingStream, setIsAddingStream] = React.useState(false);
  const [newStreamName, setNewStreamName] = React.useState("");
  const [confirmDeleteStreamId, setConfirmDeleteStreamId] = React.useState(null);
  const isPomodoro = settings.sessionMode === "pomodoro";
  const isLatencyBlocks = settings.sessionMode === "latencyBlocks";
  const activeStream = ledger.streams[ledger.activeStreamId] || Object.values(ledger.streams)[0];
  const activeBlock = activeStream.links[activeStream.currentLinkIndex];
  const latencyCycleCount = activeStream.currentLinkIndex;
  const latencyHistory = activeStream.history || [];

  const displaySeconds = isLatencyBlocks ? activeStream.elapsed : timeLeft;
  const goalPrompt = isLatencyBlocks
    ? "What is this loop trying to prove?"
    : isPomodoro
      ? "I will work on..."
      : "I will finish...";

  const selectMode = (modeId) => {
    playPeep(660, 0.05);
    setSettings((prev) => ({ ...prev, sessionMode: modeId }));
  };

  const handleAddStream = () => {
    const name = newStreamName.trim() || `Stream ${Object.keys(ledger.streams).length + 1}`;
    addStream(name);
    setNewStreamName("");
    setIsAddingStream(false);
    playPeep(880, 0.1);
  };

  const handleAdvance = (outcome) => {
    advanceLatencyBlock(outcome, stepNote);
    setStepNote("");
  };

  const currentLatencyAction = {
    label: "Next Link",
    icon: <ArrowRight size={18} className="accent-text" />,
    onClick: () => handleAdvance("advance"),
  };

  const canReviewLatencySession = isLatencyBlocks;

  return (
    <div className="max-w-2xl mx-auto w-full py-4 text-main">
      <div className="glass-card p-10 flex flex-col items-center space-y-8 relative overflow-hidden border border-white/10">
        <div className="absolute top-0 left-0 w-full h-1 accent-bg opacity-30"></div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
            {isLatencyBlocks ? (
              <>
                <Workflow size={14} className="accent-text" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] accent-text">
                  Neuro-Ledger
                </span>
              </>
            ) : isPomodoro ? (
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
          {isPomodoro && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-lg animate-in zoom-in duration-300">
              <Tally5 size={12} className="accent-text" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                Sessions: {focusCount}
              </span>
            </div>
          )}
          {isLatencyBlocks && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-lg animate-in zoom-in duration-300">
              <Tally5 size={12} className="accent-text" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                Depth: {latencyCycleCount + 1}
              </span>
            </div>
          )}
        </div>
        {isLatencyBlocks ? (
          <>
            <div className="w-full space-y-8">
              {/* Stream Nav */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5 no-scrollbar">
                {Object.values(ledger.streams).map((s) => (
                  <div 
                    key={s.id}
                    className="flex items-center gap-0 group"
                  >
                    <button
                      onClick={() => switchStream(s.id)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-l-xl border-y border-l transition-all whitespace-nowrap ${s.id === ledger.activeStreamId ? "accent-border bg-accent-color/10 accent-text" : "border-white/5 opacity-40 hover:opacity-100 hover:bg-white/5"} ${s.id === 'default' ? 'rounded-r-xl border-r' : ''}`}
                    >
                      <Layers size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
                      <span className="text-[9px] opacity-40 font-mono">{(s.elapsed / 60).toFixed(1)}m</span>
                    </button>
                    {s.id !== 'default' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirmDeleteStreamId === s.id) {
                            removeStream(s.id);
                            setConfirmDeleteStreamId(null);
                          } else {
                            setConfirmDeleteStreamId(s.id);
                          }
                        }}
                        onBlur={() => setConfirmDeleteStreamId(null)}
                        className={`px-2 py-2.5 rounded-r-xl border-y border-r transition-all flex items-center gap-1 ${confirmDeleteStreamId === s.id ? "bg-red-500/20 text-red-400 opacity-100 border-red-500/30" : "border-white/5 opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:bg-red-500/10 hover:text-red-400"} ${s.id === ledger.activeStreamId ? "accent-border border-l-0" : ""}`}
                      >
                        <Trash2 size={12} />
                        {confirmDeleteStreamId === s.id && (
                          <span className="text-[8px] font-black uppercase tracking-widest animate-in fade-in duration-200">Purge?</span>
                        )}
                      </button>
                    )}
                  </div>
                ))}
                {isAddingStream ? (
                  <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                    <input
                      autoFocus
                      type="text"
                      value={newStreamName}
                      onChange={(e) => setNewStreamName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddStream();
                        if (e.key === "Escape") setIsAddingStream(false);
                      }}
                      placeholder="Stream Name..."
                      className="bg-white/5 border border-accent-color/30 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-accent-color transition-all w-32"
                    />
                    <button
                      onClick={handleAddStream}
                      className="p-2.5 rounded-xl bg-accent-color/20 text-accent-text border border-accent-color/30 hover:bg-accent-color/30 transition-all"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setIsAddingStream(false)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 opacity-40 hover:opacity-100 transition-all"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingStream(true)}
                    className="p-2.5 rounded-xl border border-white/5 opacity-40 hover:opacity-100 hover:bg-white/5 transition-all text-main"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>

              {/* Active Stream Chain */}
              <div className="w-full flex items-center justify-center py-6 min-h-[120px]">
                <div className="flex items-center gap-0 w-full max-w-2xl justify-start relative overflow-x-auto no-scrollbar py-4 px-4">
                  <div className="absolute top-[48px] left-0 w-full h-[2px] bg-white/5 z-0"></div>
                  {activeStream.links.map((link, idx) => {
                    const isCurrent = idx === activeStream.currentLinkIndex;
                    const isCompleted = idx < activeStream.currentLinkIndex;
                    return (
                      <div
                        key={link.id}
                        className="flex flex-col items-center relative mr-12 last:mr-0 shrink-0"
                      >
                        <div
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 ${isCurrent ? "accent-border bg-accent-color/20 shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] scale-110" : isCompleted ? "border-green-500/50 bg-green-500/10" : "border-white/10 bg-black/20 opacity-40"}`}
                        >
                          {isCompleted ? (
                            <CheckCircle size={20} className="text-green-500" />
                          ) : (
                            <span className={`text-sm font-black ${isCurrent ? "accent-text" : "opacity-40"}`}>
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        <div className={`absolute top-14 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 ${isCurrent ? "accent-text opacity-100" : "opacity-20"}`}>
                          {link.label}
                        </div>
                        {idx < activeStream.links.length - 1 && (
                          <div className={`absolute left-[48px] top-[24px] w-12 h-[2px] transition-colors duration-500 ${isCompleted ? "bg-green-500/30" : "bg-white/5"}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                Elapsed in {activeBlock?.label ?? "link"} • Total: {Math.floor(latencySessionTotal / 60)}:{(latencySessionTotal % 60).toString().padStart(2, "0")}
              </span>
              <div className="text-7xl font-mono font-light tracking-tighter">
                {Math.floor(displaySeconds / 60)}:
                {(displaySeconds % 60).toString().padStart(2, "0")}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  playPeep(880);
                  setIsActive(!isActive);
                }}
                className={`px-10 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${isActive ? "bg-amber-500/20 border border-amber-500/50 text-amber-500" : "accent-bg accent-contrast-text"}`}
              >
                {isActive ? (
                  <>
                    <Pause fill="currentColor" size={20} /> PAUSE BLOCK
                  </>
                ) : (
                  <>
                    <Play fill="currentColor" size={20} /> START {(activeBlock?.label || "Link").toUpperCase()}
                  </>
                )}
              </button>
              <button
                onClick={currentLatencyAction.onClick}
                className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl transition-all font-bold text-xs uppercase flex items-center gap-2 text-main"
              >
                {currentLatencyAction.icon}
                {currentLatencyAction.label}
              </button>
              <button
                onClick={() => handleAdvance("failure")}
                className="px-6 py-4 bg-red-500/10 border border-red-500/30 rounded-2xl transition-all font-bold text-xs uppercase flex items-center gap-2 text-red-300"
              >
                <RefreshCcw size={18} /> Break Chain
              </button>
              <button
                onClick={resetLatencyWorkflow}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl transition-all text-main"
              >
                <RotateCcw size={20} />
              </button>
              {canReviewLatencySession && (
                <button
                  onClick={openManualReview}
                  className="px-6 py-4 accent-bg accent-contrast-text rounded-2xl transition-all font-bold text-xs uppercase flex items-center gap-2"
                >
                  <ClipboardCheck size={18} />
                  Review & Save
                </button>
              )}
            </div>
            <div className="w-full max-w-md">
              <input
                type="text"
                value={stepNote}
                onChange={(e) => setStepNote(e.target.value)}
                placeholder={`Optional note for this ${activeBlock?.label || "link"} step...`}
                className="input-field py-3 text-center text-xs bg-white/5 border-white/5 placeholder:opacity-30"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-6">
              <button
                onClick={() => adjustTimer(-300)}
                className="p-2 hover:bg-white/5 rounded-full opacity-40 hover:opacity-100 transition-all"
              >
                <Minus size={24} />
              </button>
              <div className="text-7xl font-mono font-light tracking-tighter">
                {Math.floor(displaySeconds / 60)}:
                {(displaySeconds % 60).toString().padStart(2, "0")}
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
                    <Play fill="currentColor" size={20} /> START {pomodoroState === "rest" ? "REST" : "FOCUS"}
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
          </>
        )}
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-3 justify-center">
            <TargetIcon className="accent-text" size={18} />
            <h2 className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">
              {isLatencyBlocks
                ? "Current loop objective"
                : isPomodoro
                  ? "I'm focusing on"
                  : "My Goal for this session"}
            </h2>
          </div>
          <textarea
            value={formData.bet}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bet: e.target.value }))
            }
            placeholder={goalPrompt}
            className="input-field h-24 resize-none text-center bg-black/20 border-white/5 focus:border-accent-color/30"
          />
          {isLatencyBlocks && latencyHistory.length > 0 && (
            <div className="glass-card border-white/5 p-4 space-y-3">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-center">
                Recent transitions
              </div>
              <div className="space-y-2">
                {[...latencyHistory].reverse().map((entry, index) => (
                  <div
                    key={`${entry.timestamp}-${index}`}
                    className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest">
                      <span className="accent-text opacity-60 font-black">{entry.block}: {entry.duration}s</span>
                      <span className="opacity-40">{entry.label}</span>
                    </div>
                    {entry.comment ? (
                      <div className="text-sm data-text font-black italic pl-3 border-l-2 border-accent-color py-2 bg-accent-color/10 rounded-r-lg animate-in slide-in-from-left-1 duration-300">
                        "{entry.comment}"
                      </div>
                    ) : (
                      <div className="text-[10px] opacity-20 italic pl-3 border-l border-white/10">
                        No comment recorded
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="pt-4 border-t border-white/5 w-full flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SESSION_MODES.map((mode) => {
              const isSelected = settings.sessionMode === mode.id;
              const Icon =
                mode.id === "deepWork"
                  ? Zap
                  : mode.id === "pomodoro"
                    ? Clock
                    : Box;
              return (
                <button
                  key={mode.id}
                  onClick={() => selectMode(mode.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all border ${isSelected ? "accent-bg accent-border accent-contrast-text shadow-[0_0_20px_rgba(0,0,0,0.2)]" : "border-white/10 opacity-40 hover:opacity-100"}`}
                >
                  <Icon size={12} />
                  {mode.label.toUpperCase()}
                </button>
              );
            })}
          </div>
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
