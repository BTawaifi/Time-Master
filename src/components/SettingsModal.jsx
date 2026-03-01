import React, { useState } from "react";
import {
  Settings,
  X,
  FileJson,
  ArrowRight,
  FolderOpen,
  Layers,
  Minimize2,
  Bell,
  Minus,
  Plus,
  Sliders,
  AlertCircle,
  Settings2,
} from "lucide-react";
import { THEMES } from "../constants";

export const SettingsModal = ({
  settings,
  setSettings,
  setShowSettingsModal,
  setShowCustomModal,
  setShowToneModal,
}) => {
  const [settingsTab, setSettingsTab] = useState("system");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[var(--bg-color)]/95 backdrop-blur-xl">
      <div className="glass-card max-w-4xl w-full p-8 space-y-8 border border-white/10 overflow-y-auto max-h-[90vh] shadow-[0_0_100px_rgba(0,0,0,0.5)] text-main">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Settings size={28} className="accent-text" /> Configuration
          </h2>
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setSettingsTab("system")}
              className={`px-4 py-2 rounded-md text-[10px] font-black uppercase transition-all ${settingsTab === "system" ? "accent-bg accent-contrast-text" : "opacity-40 hover:opacity-100"}`}
            >
              System
            </button>
            <button
              onClick={() => setSettingsTab("enforcer")}
              className={`px-4 py-2 rounded-md text-[10px] font-black uppercase transition-all ${settingsTab === "enforcer" ? "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]" : "opacity-40 hover:opacity-100 hover:text-red-400"}`}
            >
              Aggressive Protocols
            </button>
          </div>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {settingsTab === "system" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="space-y-8">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2">
                  Storage Node
                </h3>
                <button
                  onClick={async () => {
                    const path = await window.electron.selectLogFile();
                    if (path)
                      setSettings((prev) => ({ ...prev, logFilePath: path }));
                  }}
                  className="w-full py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <FileJson size={16} className="accent-text" />
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold opacity-60 uppercase">
                        Select Log File
                      </span>
                      <span className="text-[8px] font-mono opacity-30 truncate max-w-[150px]">
                        {settings.logFilePath || "Default System Path"}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="opacity-20 group-hover:opacity-100 transition-all accent-text"
                  />
                </button>
                <button
                  onClick={() =>
                    window.electron?.openLogsFolder(settings.logFilePath)
                  }
                  className="w-full py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen size={16} className="accent-text" />
                    <span className="text-xs font-bold opacity-60 uppercase">
                      Open Folder
                    </span>
                  </div>
                  <X
                    size={14}
                    className="rotate-45 opacity-20 group-hover:opacity-100 transition-all accent-text"
                  />
                </button>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2 pt-4">
                  Window Protocol
                </h3>
                <button
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      stayOnTop: !prev.stayOnTop,
                    }))
                  }
                  className={`w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-between group ${settings.stayOnTop ? "accent-bg accent-contrast-text border-transparent" : "border-white/10 hover:bg-white/5"}`}
                >
                  <div className="flex items-center gap-3">
                    <Layers size={16} />
                    <span className="text-xs font-bold uppercase">
                      Stay on Top
                    </span>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full relative transition-colors ${settings.stayOnTop ? "bg-white/20" : "bg-white/5"}`}
                  >
                    <div
                      className={`absolute top-1 w-2 h-2 rounded-full transition-all ${settings.stayOnTop ? "right-1 bg-white" : "left-1 bg-white/20"}`}
                    ></div>
                  </div>
                </button>
                <button
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      autoMinimize: !prev.autoMinimize,
                    }))
                  }
                  className={`w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-between group ${settings.autoMinimize ? "accent-bg accent-contrast-text border-transparent" : "border-white/10 hover:bg-white/5"}`}
                >
                  <div className="flex items-center gap-3">
                    <Minimize2 size={16} />
                    <span className="text-xs font-bold uppercase">
                      Auto-Minimize
                    </span>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full relative transition-colors ${settings.autoMinimize ? "bg-white/20" : "bg-white/5"}`}
                  >
                    <div
                      className={`absolute top-1 w-2 h-2 rounded-full transition-all ${settings.autoMinimize ? "right-1 bg-white" : "left-1 bg-white/20"}`}
                    ></div>
                  </div>
                </button>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2 pt-4">
                  Visual Style
                </h3>
                <div className="grid grid-cols-2 gap-2 text-main">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSettings((prev) => ({ ...prev, themeId: t.id }));
                        if (t.id === "custom") setShowCustomModal(true);
                      }}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${settings.themeId === t.id ? "accent-border accent-bg accent-contrast-text" : "border-white/5 hover:bg-white/5 opacity-40"}`}
                    >
                      {t.name}{" "}
                      {t.id === "custom" && (
                        <Settings2 size={10} className="inline ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2">
                Reminder Protocols
              </h3>
              <div className="space-y-6">
                {Object.keys(settings.reminders).map((scope) => {
                  const config = settings.reminders[scope];
                  const upd = (u) =>
                    setSettings((prev) => ({
                      ...prev,
                      reminders: {
                        ...prev.reminders,
                        [scope]: { ...prev.reminders[scope], ...u },
                      },
                    }));
                  return (
                    <div
                      key={scope}
                      className="glass-card p-5 border-white/5 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell
                            size={14}
                            className={
                              config.enabled ? "accent-text" : "opacity-20"
                            }
                          />
                          <span
                            className={`text-xs font-black uppercase tracking-wider ${config.enabled ? "opacity-100" : "opacity-30"}`}
                          >
                            {scope} Scope
                          </span>
                        </div>
                        <button
                          onClick={() => upd({ enabled: !config.enabled })}
                          className={`w-8 h-4 rounded-full relative transition-colors ${config.enabled ? "accent-bg" : "bg-white/5"}`}
                        >
                          <div
                            className={`absolute top-1 w-2 h-2 rounded-full transition-all ${config.enabled ? "right-1 bg-white" : "left-1 bg-white/20"}`}
                          ></div>
                        </button>
                      </div>

                      {config.enabled && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold opacity-40 uppercase">
                              Frequency
                            </span>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  upd({
                                    interval: Math.max(
                                      10,
                                      config.interval - 10,
                                    ),
                                  })
                                }
                                className="p-1 hover:bg-white/5 rounded border border-white/10"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="font-mono text-xs">
                                {config.interval}s
                              </span>
                              <button
                                onClick={() =>
                                  upd({ interval: config.interval + 10 })
                                }
                                className="p-1 hover:bg-white/5 rounded border border-white/10"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold opacity-40 uppercase">
                              Sound Profile
                            </span>
                            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                              <button
                                onClick={() => upd({ mode: "stochastic" })}
                                className={`px-2 py-1 rounded text-[8px] font-black transition-all ${config.mode === "stochastic" ? "accent-bg accent-contrast-text" : "opacity-40"}`}
                              >
                                RANDOM
                              </button>
                              <button
                                onClick={() => setShowToneModal(scope)}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-[8px] font-black transition-all ${config.mode === "presets" ? "accent-bg accent-contrast-text" : "opacity-40"}`}
                              >
                                CUSTOM <Sliders size={8} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-2xl space-y-6 md:col-span-2">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-red-500 shrink-0" size={24} />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-red-500">
                    Warning: Aggressive Mode
                  </h3>
                  <p className="text-xs opacity-60 leading-relaxed max-w-2xl">
                    These protocols are designed to be hostile to
                    procrastination. They may interfere with normal system
                    usage, block inputs, or cause audio discomfort. Enable at
                    your own risk.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2 text-red-400">
                Physical & Visual Constraints
              </h3>
              {[
                {
                  id: "desktopEclipse",
                  label: "Desktop Eclipse",
                  desc: "Dims background to black over time.",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      enforcement: {
                        ...prev.enforcement,
                        [opt.id]: !prev.enforcement[opt.id],
                      },
                    }))
                  }
                  className={`w-full py-4 px-5 rounded-xl border transition-all flex items-center justify-between group ${settings.enforcement[opt.id] ? "bg-red-500/10 border-red-500/50" : "border-white/10 hover:bg-white/5"}`}
                >
                  <div className="text-left">
                    <div
                      className={`text-xs font-bold uppercase ${settings.enforcement[opt.id] ? "text-red-400" : "opacity-60"}`}
                    >
                      {opt.label}
                    </div>
                    <div className="text-[9px] opacity-40">{opt.desc}</div>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full relative transition-colors ${settings.enforcement[opt.id] ? "bg-red-500" : "bg-white/5"}`}
                  >
                    <div
                      className={`absolute top-1 w-2 h-2 rounded-full transition-all ${settings.enforcement[opt.id] ? "right-1 bg-white" : "left-1 bg-white/20"}`}
                    ></div>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2 text-red-400">
                Cognitive & Social Constraints
              </h3>
              {[
                {
                  id: "soundCrescendo",
                  label: "Sonic Escalation",
                  desc: "Volume & pitch increase over time.",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      enforcement: {
                        ...prev.enforcement,
                        [opt.id]: !prev.enforcement[opt.id],
                      },
                    }))
                  }
                  className={`w-full py-4 px-5 rounded-xl border transition-all flex items-center justify-between group ${settings.enforcement[opt.id] ? "bg-red-500/10 border-red-500/50" : "border-white/10 hover:bg-white/5"}`}
                >
                  <div className="text-left">
                    <div
                      className={`text-xs font-bold uppercase ${settings.enforcement[opt.id] ? "text-red-400" : "opacity-60"}`}
                    >
                      {opt.label}
                    </div>
                    <div className="text-[9px] opacity-40">{opt.desc}</div>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full relative transition-colors ${settings.enforcement[opt.id] ? "bg-red-500" : "bg-white/5"}`}
                  >
                    <div
                      className={`absolute top-1 w-2 h-2 rounded-full transition-all ${settings.enforcement[opt.id] ? "right-1 bg-white" : "left-1 bg-white/20"}`}
                    ></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowSettingsModal(false)}
          className="w-full py-5 accent-bg accent-contrast-text rounded-2xl font-black uppercase tracking-widest shadow-[0_0_40px_rgba(0,0,0,0.3)] active:scale-95 transition-all"
        >
          Synchronize Protocols
        </button>
      </div>
    </div>
  );
};
