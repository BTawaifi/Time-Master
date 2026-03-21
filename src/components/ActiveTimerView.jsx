import React, { useState } from "react";
import { BackgroundEffects } from "./BackgroundEffects";

export const ActiveTimerView = ({
  settings,
  setSettings,
  pomodoroState,
  focusCount,
  timeLeft,
  setTimeLeft,
  isActive,
  setIsActive,
  isAlerting,
  formData,
  setFormData,
  ledger,
  setLedger,
  latencySessionTotal,
  advanceLatencyBlock,
  resetLatencyWorkflow,
  resetStream,
  addStream,
  switchStream,
  removeStream,
  toggleStream,
  renameStream,
  endStream,
  updateLinkNote,
  openManualReview,
  adjustTimer,
  forceFinish,
  resetTimer,
  playPeep,
}) => {
  const isLatencyBlocks = settings.sessionMode === "latencyBlocks";
  const activeStream = ledger?.streams?.[ledger.activeStreamId] || Object.values(ledger?.streams || {})?.[0];
  const activeBlock = activeStream?.links?.[activeStream.currentLinkIndex];
  const displaySeconds = isLatencyBlocks ? activeStream?.elapsed || 0 : timeLeft;

  const [isEditingStreamName, setIsEditingStreamName] = useState(false);
  const [tempStreamName, setTempStreamName] = useState("");
  const [showEndStreamPopup, setShowEndStreamPopup] = useState(false);
  const [showResetStreamPopup, setShowResetStreamPopup] = useState(false);
  const [endStreamNotes, setEndStreamNotes] = useState("");
  const [showSessionSummaryModal, setShowSessionSummaryModal] = useState(false);
  
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [tempTimerValue, setTempTimerValue] = useState("");
  const timerClickTimeout = React.useRef(null);

  const handleAdvance = (outcome) => {
    advanceLatencyBlock(outcome, "");
  };

  const handleEndStreamConfirm = () => {
    endStream(ledger.activeStreamId, endStreamNotes);
    setShowEndStreamPopup(false);
    setEndStreamNotes("");
  };

  const handleResetStreamConfirm = () => {
    resetStream();
    setShowResetStreamPopup(false);
  };

  const handleTimerClick = (e) => {
    if (isEditingTimer) return;
    if (e.detail === 1) {
      timerClickTimeout.current = setTimeout(() => {
        playPeep(880);
        isLatencyBlocks ? toggleStream(ledger.activeStreamId) : setIsActive(!isActive);
      }, 250);
    }
  };

  const handleTimerDoubleClick = () => {
    if (timerClickTimeout.current) clearTimeout(timerClickTimeout.current);
    
    const isRunning = isLatencyBlocks ? activeStream?.isRunning : isActive;
    if (isRunning) return; // Only allow editing if stopped/paused

    const formattedTime = `${Math.floor(displaySeconds / 60)}:${(displaySeconds % 60).toString().padStart(2, "0")}`;
    setTempTimerValue(formattedTime);
    setIsEditingTimer(true);
  };

  const saveTimerValue = () => {
    setIsEditingTimer(false);
    
    let newSeconds = displaySeconds;
    const parts = tempTimerValue.split(':');
    if (parts.length === 2) {
      const m = parseInt(parts[0], 10) || 0;
      const s = parseInt(parts[1], 10) || 0;
      newSeconds = m * 60 + s;
    } else if (parts.length === 1) {
      newSeconds = parseInt(parts[0], 10) * 60 || 0;
    }
    
    if (newSeconds !== displaySeconds && newSeconds >= 0) {
      if (isLatencyBlocks) {
         setLedger(prev => {
            const s = prev.streams[ledger.activeStreamId];
            if (!s) return prev;
            return {
                ...prev,
                streams: {
                    ...prev.streams,
                    [ledger.activeStreamId]: {
                        ...s,
                        elapsed: newSeconds
                    }
                }
            };
         });
      } else {
         setTimeLeft(newSeconds);
      }
    }
  };

  const handleTimerKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveTimerValue();
    } else if (e.key === 'Escape') {
      setIsEditingTimer(false);
    }
  };

  const activeStreamsList = Object.values(ledger?.streams || {}).filter(s => !s.isFinished);
  const finishedStreamsCount = Object.values(ledger?.streams || {}).filter(s => s.isFinished).length;

  return (
    <main className="flex-1 overflow-hidden p-6 flex items-center justify-center z-10 w-full relative">
        <div className="w-full max-w-[1100px] h-full max-h-[700px] grid grid-cols-12 gap-6 relative">
            <div className="col-span-8 flex flex-col gap-6 h-full min-h-0">
                <div className="flex-1 glass-panel rounded-3xl p-8 flex flex-col relative group min-h-0">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-app-primary/50 to-transparent"></div>
                    
                    <div className="flex items-center justify-between mb-auto shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-4 py-2 bg-app-bg border border-app-border rounded-xl text-sm font-medium text-main shadow-inner hover:border-app-primary/50 transition-colors relative">
                                {activeStream?.isRunning && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-app-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-app-primary"></span>
                                    </span>
                                )}
                                <i className="ph-fill ph-stack text-app-primary"></i>
                                {isLatencyBlocks && isEditingStreamName ? (
                                    <input
                                        autoFocus
                                        value={tempStreamName}
                                        onChange={(e) => setTempStreamName(e.target.value)}
                                        onBlur={() => {
                                            if (tempStreamName.trim()) renameStream(ledger.activeStreamId, tempStreamName.trim());
                                            setIsEditingStreamName(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') e.target.blur();
                                        }}
                                        className="bg-transparent border-none outline-none focus:ring-0 text-sm font-medium text-main w-24 p-0 m-0"
                                    />
                                ) : (
                                    <span 
                                        className={isLatencyBlocks ? "cursor-text hover:text-white transition-colors" : ""}
                                        onClick={(e) => {
                                            if (isLatencyBlocks) {
                                                e.stopPropagation();
                                                setTempStreamName(activeStream?.name || "Primary");
                                                setIsEditingStreamName(true);
                                            }
                                        }}
                                    >
                                        {activeStream?.name || "Primary"}
                                    </span>
                                )}
                                {isLatencyBlocks && (
                                    <span className="font-mono text-[10px] text-app-muted bg-app-tintLow px-1.5 py-0.5 rounded border border-app-border">
                                        {((activeStream?.elapsed || 0) / 60).toFixed(1)}m
                                    </span>
                                )}
                            </div>
                            {isLatencyBlocks && (
                            <button onClick={() => addStream(`Stream ${Object.keys(ledger.streams).length + 1}`)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-app-bg text-app-muted border border-app-border hover:border-white/20 hover:text-white transition-all shadow-inner">
                                <i className="ph-bold ph-plus"></i>
                            </button>
                            )}
                        </div>
                        
                        <button onClick={() => setSettings(p => ({ ...p, autoMinimize: !p.autoMinimize }))} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer border ${settings.autoMinimize ? 'bg-app-primary text-app-primaryContrast border-transparent shadow-neon-primary scale-105' : 'bg-app-tintMed border-app-border text-app-muted hover:text-main'}`}>
                            <i className={`ph-fill ph-arrows-out-simple text-xs ${settings.autoMinimize ? 'animate-pulse' : ''}`}></i>
                            <span className="text-[10px] font-bold tracking-widest uppercase">Auto-Hide: {settings.autoMinimize ? "On" : "Off"}</span>
                        </button>
                    </div>

                    <div className={`flex flex-col items-center justify-center w-full mt-12 mb-8 relative shrink-0 transition-all`}>
                        <BackgroundEffects effectId={settings.bgEffect || 'neuralTracer'} isAlerting={isAlerting} />

                        <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.25em] text-app-muted uppercase mb-4 z-10">
                            {isLatencyBlocks ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-app-primary/10 rounded-full border border-app-primary/20 text-app-primary shadow-neon-primary-sm">
                                    {activeStream?.isRunning && <div className="w-1.5 h-1.5 rounded-full bg-app-primary shadow-[0_0_8px_#6366F1] animate-pulse"></div>}
                                    Node: {activeBlock?.label || "Link"}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1 bg-app-primary/10 rounded-full border border-app-primary/20 text-app-primary">
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-app-primary shadow-[0_0_8px_#6366F1] animate-pulse"></div>}
                                    {settings.sessionMode === 'pomodoro' ? pomodoroState : "Deep Work"}
                                </div>
                            )}
                            <span className="text-app-borderLight">|</span>
                            {isLatencyBlocks && <span className="text-main/70 font-bold bg-app-tintLow px-2 py-0.5 rounded border border-app-border">Chain Total: {Math.floor(latencySessionTotal / 60)}:{(latencySessionTotal % 60).toString().padStart(2, "0")}</span>}
                            {!isLatencyBlocks && settings.sessionMode === 'pomodoro' && <span className="text-main/50 font-bold">Sessions: {focusCount}</span>}
                        </div>
                        
                        {isEditingTimer ? (
                            <input
                                autoFocus
                                value={tempTimerValue}
                                onChange={(e) => setTempTimerValue(e.target.value)}
                                onBlur={saveTimerValue}
                                onKeyDown={handleTimerKeyDown}
                                className="text-[10rem] leading-none font-mono font-extrabold tracking-tighter text-main tabular-nums timer-glow text-center bg-transparent border-none outline-none focus:ring-0 w-full z-10 p-0 m-0"
                            />
                        ) : (
                            <h1 
                                className="text-[10rem] leading-none font-mono font-extrabold tracking-tighter text-main tabular-nums timer-glow z-10 select-none cursor-pointer" 
                                onClick={handleTimerClick}
                                onDoubleClick={handleTimerDoubleClick}
                            >
                                {Math.floor(displaySeconds / 60)}:{(displaySeconds % 60).toString().padStart(2, "0")}
                            </h1>
                        )}
                    </div>

                    <div className="mt-auto grid grid-cols-12 gap-3 z-10 shrink-0">
                        <button onClick={() => { playPeep(880); isLatencyBlocks ? toggleStream(ledger.activeStreamId) : setIsActive(!isActive); }} className={`col-span-8 group relative overflow-hidden bg-app-primary hover:bg-app-primaryHover text-app-primaryContrast rounded-2xl h-16 font-semibold flex items-center justify-center gap-3 transition-all shadow-neon-primary hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-app-primaryLight`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <i className={`ph-fill ${(isLatencyBlocks ? activeStream?.isRunning : isActive) ? "ph-pause" : "ph-play"} text-lg text-app-primaryContrast`}></i>
                            </div>
                            <span className="text-base tracking-widest font-bold uppercase text-app-primaryContrast">
                                {(isLatencyBlocks ? activeStream?.isRunning : isActive) ? "Pause" : "Start"} {isLatencyBlocks ? (activeBlock?.label || "Link") : "Session"}
                            </span>
                        </button>
                        
                        <div className="col-span-4 flex gap-3">
                            <button onClick={() => isLatencyBlocks ? handleAdvance("advance") : forceFinish()} className="flex-1 bg-app-surface border border-app-border hover:border-accent-color/50 hover:bg-app-tintLow text-main rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group">
                                <i className="ph-bold ph-arrow-right text-app-muted group-hover:accent-text transition-colors text-lg group-hover:translate-x-1"></i>
                                <span className="text-[10px] font-bold tracking-wide uppercase text-app-muted group-hover:accent-text">{isLatencyBlocks ? "Next" : "Finish"}</span>
                            </button>
                            {isLatencyBlocks ? (
                                <button onClick={() => { playPeep(440); setShowEndStreamPopup(true); }} className="w-16 bg-app-surface border border-app-border hover:border-white/20 hover:bg-white/[0.03] text-main rounded-2xl flex items-center justify-center transition-all group shadow-inner" title="End Stream">
                                    <i className="ph-bold ph-stop-circle text-xl group-hover:scale-110 transition-transform text-app-danger"></i>
                                </button>
                            ) : (
                                <button onClick={() => { playPeep(440); resetTimer(); }} className="w-16 bg-app-surface border border-app-danger/20 hover:border-app-danger/50 hover:bg-app-danger/10 text-app-danger rounded-2xl flex items-center justify-center transition-all group shadow-inner" title="Reset Timer">
                                    <i className="ph-bold ph-arrow-counter-clockwise text-xl group-hover:scale-110 transition-transform"></i>
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-3 shrink-0">
                        {isLatencyBlocks && (
                            <button onClick={() => { playPeep(440); setShowResetStreamPopup(true); }} className="w-16 h-12 bg-app-surface border border-white/5 hover:border-white/10 hover:bg-white/[0.03] rounded-xl flex items-center justify-center text-app-muted hover:text-white transition-all shadow-inner" title="Reset Stream">
                                <i className="ph-bold ph-arrow-counter-clockwise text-lg"></i>
                            </button>
                        )}
                        {(isLatencyBlocks || settings.sessionMode === 'deepWork') && (
                            <button onClick={() => isLatencyBlocks ? setShowSessionSummaryModal(true) : openManualReview()} className="flex-1 h-12 bg-app-surface border border-app-border hover:border-accent-color/30 hover:bg-app-tintLow text-app-muted hover:text-main rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm shadow-inner group">
                                <i className="ph-bold ph-check-square-offset text-app-primary group-hover:scale-110 transition-transform"></i>
                                Review & Save Session
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Horizontal Stream List Layout when Latency Blocks */}
                {isLatencyBlocks && (activeStreamsList.length > 1 || finishedStreamsCount > 0) && (
                    <div className="glass-panel rounded-3xl p-6 flex items-center gap-4 overflow-x-auto no-scrollbar">
                        {activeStreamsList.map(s => (
                             <div key={s.id} onClick={() => switchStream(s.id)} onDoubleClick={() => toggleStream(s.id)} className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all border relative ${s.id === ledger.activeStreamId ? 'bg-app-primary/10 border-app-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-app-surface border-white/5 hover:bg-white/[0.03]'}`}>
                                {s.isRunning && (
                                    <div className="absolute top-2 right-2 flex h-2 w-2">
                                        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-app-primary opacity-75"></div>
                                        <div className="relative inline-flex rounded-full h-2 w-2 bg-app-primary/80"></div>
                                    </div>
                                )}
                                <i className={`ph-fill ph-stack text-xl ${s.isRunning ? 'text-app-primary animate-pulse' : 'text-app-muted'}`}></i>
                                <div className="flex flex-col">
                                    <span className={`text-xs font-bold tracking-widest uppercase transition-colors ${s.isRunning ? 'text-white' : 'text-app-muted'}`}>{s.name}</span>
                                    <span className="text-[10px] text-app-muted font-mono">{((s.elapsed || 0) / 60).toFixed(1)}m</span>
                                </div>
                                {s.id !== 'default' && (
                                    <button onClick={(e) => { e.stopPropagation(); removeStream(s.id); }} className="w-8 h-8 ml-2 rounded-full flex items-center justify-center text-app-muted hover:text-app-danger hover:bg-app-danger/10 transition-colors">
                                        <i className="ph-bold ph-trash"></i>
                                    </button>
                                )}
                            </div>
                        ))}
                        {finishedStreamsCount > 0 && (
                            <div className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl bg-app-success/10 border border-app-success/20 text-app-success relative">
                                <i className="ph-bold ph-check-circle text-lg"></i>
                                <span className="text-xs font-bold tracking-widest uppercase">{finishedStreamsCount} Finished</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="col-span-4 flex flex-col gap-4 h-full min-h-0">
                <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 shadow-glass border-t border-t-white/10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-app-muted">
                            <i className="ph-bold ph-rows text-sm"></i>
                            <span className="text-[10px] font-bold tracking-widest uppercase">{isLatencyBlocks ? "Link Objective" : "Session Goal"}</span>
                        </div>
                        {isLatencyBlocks && (
                            <div className="px-2.5 py-1 bg-app-bg border border-app-border rounded text-xs font-mono text-main shadow-inner">
                                Lvl: {(activeStream?.currentLinkIndex || 0) + 1}
                            </div>
                        )}
                    </div>
                    
                    <div className="w-full bg-app-tintLow border border-app-border rounded-xl p-4 hover:border-app-primary/30 transition-colors group relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-app-primary/50 group-hover:bg-app-primary transition-colors"></div>
                        {isLatencyBlocks ? (
                            <textarea
                                value={activeStream?.links?.[activeStream?.currentLinkIndex]?.note || ""}
                                onChange={(e) => updateLinkNote(ledger.activeStreamId, activeStream.links[activeStream.currentLinkIndex].id, e.target.value)}
                                placeholder="Set Link Objective..."
                                className="w-full min-h-[60px] bg-transparent border-none text-sm font-medium text-main p-0 resize-none focus:outline-none focus:ring-0 placeholder:text-app-muted"
                            />
                        ) : (
                            <textarea
                                value={formData.bet || ""}
                                onChange={(e) => setFormData(p => ({ ...p, bet: e.target.value }))}
                                placeholder="Set Objective..."
                                className="w-full min-h-[60px] bg-transparent border-none text-sm font-medium text-main p-0 resize-none focus:outline-none focus:ring-0 placeholder:text-app-muted"
                            />
                        )}
                    </div>
                </div>

                {isLatencyBlocks && (
                <div className="flex-1 min-h-0 glass-panel rounded-2xl p-6 flex flex-col shadow-glass border-t border-t-white/10">
                    <h3 className="text-[10px] font-bold tracking-widest text-app-muted uppercase mb-6 flex items-center gap-2 shrink-0">
                        <i className="ph-fill ph-link text-app-primary"></i> Neural Chain
                    </h3>
                    
                    <div className="relative flex-1 px-4 py-4 overflow-y-auto no-scrollbar">
                        <div className="absolute left-[calc(3rem-1px)] top-2 bottom-8 w-0.5 bg-app-borderLight rounded-full"></div>
                        <div className="absolute left-[calc(3rem-1px)] top-2 min-h-2 w-0.5 bg-gradient-to-b from-app-success to-app-primary rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{height: `${Math.min(100, Math.max(5, (activeStream?.currentLinkIndex / Math.max(1, (activeStream?.links?.length || 2) - 1)) * 100))}%`}}></div>

                        {activeStream?.links?.map((link, idx) => {
                            const isPast = idx < activeStream.currentLinkIndex;
                            const isCurrent = idx === activeStream.currentLinkIndex;
                            return (
                            <div key={link.id || idx} className="flex items-start gap-4 relative z-10 mb-8 group">
                                {isPast ? (
                                    <div className="w-8 h-8 ml-4 rounded-full bg-app-bg border-2 border-app-success flex items-center justify-center text-app-success shadow-neon-success shrink-0 mt-0.5">
                                        <i className="ph-bold ph-check text-sm"></i>
                                    </div>
                                ) : isCurrent ? (
                                    <div className="w-10 h-10 ml-3 rounded-full bg-app-bg border-2 border-app-primary flex items-center justify-center text-app-primary shadow-[0_0_25px_rgba(99,102,241,0.5)] shrink-0 relative">
                                        {activeStream.isRunning && <div className="absolute inset-0 rounded-full border border-app-primary animate-ping opacity-50"></div>}
                                        <span className="font-bold text-sm font-mono text-main">{idx + 1}</span>
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 ml-4 rounded-full bg-app-bg border-2 border-app-border flex items-center justify-center text-app-muted shrink-0 mt-0.5">
                                        <span className="text-xs font-mono">{idx + 1}</span>
                                    </div>
                                )}
                                
                                <div className={`flex flex-col pt-${isCurrent ? '2' : '1'}`}>
                                    <span className={`text-${isCurrent?'sm':'xs'} font-bold ${isPast ? 'text-app-success' : isCurrent ? 'text-main' : 'text-app-muted'} tracking-widest uppercase mb-1 transition-colors group-hover:text-main`}>
                                        {link.label}
                                    </span>
                                    {link.note && (
                                        <p className="text-[10px] text-app-muted italic break-words whitespace-pre-wrap max-w-[200px] mb-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                            {link.note}
                                        </p>
                                    )}
                                    
                                    {isPast && (
                                        <span className="text-[10px] text-app-muted font-mono bg-app-tintLow px-2 py-0.5 rounded border border-app-border w-fit">Completed</span>
                                    )}
                                    {isCurrent && (
                                        <span className="text-[10px] text-app-primary font-mono bg-app-primary/10 px-2 py-0.5 rounded border border-app-primary/20 w-fit flex items-center gap-1">
                                            {activeStream.isRunning ? <div className="w-1.5 h-1.5 rounded-full bg-app-primary animate-pulse"></div> : null}
                                            {activeStream.isRunning ? "Running" : "Awaiting Start"}
                                        </span>
                                    )}
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </div>
                )}

                {isLatencyBlocks && activeStream?.history?.length > 0 && (
                <div className="h-40 glass-panel rounded-2xl flex flex-col overflow-hidden shadow-glass border-t border-app-border shrink-0">
                    <div className="px-4 py-2 border-b border-app-border bg-app-tintLow flex items-center justify-between shrink-0">
                        <h3 className="text-[10px] font-bold tracking-widest text-app-muted uppercase">Transition Log</h3>
                        <button className="text-app-muted hover:text-main transition-colors"><i className="ph-bold ph-arrows-down-up text-xs"></i></button>
                    </div>
                    <div className="p-2 space-y-1 overflow-y-auto no-scrollbar">
                        {[...(activeStream?.history || [])].reverse().map((entry, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-app-tintMed transition-colors border border-transparent hover:border-app-border">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${entry.label === 'FAILURE' ? 'bg-app-danger' : 'bg-app-success'}`}></div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-main tracking-wide">{entry.block} <span className="text-app-muted font-normal ml-1">{entry.duration}s</span></span>
                                        <span className="text-[9px] text-app-muted/80 italic">{entry.comment || "No comment recorded"}</span>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-bold tracking-wider ${entry.label === 'FAILURE' ? 'text-app-danger bg-app-danger/10' : 'text-app-success bg-app-success/10'} px-1.5 py-0.5 rounded`}>
                                    {entry.label === 'FAILURE' ? 'BROKEN' : 'FINALIZED'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                )}
            </div>
        </div>

        {/* End Stream Popup Modal */}
        {showEndStreamPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-app-bg border border-app-border rounded-2xl p-6 shadow-glass w-[400px] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-main flex items-center gap-2">
                            <i className="ph-bold ph-stop-circle text-app-primary"></i> End Stream
                        </h2>
                        <button onClick={() => setShowEndStreamPopup(false)} className="text-app-muted hover:text-main">
                            <i className="ph-bold ph-x"></i>
                        </button>
                    </div>
                    <p className="text-sm text-app-muted">
                        Are you sure you want to end this stream? It will be hidden from your active list and saved for your final session review.
                    </p>
                    <textarea 
                        value={endStreamNotes}
                        onChange={(e) => setEndStreamNotes(e.target.value)}
                        placeholder="End stream review notes (optional)..."
                        className="w-full h-24 bg-app-input border border-app-border rounded-xl p-3 text-sm text-main placeholder:text-app-muted focus:outline-none focus:border-app-primary/50 resize-none"
                    />
                    <div className="flex justify-end gap-3 mt-2">
                        <button 
                            onClick={() => setShowEndStreamPopup(false)}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-app-muted hover:text-main hover:bg-app-tintLow transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleEndStreamConfirm}
                            className="px-4 py-2 rounded-xl text-sm font-bold bg-app-primary hover:bg-app-primaryHover text-app-primaryContrast shadow-neon-primary transition-colors"
                        >
                            End Stream
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Session Summary Modal */}
        {showSessionSummaryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
                <div className="bg-app-bg border border-app-border rounded-2xl p-6 shadow-glass w-[600px] max-w-full max-h-full flex flex-col gap-4">
                    <div className="flex items-center justify-between shrink-0">
                        <h2 className="text-lg font-bold text-main flex items-center gap-2">
                            <i className="ph-bold ph-list-dashes text-app-primary"></i> Session Summary
                        </h2>
                        <button onClick={() => setShowSessionSummaryModal(false)} className="text-app-muted hover:text-main">
                            <i className="ph-bold ph-x"></i>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                        {Object.values(ledger?.streams || {}).map((stream) => (
                            <div key={stream.id} className="bg-app-surface border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <h3 className="text-sm font-bold text-main">{stream.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-app-muted font-mono">{((stream.elapsed || 0) / 60).toFixed(1)}m</span>
                                        {stream.isFinished ? (
                                            <span className="text-[10px] font-bold tracking-widest uppercase text-app-success bg-app-success/10 px-2 py-0.5 rounded">Finished</span>
                                        ) : (
                                            <span className="text-[10px] font-bold tracking-widest uppercase text-app-primary bg-app-primary/10 px-2 py-0.5 rounded">Active</span>
                                        )}
                                    </div>
                                </div>
                                
                                {stream.links && stream.links.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <h4 className="text-[10px] font-bold tracking-widest uppercase text-app-muted">Links</h4>
                                        {stream.links.map((link) => (
                                            <div key={link.id} className="bg-app-tintLow rounded-lg p-3 border border-app-border">
                                                <div className="text-xs font-semibold text-main mb-1">{link.label}</div>
                                                <div className="text-xs text-app-muted whitespace-pre-wrap">{link.note || <span className="italic opacity-50">No objective set</span>}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {stream.isFinished && stream.reviewNotes && (
                                    <div className="flex flex-col gap-1 mt-1">
                                        <h4 className="text-[10px] font-bold tracking-widest uppercase text-app-muted">End Stream Notes</h4>
                                        <div className="text-xs text-app-muted bg-app-tintLow rounded-lg p-3 border border-app-border whitespace-pre-wrap">
                                            {stream.reviewNotes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 mt-2 shrink-0 pt-2 border-t border-white/10">
                        <button
                            onClick={() => setShowSessionSummaryModal(false)}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-app-muted hover:text-main hover:bg-app-tintLow transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                setShowSessionSummaryModal(false);
                                openManualReview();
                            }}
                            className="px-4 py-2 rounded-xl text-sm font-bold bg-app-primary hover:bg-app-primaryHover text-app-primaryContrast shadow-neon-primary transition-colors flex items-center gap-2"
                        >
                            <i className="ph-bold ph-check-square-offset"></i>
                            Proceed to Review
                        </button>
                    </div>
                </div>
            </div>
        )}
        {/* Reset Stream Popup Modal */}
        {showResetStreamPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-app-bg border border-app-border rounded-2xl p-6 shadow-glass w-[400px] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-main flex items-center gap-2">
                            <i className="ph-bold ph-arrow-counter-clockwise text-app-primary"></i> Reset Stream
                        </h2>
                        <button onClick={() => setShowResetStreamPopup(false)} className="text-app-muted hover:text-main">
                            <i className="ph-bold ph-x"></i>
                        </button>
                    </div>
                    <p className="text-sm text-app-muted">
                        Are you sure you want to reset this stream? This will reset the timer and clear all your current links for this specific stream.
                    </p>
                    <div className="flex justify-end gap-3 mt-2">
                        <button
                            onClick={() => setShowResetStreamPopup(false)}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-app-muted hover:text-main hover:bg-app-tintLow transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleResetStreamConfirm}
                            className="px-4 py-2 rounded-xl text-sm font-bold bg-app-primary hover:bg-app-primaryHover text-app-primaryContrast shadow-neon-primary transition-colors"
                        >
                            Reset Stream
                        </button>
                    </div>
                </div>
            </div>
        )}
    </main>
  );
};
