import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Clock3,
  CornerDownLeft,
  Flag,
  PauseCircle,
  PlayCircle,
  Sparkles,
  TimerReset,
  Waypoints,
  Zap,
} from "lucide-react";
import { BackgroundEffects } from "./BackgroundEffects";

const formatSeconds = (seconds = 0) => {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
};

const formatNoteTimestamp = (note) => {
  const rawTimestamp = note?.timestamp || note?.createdAt || note?.capturedAt || note?.date || "";
  if (!rawTimestamp) {
    return "recent";
  }

  if (typeof rawTimestamp === "string") {
    const parts = rawTimestamp.split(", ");
    return parts[1] || parts[0] || rawTimestamp;
  }

  const parsed = new Date(rawTimestamp);
  if (Number.isNaN(parsed.getTime())) {
    return "recent";
  }

  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getQuickNotePreview = (note) => {
  const rawPreview =
    note?.content ||
    note?.output ||
    note?.note ||
    note?.title ||
    note?.summary ||
    "";

  const text = String(rawPreview).trim();
  if (!text) {
    return "Pinned for later follow-up.";
  }

  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
};

const statusStyles = {
  idle: "bg-app-tintLow text-app-muted border-app-border",
  active: "bg-app-primary/10 text-app-primary border-app-primary/30",
  waiting: "bg-yellow-500/10 text-yellow-300 border-yellow-400/20",
  paused: "bg-app-surface text-main border-app-border",
};

const ModalShell = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/65 backdrop-blur-sm p-6">
    <div className="w-full max-w-lg rounded-3xl border border-app-border bg-app-bg shadow-[0_0_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between px-6 py-5 border-b border-app-border">
        <h2 className="text-lg font-bold text-main">{title}</h2>
        <button onClick={onClose} className="text-app-muted hover:text-main transition-colors">
          <i className="ph-bold ph-x text-lg"></i>
        </button>
      </div>
      <div className="p-6 space-y-4">{children}</div>
      {footer ? <div className="px-6 py-5 border-t border-app-border flex justify-end gap-3">{footer}</div> : null}
    </div>
  </div>
);

