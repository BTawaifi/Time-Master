import React from "react";
import { History, Settings, Clock, Minus, Copy, Square, X } from "lucide-react";

export const Header = ({
  setShowArchives,
  setShowSettingsModal,
  isMaximized,
  settings,
  setArchiveData,
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-12 flex items-center justify-between px-4 z-[100] drag bg-[var(--bg-color)]/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-4 no-drag">
        <button
          onClick={async () => {
            const logs = await window.electron?.getLogs(settings.logFilePath);
            setArchiveData(logs || {});
            setShowArchives(true);
          }}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-40 hover:opacity-100 flex items-center gap-2 text-main"
        >
          <History size={14} />{" "}
          <span className="text-[10px] font-bold uppercase tracking-widest text-main">
            History
          </span>
        </button>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-40 hover:opacity-100 flex items-center gap-2 text-main"
        >
          <Settings size={14} />{" "}
          <span className="text-[10px] font-bold uppercase tracking-widest text-main">
            Settings
          </span>
        </button>
        <div className="flex items-center gap-2 opacity-40 text-[10px] font-bold uppercase tracking-widest text-main">
          <Clock size={12} className="accent-text" /> Time Master
        </div>
      </div>
      <div className="flex items-center gap-1 no-drag">
        <button
          onClick={() => window.electron?.minimizeApp()}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-40 hover:opacity-100 text-main"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => window.electron?.maximizeApp()}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-40 hover:opacity-100 text-main"
        >
          {isMaximized ? (
            <Copy size={14} className="rotate-180" />
          ) : (
            <Square size={12} />
          )}
        </button>
        <button
          onClick={() => window.electron?.closeApp()}
          className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors opacity-40 hover:opacity-100 text-main"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
