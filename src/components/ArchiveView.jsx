import React, { useState, useCallback, useMemo } from "react";
import {
  ArrowRight,
  Calendar,
  ClipboardCheck,
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
  Flag,
  Zap,
  Skull,
} from "lucide-react";

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
  const [expandedIds, setExpandedIds] = useState([]);
  const [editFields, setEditFields] = useState({});

  const toggleExpand = useCallback(
    (id) =>
      setExpandedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      ),
    [],
  );

  const logs = useMemo(() => {
    const visible = [];
    const sortedDates = Object.keys(archiveData).sort((a, b) =>
      b.localeCompare(a),
    );
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
  }, [archiveData, startDate, endDate]);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="flex items-center justify-between flex-wrap gap-8 border-b border-white/5 pb-8">
        <button
          onClick={() => {
            setShowArchives(false);
            setEditingId(null);
            setExpandedIds([]);
          }}
          className="flex items-center gap-2 text-sm font-bold opacity-40 hover:opacity-100 transition-all accent-text"
        >
          <ArrowRight className="rotate-180" size={16} /> BACK TO LAB
        </button>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center bg-white/5 px-5 py-3 rounded-2xl border border-white/10 text-main">
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
            onClick={() =>
              navigator.clipboard.writeText(JSON.stringify(logs, null, 2))
            }
            className="px-6 py-3 accent-bg accent-contrast-text text-xs font-black rounded-2xl hover:opacity-80 transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(0,0,0,0.2)]"
          >
            <ClipboardCheck size={18} /> COPY RECORDS ({logs.length})
          </button>
        </div>
      </header>
      <div className="space-y-6">
        {logs.length === 0 ? (
          <div className="glass-card p-32 text-center opacity-20 italic flex flex-col items-center gap-4">
            <Microscope size={48} /> No session data found in this range.
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded =
              expandedIds.includes(log.id) || editingId === log.id;
            const won =
              editingId === log.id
                ? editFields.hypothesisValid
                : log.hypothesisValid;
            return (
              <div
                key={log.id}
                className={`glass-card overflow-hidden border transition-all duration-500 relative group ${log.shame ? 'shame-entry' : ''} ${isExpanded ? "border-accent-color/30 shadow-2xl bg-white/[0.02]" : "border-white/10 hover:border-white/20"}`}
              >
                <div
                  className={`absolute left-0 top-0 w-1.5 h-full transition-colors duration-500 ${won ? "bg-green-500/40" : "bg-red-500/40"}`}
                ></div>
                <div
                  onClick={() => !editingId && toggleExpand(log.id)}
                  className={`p-5 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? "bg-white/5 border-b border-white/5" : "hover:bg-white/[0.02]"}`}
                >
                  <div className="flex items-center gap-8 pl-4">
                    <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-white/5 pr-8">
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
                          <span
                            className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest border transition-all ${won ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                          >
                            {won ? "GOAL MET" : "MISSED"}
                          </span>
                          {log.shame && (
                            <span className="shame-badge px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest border bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                              <Skull size={8} /> {log.shameReason || 'SHAME'}
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
                              await window.electron.updateLogs(
                                nd,
                                settings.logFilePath,
                              );
                              setArchiveData(nd);
                              setEditingId(null);
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
                              if (!confirm("Purge Session Record?")) return;
                              const nd = { ...archiveData };
                              nd[log.date] = nd[log.date].filter(
                                (l) => l.id !== log.id,
                              );
                              if (nd[log.date].length === 0)
                                delete nd[log.date];
                              await window.electron.updateLogs(
                                nd,
                                settings.logFilePath,
                              );
                              setArchiveData(nd);
                            }}
                            className="p-2 bg-red-500/5 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                          >
                            <Trash2 size={16} />
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full accent-bg"
                                style={{
                                  width: `${(log.focusDepth / 10) * 100}%`,
                                }}
                              ></div>
                            </div>
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
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-400"
                                style={{
                                  width: `${(log.utility / 10) * 100}%`,
                                }}
                              ></div>
                            </div>
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
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400"
                                style={{
                                  width: `${(log.energyLevel / 10) * 100}%`,
                                }}
                              ></div>
                            </div>
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
                                value={editFields.friction}
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
                                value={editFields.hypothesisNote}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                      <div className="flex items-start gap-4">
                        <Flag size={18} className="accent-text mt-1 shrink-0" />
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase opacity-30">
                            NEXT STRATEGIC TASK
                          </span>
                          {editingId === log.id ? (
                            <input
                              value={editFields.nextStep}
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
                              value={editFields.quickWin}
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
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