export const AnchorModeView = ({
  settings,
  setSettings,
  anchor,
  setAnchor,
  initializeAnchor,
  toggleAnchor,
  captureTangent,
  enterWaiting,
  resolveWaiting,
  startTangentAsTask,
  toggleSideTask,
  completeSideTask,
  resumeAnchor,
  dismissResumePrompt,
  completeAnchor,
  openManualReview,
  playPeep,
  isAlerting,
  pinnedQuickNotes = [],
}) => {
  const [showTangentModal, setShowTangentModal] = useState(false);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [tangentForm, setTangentForm] = useState({ title: "", reason: "", returnAction: "" });
  const [waitingForm, setWaitingForm] = useState({ label: "", resumeAction: "" });

  // Removed pre-fill logic to ensure tangent actions are unique per capture.

  const canStart = useMemo(
    () => {
      const t = (anchor?.title || "").trim();
      const i = (anchor?.intent || "").trim();
      return Boolean(t && i);
    },
    [anchor?.title, anchor?.intent],
  );

  const handleStartPause = () => {
    playPeep(880, 0.15);
    if (!anchor.anchorId) {
      initializeAnchor({
        title: anchor?.title || "",
        intent: anchor?.intent || "",
        nextAction: anchor?.nextAction || "",
      });
      return;
    }

    toggleAnchor();
  };

  const handleCaptureTangent = () => {
    const didCapture = captureTangent(tangentForm);
    if (!didCapture) {
      return;
    }

    setShowTangentModal(false);
    setTangentForm({
      title: "",
      reason: "",
      returnAction: "",
    });
  };

  const handleEnterWaiting = () => {
    const didEnter = enterWaiting(waitingForm);
    if (!didEnter) {
      return;
    }

    setShowWaitingModal(false);
    setWaitingForm({
      label: "",
      resumeAction: "",
    });
  };


  const handleFinishAnchor = () => {
    completeAnchor();
    openManualReview();
  };

  const followUpNotes = useMemo(() => {
    return [...(Array.isArray(pinnedQuickNotes) ? pinnedQuickNotes : [])]
      .sort((a, b) => {
        const aTime = new Date(a?.pinnedAt || a?.timestamp || a?.createdAt || a?.capturedAt || 0).getTime();
        const bTime = new Date(b?.pinnedAt || b?.timestamp || b?.createdAt || b?.capturedAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 4);
  }, [pinnedQuickNotes]);

  return (
    <main className="flex-1 overflow-hidden p-6 flex items-center justify-center z-10 w-full relative">
      <div className="w-full max-w-[1100px] h-full max-h-[700px] grid grid-cols-12 gap-6 relative">
        <div className="col-span-8 flex flex-col gap-6 h-full min-h-0">
          <div className="glass-panel rounded-3xl p-8 flex-1 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-app-primary/50 to-transparent"></div>

            <div className="flex items-center justify-between gap-4 z-10">
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-2xl border text-xs font-bold uppercase tracking-[0.2em] ${statusStyles[anchor.status] || statusStyles.idle}`}>
                  {anchor.status}
                </div>
                <div className="px-4 py-2 rounded-2xl border border-app-border bg-app-tintLow text-[10px] font-bold uppercase tracking-[0.25em] text-app-muted">
                  Return Score {anchor.completedReturnCount}/{anchor.returnCount}
                </div>
                <div className="px-4 py-2 rounded-2xl border border-app-border bg-app-tintLow text-[10px] font-bold uppercase tracking-[0.25em] text-app-muted">
                  Streak {anchor.completionStreak}
                </div>
              </div>

              <button
                onClick={() => setSettings((prev) => ({ ...prev, autoMinimize: !prev.autoMinimize }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${settings.autoMinimize ? "bg-app-primary text-app-primaryContrast border-transparent" : "bg-app-tintLow border-app-border text-app-muted hover:text-main"}`}
              >
                <i className="ph-fill ph-arrows-out-simple text-sm"></i>
                <span className="text-[10px] font-bold uppercase tracking-widest">Auto-Hide {settings.autoMinimize ? "On" : "Off"}</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
              <BackgroundEffects effectId={settings.bgEffect || "neuralTracer"} isAlerting={isAlerting} />
              <div className="flex items-center gap-1 p-1 bg-app-tintLow border border-app-border rounded-full z-10 mb-6 shadow-sm backdrop-blur-sm">
                <div className={`flex items-center gap-4 px-6 py-2 rounded-full transition-all duration-500 ease-out ${anchor.status === 'active' ? 'bg-app-primary text-app-primaryContrast shadow-md scale-100' : 'text-app-muted scale-95 opacity-60'}`}>
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase">Focus</span>
                  <span className="text-sm font-bold font-mono tracking-tight">{formatSeconds(anchor.elapsedSeconds)}</span>
                </div>
                <div className={`flex items-center gap-4 px-6 py-2 rounded-full transition-all duration-500 ease-out ${anchor.status === 'waiting' ? 'bg-yellow-400 text-yellow-950 shadow-md scale-100' : 'text-app-muted scale-95 opacity-60'}`}>
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase">Wait</span>
                  <span className="text-sm font-bold font-mono tracking-tight">{formatSeconds(anchor.waitSeconds)}</span>
                </div>
              </div>

              <div className="w-full max-w-4xl z-10 flex flex-col gap-4">
                <div className="glass-panel rounded-3xl p-5 border border-app-border">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-app-muted mb-4">
                    <Flag size={14} className="text-app-primary" />
                    Anchor
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea
                      value={anchor.title}
                      onChange={(e) => setAnchor((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="What is the one thing you are protecting right now?"
                      className="input-field h-16 resize-none"
                      disabled={anchor.status === "waiting"}
                    />
                    <textarea
                      value={anchor.intent}
                      onChange={(e) => setAnchor((prev) => ({ ...prev, intent: e.target.value }))}
                      placeholder="Core Value (The Why)"
                      className="input-field h-16 resize-none"
                      disabled={anchor.status === "waiting"}
                    />
                  </div>
                </div>

                {/* UI simplified - Return Strip moved to individual capture contexts */}

                <div className="mt-auto grid grid-cols-12 gap-3 z-10 shrink-0 w-full mb-0">
                  <button
                    onClick={handleStartPause}
                    disabled={!canStart}
                    className={`col-span-8 group relative overflow-hidden h-16 rounded-2xl font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 border transition-all ${canStart ? "bg-app-primary hover:bg-app-primaryHover text-app-primaryContrast shadow-neon-primary hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] border-app-primaryLight" : "bg-app-tintLow border-app-border text-app-muted opacity-50 cursor-not-allowed"}`}
                  >
                    {canStart ? <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div> : null}
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <i className={`ph-fill ${anchor.status === "active" ? "ph-pause" : "ph-play"} text-lg text-app-primaryContrast`}></i>
                    </div>
                    <span>{anchor.status === "active" ? "Pause Anchor" : anchor.anchorId ? "Resume Anchor" : "Start Anchor"}</span>
                  </button>

                  <div className="col-span-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowTangentModal(true)}
                      disabled={!anchor.anchorId}
                      className="bg-app-surface border border-app-border hover:border-app-primary/50 hover:bg-app-tintLow text-main rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Waypoints size={16} className="text-app-muted group-hover:text-app-primary transition-colors" />
                      <span className="text-[9px] font-bold tracking-widest uppercase text-app-muted group-hover:text-app-primary transition-colors">Tangent</span>
                    </button>

                    <button
                      onClick={anchor.status === "waiting" ? resolveWaiting : () => setShowWaitingModal(true)}
                      disabled={!anchor.anchorId}
                      className="bg-app-surface border border-app-border hover:border-app-primary/50 hover:bg-app-tintLow text-main rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {anchor.status === "waiting" ? <ArrowRight size={16} className="text-app-primary" /> : <Clock3 size={16} className="text-app-muted group-hover:text-app-primary transition-colors" />}
                      <span className="text-[9px] font-bold tracking-widest uppercase text-app-muted group-hover:text-app-primary transition-colors">{anchor.status === "waiting" ? "Resolve" : "Wait"}</span>
                    </button>
                  </div>
                </div>

                {anchor.sideTask && anchor.sideTask.status !== "done" ? (
                  <button
                    onClick={completeSideTask}
                    className="w-full h-10 bg-app-primary/20 border border-app-primary/40 hover:bg-app-primary/30 hover:border-app-primary text-app-primary rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)] shrink-0"
                  >
                    Complete Task
                  </button>
                ) : null}

                <div className="flex gap-3 w-full shrink-0">
                  <button
                    onClick={handleFinishAnchor}
                    disabled={!anchor.anchorId}
                    className="flex-1 h-12 bg-app-surface border border-app-border hover:border-app-primary/30 hover:bg-app-tintLow text-app-muted hover:text-main rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm shadow-inner group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Sparkles size={16} className="text-app-primary group-hover:scale-110 transition-transform" />
                    Review & Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-4 h-full min-h-0">
          <div className="glass-panel rounded-3xl p-6 border border-app-border flex flex-col h-[37%] min-h-[220px] shrink-0">
            <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-app-muted">
                <i className="ph-bold ph-tray text-sm text-app-primary"></i>
                <span className="text-app-primary/80">Follow-Up Inbox</span>
              </div>
              <div className="px-3 py-1 rounded-full border border-app-border bg-app-tintLow text-[10px] font-black uppercase tracking-[0.18em] text-app-muted">
                {followUpNotes.length} pinned
              </div>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-1">
              {followUpNotes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-app-muted italic">
                  Important captures surfaced here.
                </div>
              ) : (
                followUpNotes.map((note, index) => (
                  <div
                    key={note?.id || `${note?.pinnedAt || note?.timestamp || index}`}
                    className="rounded-xl bg-app-primary/[0.03] border border-app-primary/10 p-3 space-y-1.5 transition-all hover:bg-app-primary/5 group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[9px] font-black uppercase tracking-wider text-app-primary/60 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-app-primary/40"></div>
                        Snapshot
                      </span>
                      <div className="text-[9px] font-mono text-app-muted group-hover:text-app-primary/40 transition-colors">
                        {formatNoteTimestamp(note)}
                      </div>
                    </div>
                    <div className="text-xs font-medium text-main/90 leading-relaxed line-clamp-3 group-hover:text-white transition-colors">
                      {getQuickNotePreview(note)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-app-border flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-app-muted mb-4 shrink-0">
              <TimerReset size={14} className="text-app-primary" />
              Tangent Queue
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
              {anchor.tangentQueue.length === 0 ? (
                <div className="rounded-2xl border border-app-border bg-app-tintLow p-5 text-sm text-app-muted">
                  No tangents captured. That is the goal.
                </div>
              ) : (
                anchor.tangentQueue.map((tangent) => {
                  const isActive = anchor.sideTask?.tangentId === tangent.id && anchor.sideTask?.status === 'active';
                  const isPaused = anchor.sideTask?.tangentId === tangent.id && anchor.sideTask?.status === 'paused';
                  // Use tangent.resolvedAt as the permanent done signal — persists even if sideTask moves to a new tangent
                  const isDone = Boolean(tangent.resolvedAt);
                  const elapsed = anchor.sideTask?.tangentId === tangent.id ? anchor.sideTask.elapsedSeconds : 0;
                  const cap = anchor.sideTask?.tangentId === tangent.id ? anchor.sideTask.timeCapSeconds : 600;
                  const pct = Math.min(100, Math.round((elapsed / cap) * 100));

                  return (
                  <div key={tangent.id} className={`rounded-2xl border p-4 space-y-2 transition-all ${isActive ? 'border-app-primary/40 bg-app-primary/10' : isDone ? 'border-app-border bg-app-tintLow opacity-60' : 'border-app-border bg-app-tintLow'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-semibold text-main">{tangent.title}</div>
                      {!isDone ? (
                        <button
                          onClick={() => {
                            if (isActive) { toggleSideTask(); }
                            else { startTangentAsTask(tangent.id); }
                          }}
                          disabled={!anchor.anchorId}
                          className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 ${
                            isActive
                              ? 'border-yellow-400/40 text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20'
                              : 'border-app-primary/30 text-app-primary hover:bg-app-primary/20'
                          }`}
                        >
                          {isActive ? 'Pause' : isPaused ? 'Resume' : 'Start'}
                        </button>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-app-muted">Done</span>
                      )}
                    </div>

                    {(isActive || isPaused) && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className={isActive ? 'text-app-primary' : 'text-app-muted'}>{isActive ? '⏱ Running' : '⏸ Paused'}</span>
                          <span className="text-app-muted font-mono">{formatSeconds(elapsed)} / {formatSeconds(cap)}</span>
                        </div>
                        <div className="h-1 rounded-full bg-app-tintLow overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-red-400' : 'bg-app-primary'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {tangent.reason ? <p className="text-xs text-app-muted leading-relaxed">{tangent.reason}</p> : null}
                    <div className="text-[11px] text-app-primary">Return: {tangent.returnAction}</div>
                  </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {showTangentModal ? (
        <ModalShell
          title="Capture Tangent"
          onClose={() => setShowTangentModal(false)}
          footer={
            <>
              <button onClick={() => setShowTangentModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-app-muted hover:text-main">
                Cancel
              </button>
              <button
                onClick={handleCaptureTangent}
                disabled={!tangentForm.title.trim() || !tangentForm.returnAction.trim()}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-app-primary text-app-primaryContrast disabled:opacity-40"
              >
                Save Tangent
              </button>
            </>
          }
        >
          <textarea
            value={tangentForm.title}
            onChange={(e) => setTangentForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="What is pulling you away?"
            className="input-field h-24 resize-none"
          />
          <textarea
            value={tangentForm.returnAction}
            onChange={(e) => setTangentForm((prev) => ({ ...prev, returnAction: e.target.value }))}
            placeholder="When you return, do this exact next step."
            className="input-field h-24 resize-none"
          />
          <textarea
            value={tangentForm.reason}
            onChange={(e) => setTangentForm((prev) => ({ ...prev, reason: e.target.value }))}
            placeholder="Optional reason"
            className="input-field h-24 resize-none"
          />
        </ModalShell>
      ) : null}

      {showWaitingModal ? (
        <ModalShell
          title="Enter Waiting"
          onClose={() => setShowWaitingModal(false)}
          footer={
            <>
              <button onClick={() => setShowWaitingModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-app-muted hover:text-main">
                Cancel
              </button>
              <button
                onClick={handleEnterWaiting}
                disabled={!waitingForm.label.trim() || !waitingForm.resumeAction.trim()}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-app-primary text-app-primaryContrast disabled:opacity-40"
              >
                Start Waiting
              </button>
            </>
          }
        >
          <textarea
            value={waitingForm.label}
            onChange={(e) => setWaitingForm((prev) => ({ ...prev, label: e.target.value }))}
            placeholder="What are you waiting on?"
            className="input-field h-24 resize-none"
          />
          <textarea
            value={waitingForm.resumeAction}
            onChange={(e) => setWaitingForm((prev) => ({ ...prev, resumeAction: e.target.value }))}
            placeholder="When the result is back, do this exact next step."
            className="input-field h-24 resize-none"
          />
        </ModalShell>
      ) : null}


      {anchor.resumePrompt ? (
        <div className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-3xl rounded-[2rem] border border-app-primary/25 bg-app-bg shadow-[0_0_100px_rgba(0,0,0,0.55)] p-10 space-y-8">
            <div className="flex items-center gap-3 text-app-primary uppercase tracking-[0.3em] text-xs font-black">
              <AlertCircle size={16} />
              Return To Anchor
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-main tracking-tight">{anchor.resumePrompt.title}</h2>
              <p className="text-lg text-app-muted leading-relaxed">{anchor.resumePrompt.intent}</p>
              {anchor.resumePrompt.waitLabel ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-200">
                  Waiting resolved: {anchor.resumePrompt.waitLabel}
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-app-primary/25 bg-app-primary/10 p-6">
              <div className="text-[11px] font-black uppercase tracking-[0.25em] text-app-primary mb-3">Exact Next Action</div>
              <div className="text-2xl font-semibold text-main leading-relaxed">{anchor.resumePrompt.nextAction}</div>
            </div>

            <div className="flex flex-wrap gap-4">
               <button
                onClick={() => resumeAnchor()}
                className="px-6 py-4 rounded-2xl bg-app-primary text-app-primaryContrast font-bold uppercase tracking-[0.18em] flex items-center gap-2"
              >
                <PlayCircle size={18} />
                Resume Anchor
              </button>
              <button
                onClick={() => {
                  dismissResumePrompt();
                  setShowTangentModal(true);
                }}
                className="px-6 py-4 rounded-2xl border border-app-border bg-app-surface text-main font-bold uppercase tracking-[0.18em] flex items-center gap-2"
              >
                <Waypoints size={18} />
                Capture Tangent
              </button>
              <button
                onClick={() => {
                  dismissResumePrompt();
                }}
                className="px-6 py-4 rounded-2xl border border-app-border bg-app-tintLow text-app-muted font-bold uppercase tracking-[0.18em] flex items-center gap-2"
              >
                <PauseCircle size={18} />
                Pause
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};
