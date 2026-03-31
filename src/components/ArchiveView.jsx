import React, { useState, useCallback, useMemo } from "react";
import { ProgressBar } from "./ProgressBar";
import {
  ArrowRight,
  Calendar,
  ClipboardCheck,
  Clock3,
  Microscope,
  Star,
  Gem,
  Battery,
  Save,
  X,
  Edit3,
  Trash2,
  ChevronDown,
  Target as TargetIcon,
  BrainCircuit,
  AlertCircle,
  CornerDownLeft,
  FileCheck2,
  Flag,
  Orbit,
  Zap,
  Skull,
  TimerReset,
  Workflow,
  Layers,
  Pin,
} from "lucide-react";
import {
  getSessionModeLabel,
  getSessionStateDetails,
  getSessionStateSummary,
  getSessionLatencyHistory,
} from "../sessionArchive.mjs";

export const ArchiveView = ({
  archiveData,
  setArchiveData,
  setShowArchives,
  settings,
}) => {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [editingId, setEditingId] = useState(null);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [editFields, setEditFields] = useState({});
  const [archiveError, setArchiveError] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [modeFilter, setModeFilter] = useState("all");

  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const sortedDates = useMemo(() => {
    return Object.keys(archiveData).sort((a, b) => b.localeCompare(a));
  }, [archiveData]);

  const allLogs = useMemo(() => {
    const visible = [];
    for (const date of sortedDates) {
      const isInRange =
        (!startDate || date >= startDate) && (!endDate || date <= endDate);
      if (isInRange) {
        const dayLogs = [...archiveData[date]]
          .reverse()
          .map((l) => ({ ...l, date }));
        visible.push(...dayLogs);
      }
    }
    return visible;
  }, [archiveData, sortedDates, startDate, endDate]);

  const modeCounts = useMemo(() => {
    const counts = {
      all: allLogs.length,
      anchor: 0,
      deepWork: 0,
      pomodoro: 0,
      latencyBlocks: 0,
      quickNote: 0,
      followUp: 0,
    };

    allLogs.forEach((log) => {
      if (counts[log.sessionMode] !== undefined) {
        counts[log.sessionMode] += 1;
      }

      if (log.sessionMode === "quickNote" && log.pinnedFollowUp) {
        counts.followUp += 1;
      }
    });

    return counts;
  }, [allLogs]);

  const logs = useMemo(() => {
    if (modeFilter === "all") {
      return allLogs;
    }

    if (modeFilter === "followUp") {
      return allLogs.filter(
        (log) => log.sessionMode === "quickNote" && log.pinnedFollowUp,
      );
    }

    return allLogs.filter((log) => log.sessionMode === modeFilter);
  }, [allLogs, modeFilter]);

  const emptyStateCopy = useMemo(() => {
    if (modeFilter === "followUp") {
      return "No pinned follow-ups found in this range. Quick notes marked as follow-up will appear here.";
    }

    if (modeFilter === "quickNote") {
      return "No quick notes found in this range.";
    }

    if (modeFilter === "anchor") {
      return "No Anchor sessions found in this range.";
    }

    if (modeFilter === "latencyBlocks") {
      return "No Neuro-Ledger sessions found in this range.";
    }

    if (modeFilter === "pomodoro") {
      return "No Pomodoro sessions found in this range.";
    }

    if (modeFilter === "deepWork") {
      return "No Deep Work sessions found in this range.";
    }

    return "No session data found in this range.";
  }, [modeFilter]);

  const persistArchiveData = useCallback(
    async (nextData, onSuccess) => {
      setArchiveError("");

      try {
        if (!window.electron?.updateLogs) {
          throw new Error("Archive persistence is unavailable.");
        }

        const didPersist = await window.electron.updateLogs(
          nextData,
          settings.logFilePath,
        );

        if (!didPersist) {
          throw new Error("Archive write failed.");
        }

        setArchiveData(nextData);
        onSuccess?.();
        return true;
      } catch (error) {
        console.error("Failed to persist archive changes:", error);
        setArchiveError(
          "Could not save archive changes. Your history file was not updated.",
        );
        return false;
      }
    },
    [setArchiveData, settings.logFilePath],
  );

  return (
    <main className="flex-1 w-full overflow-y-auto px-6 py-8 no-scrollbar">
      <div className="w-full max-w-[1400px] mx-auto space-y-10 pb-20">
      <header className="flex items-center justify-between flex-wrap gap-8 border-b border-app-border pb-8">
        <button
          onClick={() => {
            setArchiveError("");
            setShowArchives(false);
            setEditingId(null);
            setExpandedIds(new Set());
          }}
          className="flex items-center gap-2 text-sm font-bold opacity-40 hover:opacity-100 transition-all accent-text"
        >
          <ArrowRight className="rotate-180" size={16} /> BACK TO LAB
        </button>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center bg-app-tintLow px-5 py-3 rounded-2xl border border-app-border text-main">
            <Calendar size={14} className="accent-text mr-4 opacity-40" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs font-mono focus:outline-none data-text [color-scheme:dark] cursor-pointer"
            />
            <ArrowRight size={14} className="mx-4 opacity-20" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs font-mono focus:outline-none data-text [color-scheme:dark] cursor-pointer"
            />
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-6 py-3 accent-bg accent-contrast-text text-xs font-black rounded-2xl hover:opacity-80 transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(0,0,0,0.2)]"
          >
            <ClipboardCheck size={18} /> {copied ? "COPIED!" : `COPY RECORDS (${logs.length})`}
          </button>
        </div>
      </header>
      <div className="flex flex-wrap gap-3">
        {[
          ["all", "All"],
          ["anchor", "Anchor"],
          ["deepWork", "Deep Work"],
          ["pomodoro", "Pomodoro"],
          ["latencyBlocks", "Ledger"],
          ["quickNote", "Notes"],
          ["followUp", "Follow-Up"],
        ].map(([id, label]) => {
          const isSelected = modeFilter === id;
          return (
            <button
              key={id}
              onClick={() => setModeFilter(id)}
              className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isSelected ? "bg-app-primary text-app-primaryContrast border-transparent shadow-neon-primary-sm" : "bg-app-tintLow text-app-muted border-app-border hover:text-main hover:bg-app-surface"}`}
            >
              {label} ({modeCounts[id] || 0})
            </button>
          );
        })}
      </div>
      {archiveError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {archiveError}
        </div>
      )}
      <div className="space-y-6">
        {logs.length === 0 ? (
          <div className="glass-card p-32 text-center opacity-20 italic flex flex-col items-center gap-4">
            <Microscope size={48} /> {emptyStateCopy}
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded =
              expandedIds.has(log.id) || editingId === log.id;
            const isQuickNoteSession = log.sessionMode === "quickNote";
            const isAnchorSession = log.sessionMode === "anchor";
            const won =
              isQuickNoteSession || isAnchorSession
                ? true
                : editingId === log.id
                ? editFields.hypothesisValid
                : log.hypothesisValid;
            const sessionModeLabel = getSessionModeLabel(log.sessionMode);
            const sessionSummary = getSessionStateSummary(log);
            const sessionDetails = getSessionStateDetails(log);
            return (
              <div
                key={log.id}
                className={`glass-card overflow-hidden border transition-all duration-500 relative group ${log.shame ? 'shame-entry' : ''} ${isExpanded ? "border-accent-color/30 shadow-2xl bg-app-tintLow/10" : "border-app-border hover:border-accent-color/20"}`}
              >
                <div
                  className={`absolute left-0 top-0 w-1.5 h-full transition-colors duration-500 ${won ? "bg-green-500/40" : "bg-red-500/40"}`}
                ></div>
                <div
                  onClick={() => !editingId && toggleExpand(log.id)}
                  className={`p-5 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? "bg-app-tintLow border-b border-app-border" : "hover:bg-app-tintLow/40"}`}
                >
                  <div className="flex items-center gap-8 pl-4">
                    <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-app-border pr-8">
                      <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter text-main">
                        {log.date.split("-").slice(1).join("/")}
                      </span>
                      <span className="text-sm font-mono font-bold accent-text">
                        {log.timestamp
                          .split(", ")[1]
                          ?.split(":")
                          .slice(0, 2)
                          .join(":") || log.timestamp}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold data-text tracking-tight truncate max-w-md">
                          {log.activity}
                        </h3>
                        <div className="flex items-center gap-2">
                          {isQuickNoteSession ? (
                            <span className="px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest border transition-all bg-blue-400/10 text-blue-300 border-blue-400/20">
                              NOTE
                            </span>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest border transition-all ${won ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                            >
                              {won ? "GOAL MET" : "MISSED"}
                            </span>
                          )}
                          {log.shame && (
                            <span className="shame-badge px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest border bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                              <Skull size={8} /> {log.shameReason || 'SHAME'}
                            </span>
                          )}
                          {isQuickNoteSession && log.pinnedFollowUp && (
                            <span className="px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest border bg-yellow-400/10 text-yellow-300 border-yellow-400/20">
                              FOLLOW-UP
                            </span>
                          )}
                          {editingId === log.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditFields({
                                  ...editFields,
                                  hypothesisValid: !editFields.hypothesisValid,
                                });
                              }}
                              className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-[4px] text-[8px] font-black hover:bg-white/10 transition-all uppercase"
                            >
                              Flip
                            </button>
                          )}
                        </div>
                      </div>
                      {!isExpanded && (
                        <div className="flex items-center gap-4">
                          {!isQuickNoteSession && !isAnchorSession && (
                            <>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-40 uppercase">
                                <Star size={10} className="accent-text" />{" "}
                                {log.focusDepth} Focus
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-40 uppercase">
                                <Gem size={10} className="text-blue-400" />{" "}
                                {log.utility} Value
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-40 uppercase">
                                <Battery size={10} className="text-yellow-400" />{" "}
                                {log.energyLevel} Energy
                              </div>
                            </>
                          )}
                          {isQuickNoteSession && (
                            <>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-40 uppercase shrink-0">
                                <ClipboardCheck size={10} className="text-blue-300" />{" "}
                                Quick Capture
                              </div>
                              <div className="text-[9px] font-bold opacity-40 uppercase truncate max-w-[800px]">
                                {String(log.output || "").slice(0, 180) || "Saved note"}
                              </div>
                            </>
                          )}
                          {isAnchorSession && (
                            <>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-40 uppercase">
                                <CornerDownLeft size={10} className="accent-text" />{" "}
                                {log.sessionState?.completedReturnCount || 0} Returns
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-40 uppercase">
                                <Orbit size={10} className="text-yellow-400" />{" "}
                                {log.sessionState?.driftCount || 0} Drifts
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-40 uppercase">
                                <Clock3 size={10} className="text-blue-400" />{" "}
                                {log.sessionState?.waitCount || 0} Waits
                              </div>
                            </>
                          )}
                          {!isQuickNoteSession && (
                            <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-40 uppercase">
                              <Flag size={10} className="accent-text" /> {sessionModeLabel}: {sessionSummary}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 no-drag text-main">
                      {editingId === log.id ? (
                        <>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const nd = { ...archiveData };
                              nd[log.date] = nd[log.date].map((l) =>
                                l.id === editingId ? editFields : l,
                              );
                              await persistArchiveData(nd, () => {
                                setEditingId(null);
                              });
                            }}
                            className="p-1.5 bg-green-500/20 text-main rounded-md"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(null);
                            }}
                            className="p-1.5 bg-white/5 text-white/40 rounded-md text-main"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setArchiveError("");
                              setEditingId(log.id);
                              setEditFields(log);
                            }}
                            className="p-2 bg-white/5 text-white/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirmDeleteId === log.id) {
                                // Second click — execute purge
                                const nd = { ...archiveData };
                                nd[log.date] = nd[log.date].filter(
                                  (l) => l.id !== log.id,
                                );
                                if (nd[log.date].length === 0)
                                  delete nd[log.date];
                                setConfirmDeleteId(null);
                                await persistArchiveData(nd);
                              } else {
                                // First click — arm confirmation
                                setConfirmDeleteId(log.id);
                              }
                            }}
                            onBlur={() => setConfirmDeleteId(null)}
                            className={`p-2 rounded-lg transition-all flex items-center gap-1.5 ${confirmDeleteId === log.id ? "bg-red-500/30 text-red-300 opacity-100 border border-red-500/40 scale-105" : "bg-red-500/5 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20"}`}
                          >
                            <Trash2 size={14} />
                            {confirmDeleteId === log.id && (
                              <span className="text-[9px] font-black uppercase tracking-widest animate-in fade-in duration-200">Confirm?</span>
                            )}
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const nd = { ...archiveData };
                              nd[log.date] = nd[log.date].map((entry) =>
                                entry.id === log.id
                                  ? {
                                      ...entry,
                                      pinnedFollowUp: !entry.pinnedFollowUp,
                                    }
                                  : entry,
                              );
                              await persistArchiveData(nd);
                            }}
                            className={`p-2 rounded-lg transition-all ${log.pinnedFollowUp ? "bg-yellow-400/20 text-yellow-300 shadow-neon-primary-sm" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                            title={log.pinnedFollowUp ? "Unpin Follow-Up" : "Pin Follow-Up"}
                          >
                            <Pin size={16} fill={log.pinnedFollowUp ? "currentColor" : "none"} />
                          </button>
                        </>
                      )}
                    </div>
                    <div
                      className={`p-2 rounded-full transition-transform duration-500 ${isExpanded ? "rotate-180 bg-white/5" : "opacity-20 group-hover:opacity-100"}`}
                    >
                      <ChevronDown size={18} className="text-main" />
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="p-8 space-y-10 animate-in fade-in slide-in-from-top-2 duration-500 text-main">
                    {isQuickNoteSession ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] gap-8">
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
                              <ClipboardCheck size={14} className="text-blue-300" />{" "}
                              Saved Note Content
                            </div>
                            {editingId === log.id ? (
                              <textarea
                                value={editFields.output}
                                onChange={(e) =>
                                  setEditFields({
                                    ...editFields,
                                    output: e.target.value,
                                  })
                                }
                                className="input-field h-64 text-sm leading-relaxed"
                              />
                            ) : (
                              <div className="relative overflow-hidden rounded-[2rem] border border-blue-400/15 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.14),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-8">
                                <div className="absolute inset-y-0 left-0 w-1.5 bg-blue-300/60"></div>
                                <p className="pl-4 text-lg font-light data-text leading-relaxed whitespace-pre-wrap">
                                  {log.output}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-6">
                            <div className="glass-card p-6 border-blue-400/10 bg-blue-400/[0.03] space-y-4">
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-300/80">
                                <Calendar size={12} /> Capture Metadata
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3 text-[11px] font-bold">
                                  <span className="opacity-40 uppercase tracking-wide">Type</span>
                                  <span className="text-right data-text">Quick Note</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-[11px] font-bold">
                                  <span className="opacity-40 uppercase tracking-wide">Captured</span>
                                  <span className="text-right data-text">{log.timestamp}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-[11px] font-bold">
                                  <span className="opacity-40 uppercase tracking-wide">Characters</span>
                                  <span className="text-right data-text">{String(log.output || "").length}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-[11px] font-bold">
                                  <span className="opacity-40 uppercase tracking-wide">Follow-Up</span>
                                  <span className="text-right data-text">{log.pinnedFollowUp ? "Pinned" : "None"}</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    ) : log.sessionMode === "anchor" ? (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="glass-card p-6 border-white/5 space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                              <TargetIcon size={14} className="accent-text" /> Anchor Intent
                            </div>
                            {editingId === log.id ? (
                              <textarea
                                value={editFields.bet || ""}
                                onChange={(e) =>
                                  setEditFields({
                                    ...editFields,
                                    bet: e.target.value,
                                  })
                                }
                                className="input-field h-28 text-sm"
                              />
                            ) : (
                              <p className="italic text-xl font-light data-text leading-relaxed pl-4 border-l-2 border-accent-color/20">
                                "{log.bet || log.sessionState?.intent || "No anchor intent recorded."}"
                              </p>
                            )}
                          </div>
                          <div className="glass-card p-6 border-white/5 space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                              <FileCheck2 size={14} className="accent-text" /> Outcome
                            </div>
                            {editingId === log.id ? (
                              <textarea
                                value={editFields.anchorOutcome || editFields.output || ""}
                                onChange={(e) =>
                                  setEditFields({
                                    ...editFields,
                                    anchorOutcome: e.target.value,
                                    output: editFields.output || e.target.value,
                                  })
                                }
                                className="input-field h-28 text-sm"
                              />
                            ) : (
                              <p className="text-base data-text leading-relaxed whitespace-pre-wrap">
                                {log.anchorOutcome || log.output || "No outcome recorded."}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="glass-card p-6 border-white/5 space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                              <TimerReset size={14} /> Anchor Metrics
                            </div>
                            {sessionDetails.map(([label, value]) => (
                              <div key={label} className="flex items-center justify-between text-[11px] font-bold gap-3">
                                <span className="opacity-40 uppercase tracking-wide">{label}</span>
                                <span className="text-right data-text">{value}</span>
                              </div>
                            ))}
                          </div>
                          <div className="glass-card p-6 border-white/5 space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                              <AlertCircle size={14} /> Drift Cause
                            </div>
                            {editingId === log.id ? (
                              <textarea
                                value={editFields.friction || ""}
                                onChange={(e) =>
                                  setEditFields({
                                    ...editFields,
                                    friction: e.target.value,
                                  })
                                }
                                className="input-field h-28 text-sm"
                              />
                            ) : (
                              <p className="text-sm data-text leading-relaxed whitespace-pre-wrap">
                                {log.friction || "No drift cause recorded."}
                              </p>
                            )}
                          </div>
                          <div className="glass-card p-6 border-white/5 space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                              <Zap size={14} className="text-yellow-400" /> Tangent Follow-Up
                            </div>
                            {editingId === log.id ? (
                              <textarea
                                value={editFields.tangentFollowUp || editFields.quickWin || ""}
                                onChange={(e) =>
                                  setEditFields({
                                    ...editFields,
                                    tangentFollowUp: e.target.value,
                                    quickWin: e.target.value,
                                  })
                                }
                                className="input-field h-28 text-sm"
                              />
                            ) : (
                              <p className="text-sm data-text leading-relaxed whitespace-pre-wrap">
                                {log.tangentFollowUp || log.quickWin || "No tangent follow-up recorded."}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="glass-card p-6 border-white/5 space-y-4">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                            <Workflow size={14} className="accent-text" /> Anchor Timeline
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {(log.sessionState?.history || []).length > 0 ? (
                              (log.sessionState?.history || []).map((entry) => (
                                <div key={entry.id || entry.timestamp} className="rounded-2xl border border-white/5 bg-black/20 p-4 space-y-2">
                                  <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest">
                                    <span className="opacity-40">{entry.type || "Event"}</span>
                                    <span className="accent-text">{entry.timestamp?.split("T")[1]?.slice(0, 5) || "--:--"}</span>
                                  </div>
                                  <div className="text-sm font-semibold text-main">{entry.label}</div>
                                  {entry.nextAction ? (
                                    <div className="text-[11px] text-app-muted leading-relaxed">Next: {entry.nextAction}</div>
                                  ) : null}
                                  {entry.waitLabel ? (
                                    <div className="text-[11px] text-app-muted leading-relaxed">Wait: {entry.waitLabel}</div>
                                  ) : null}
                                </div>
                              ))
                            ) : (
                              <div className="rounded-2xl border border-white/5 bg-black/20 p-5 text-sm text-app-muted">
                                No anchor timeline entries were recorded.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="glass-card p-6 border-white/5 space-y-4">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                            <Orbit size={14} className="text-yellow-400" /> Tangent Queue
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(log.sessionState?.tangentQueue || []).length > 0 ? (
                              (log.sessionState?.tangentQueue || []).map((tangent) => (
                                <div key={tangent.id} className="rounded-2xl border border-white/5 bg-black/20 p-4 space-y-2">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-semibold text-main">{tangent.title}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-app-muted">{tangent.disposition || "later"}</div>
                                  </div>
                                  {tangent.reason ? (
                                    <div className="text-xs text-app-muted leading-relaxed whitespace-pre-wrap">{tangent.reason}</div>
                                  ) : null}
                                  <div className="text-[11px] text-app-primary">Return: {tangent.returnAction}</div>
                                </div>
                              ))
                            ) : (
                              <div className="rounded-2xl border border-white/5 bg-black/20 p-5 text-sm text-app-muted">
                                No tangents were captured in this anchor.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                          <div className="flex items-start gap-4">
                            <Flag size={18} className="accent-text mt-1 shrink-0" />
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase opacity-30">
                                NEXT STRATEGIC TASK
                              </span>
                              {editingId === log.id ? (
                                <input
                                  value={editFields.nextStep || ""}
                                  onChange={(e) =>
                                    setEditFields({
                                      ...editFields,
                                      nextStep: e.target.value,
                                    })
                                  }
                                  className="input-field py-2"
                                />
                              ) : (
                                <p className="text-sm font-bold data-text underline decoration-accent-color decoration-2 underline-offset-4">
                                  {log.nextStep || "None recorded."}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <CornerDownLeft size={18} className="accent-text mt-1 shrink-0" />
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase opacity-30">
                                NOTES SUMMARY
                              </span>
                              {editingId === log.id ? (
                                <textarea
                                  value={editFields.output || ""}
                                  onChange={(e) =>
                                    setEditFields({
                                      ...editFields,
                                      output: e.target.value,
                                    })
                                  }
                                  className="input-field h-24 text-xs"
                                />
                              ) : (
                                <p className="text-sm font-medium data-text opacity-70 whitespace-pre-wrap">
                                  {log.output || "No notes summary recorded."}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
                              <TargetIcon size={14} className="accent-text" />{" "}
                              Pre-Commitment Goal
                            </div>
                            {editingId === log.id ? (
                              <textarea
                                value={editFields.bet}
                                onChange={(e) =>
                                  setEditFields({
                                    ...editFields,
                                    bet: e.target.value,
                                  })
                                }
                                className="input-field h-28 text-sm"
                              />
                            ) : (
                              <p className="italic text-xl font-light data-text leading-relaxed pl-4 border-l-2 border-accent-color/20">
                                "{log.bet}"
                              </p>
                            )}
                          </div>
                          <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 block">
                                Activity Description
                              </label>
                              {editingId === log.id ? (
                                <input
                                  value={editFields.activity}
                                  onChange={(e) =>
                                    setEditFields({
                                      ...editFields,
                                      activity: e.target.value,
                                    })
                                  }
                                  className="input-field py-3"
                                />
                              ) : (
                                <p className="text-base font-bold data-text">
                                  {log.activity}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 block">
                                Verified Output
                              </label>
                              {editingId === log.id ? (
                                <input
                                  value={editFields.output}
                                  onChange={(e) =>
                                    setEditFields({
                                      ...editFields,
                                      output: e.target.value,
                                    })
                                  }
                                  className="input-field py-3"
                                />
                              ) : (
                                <p className="text-sm font-mono data-text bg-black/20 p-3 rounded-lg border border-white/5">
                                  {log.output}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                          <div className="glass-card p-6 border-white/5 space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                              <Flag size={14} /> Session Engine
                            </div>
                            <div className="space-y-3">
                              <div className="text-sm font-bold accent-text">
                                {sessionModeLabel}
                              </div>
                              {sessionDetails.map(([label, value]) => (
                                <div key={label} className="flex items-center justify-between gap-3 text-[11px]">
                                  <span className="opacity-40 uppercase tracking-wide">{label}</span>
                                  <span className="text-right data-text">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="glass-card p-6 border-white/5 space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                              <BrainCircuit size={14} /> Metrics
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span>FOCUS DEPTH</span>
                                <span className="accent-text">
                                  {editingId === log.id
                                    ? editFields.focusDepth
                                    : log.focusDepth}
                                  /10
                                </span>
                              </div>
                              {editingId === log.id ? (
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={editFields.focusDepth}
                                  onChange={(e) =>
                                    setEditFields({
                                      ...editFields,
                                      focusDepth: parseInt(e.target.value),
                                    })
                                  }
                                  className="w-full accent-accent-color"
                                />
                              ) : (
                                <ProgressBar value={log.focusDepth} colorClass="accent-bg" />
                              )}
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span>SESSION VALUE</span>
                                <span className="text-blue-400">
                                  {editingId === log.id
                                    ? editFields.utility
                                    : log.utility}
                                  /10
                                </span>
                              </div>
                              {editingId === log.id ? (
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={editFields.utility}
                                  onChange={(e) =>
                                    setEditFields({
                                      ...editFields,
                                      utility: parseInt(e.target.value),
                                    })
                                  }
                                  className="w-full accent-accent-color"
                                />
                              ) : (
                                <ProgressBar value={log.utility} colorClass="bg-blue-400" />
                              )}
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span>MENTAL ENERGY</span>
                                <span className="text-yellow-400">
                                  {editingId === log.id
                                    ? editFields.energyLevel
                                    : log.energyLevel}
                                  /10
                                </span>
                              </div>
                              {editingId === log.id ? (
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={editFields.energyLevel}
                                  onChange={(e) =>
                                    setEditFields({
                                      ...editFields,
                                      energyLevel: parseInt(e.target.value),
                                    })
                                  }
                                  className="w-full accent-accent-color"
                                />
                              ) : (
                                <ProgressBar value={log.energyLevel} colorClass="bg-yellow-400" />
                              )}
                            </div>
                          </div>
                          <div className="glass-card p-6 border-white/5 space-y-4 md:col-span-2">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                              <AlertCircle size={14} /> Resistance & Observations
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <label className="text-[8px] font-black opacity-30 uppercase">
                                  FRICTION NODES
                                </label>
                                {editingId === log.id ? (
                                  <textarea
                                    value={editFields.friction || ""}
                                    onChange={(e) =>
                                      setEditFields({
                                        ...editFields,
                                        friction: e.target.value,
                                      })
                                    }
                                    className="input-field h-24 text-xs"
                                  />
                                ) : (
                                  <p className="text-xs data-text leading-relaxed">
                                    {log.friction || "Zero friction recorded."}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <label className="text-[8px] font-black opacity-30 uppercase">
                                  SCIENTIFIC LESSON
                                </label>
                                {editingId === log.id ? (
                                  <textarea
                                    value={editFields.hypothesisNote || ""}
                                    onChange={(e) =>
                                      setEditFields({
                                        ...editFields,
                                        hypothesisNote: e.target.value,
                                      })
                                    }
                                    className="input-field h-24 text-xs"
                                  />
                                ) : (
                                  <p className="text-xs data-text leading-relaxed italic">
                                    {log.hypothesisNote || "No lesson derived."}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {log.sessionMode === "latencyBlocks" && (
                          <div className="glass-card p-6 border-white/5 space-y-6">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                              <Workflow size={14} className="accent-text" /> Multi-Stream Ledger Trace
                            </div>
                            <div className="space-y-8">
                              {Object.values(log.sessionState.ledger?.streams || {}).map((stream) => (
                                <div key={stream.id} className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <Layers size={14} className="accent-text" />
                                    {editingId === log.id ? (
                                        <input 
                                            className="input-field py-1 px-2 text-xs" 
                                            value={editFields.sessionState?.ledger?.streams?.[stream.id]?.name ?? stream.name} 
                                            onChange={(e) => {
                                                const newName = e.target.value;
                                                setEditFields(prev => {
                                                    const next = { ...prev };
                                                    const nextSS = { ...(next.sessionState || {}) };
                                                    const nextLedger = { ...(nextSS.ledger || {}) };
                                                    const nextStreams = { ...(nextLedger.streams || {}) };
                                                    const nextStream = { ...(nextStreams[stream.id] || stream) };
                                                    
                                                    nextStream.name = newName;
                                                    nextStreams[stream.id] = nextStream;
                                                    nextLedger.streams = nextStreams;
                                                    nextSS.ledger = nextLedger;
                                                    next.sessionState = nextSS;
                                                    return next;
                                                });
                                            }}
                                        />
                                    ) : (
                                        <span className="text-xs font-black uppercase tracking-widest">{stream.name}</span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(editingId === log.id ? editFields.sessionState?.ledger?.streams?.[stream.id]?.history || stream.history : stream.history).map((entry, index) => (
                                      <div key={index} className="flex flex-col gap-2 bg-black/20 border border-white/5 p-4 rounded-xl transition-all hover:border-accent-color/20">
                                        <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest">
                                          <span className="opacity-40">{entry.block}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="accent-text">{entry.duration}s</span>
                                            {editingId === log.id ? (
                                                <input 
                                                    className="input-field py-1 px-2 text-xs w-24" 
                                                    value={entry.label || ""}
                                                    onChange={(e) => {
                                                        const newLabel = e.target.value;
                                                        setEditFields(prev => {
                                                            const next = { ...prev };
                                                            const nextSS = { ...(next.sessionState || {}) };
                                                            const nextLedger = { ...(nextSS.ledger || {}) };
                                                            const nextStreams = { ...(nextLedger.streams || {}) };
                                                            const nextStream = { ...(nextStreams[stream.id] || stream) };
                                                            
                                                            const nextHistory = [...(nextStream.history || [])];
                                                            nextHistory[index] = { ...nextHistory[index], label: newLabel };
                                                            
                                                            nextStream.history = nextHistory;
                                                            nextStreams[stream.id] = nextStream;
                                                            nextLedger.streams = nextStreams;
                                                            nextSS.ledger = nextLedger;
                                                            next.sessionState = nextSS;
                                                            return next;
                                                        });
                                                    }}
                                                />
                                            ) : (
                                                <span className="opacity-80">{entry.label}</span>
                                            )}
                                          </div>
                                        </div>
                                        {editingId === log.id ? (
                                            <textarea
                                                className="input-field h-16 text-xs p-2"
                                                value={entry.comment || ""}
                                                placeholder="Notes..."
                                                onChange={(e) => {
                                                    const newComment = e.target.value;
                                                    setEditFields(prev => {
                                                        const next = { ...prev };
                                                        const nextSS = { ...(next.sessionState || {}) };
                                                        const nextLedger = { ...(nextSS.ledger || {}) };
                                                        const nextStreams = { ...(nextLedger.streams || {}) };
                                                        const nextStream = { ...(nextStreams[stream.id] || stream) };
                                                        
                                                        const nextHistory = [...(nextStream.history || [])];
                                                        nextHistory[index] = { ...nextHistory[index], comment: newComment };
                                                        
                                                        nextStream.history = nextHistory;
                                                        nextStreams[stream.id] = nextStream;
                                                        nextLedger.streams = nextStreams;
                                                        nextSS.ledger = nextLedger;
                                                        next.sessionState = nextSS;
                                                        return next;
                                                    });
                                                }}
                                            />
                                        ) : entry.comment && (
                                          <div className="text-[11px] italic opacity-60 pl-2 border-l border-accent-color/30 leading-relaxed">
                                            "{entry.comment}"
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-app-border">
                          <div className="flex items-start gap-4">
                            <Flag size={18} className="accent-text mt-1 shrink-0" />
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase opacity-30">
                                NEXT STRATEGIC TASK
                              </span>
                              {editingId === log.id ? (
                                <input
                                  value={editFields.nextStep || ""}
                                  onChange={(e) =>
                                    setEditFields({
                                      ...editFields,
                                      nextStep: e.target.value,
                                    })
                                  }
                                  className="input-field py-2"
                                />
                              ) : (
                                <p className="text-sm font-bold data-text underline decoration-accent-color decoration-2 underline-offset-4">
                                  {log.nextStep}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <Zap
                              size={18}
                              className="text-yellow-400 mt-1 shrink-0"
                            />
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase opacity-30">
                                MOMENTUM CATALYST
                              </span>
                              {editingId === log.id ? (
                                <input
                                  value={editFields.quickWin || ""}
                                  onChange={(e) =>
                                    setEditFields({
                                      ...editFields,
                                      quickWin: e.target.value,
                                    })
                                  }
                                  className="input-field py-2"
                                />
                              ) : (
                                <p className="text-sm font-medium data-text opacity-60">
                                  {log.quickWin || "None specified."}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </div>
    </main>
  );
};
