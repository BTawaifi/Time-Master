import React, { useState } from "react";

export const Header = ({
  showArchives,
  isReviewing,
  isTimerRunning,
  setShowArchives,
  setShowSettingsModal,
  setShowQuickNotes,
  showQuickNotes,
  isMaximized,
  settings,
  setSettings,
  setArchiveData,
}) => {
  const [pendingMode, setPendingMode] = useState(null);

  const selectMode = (modeId) => {
    if (settings.sessionMode === modeId) return;
    setPendingMode(modeId);
  };

  const confirmModeSwitch = () => {
    if (pendingMode) {
      setSettings((prev) => ({ ...prev, sessionMode: pendingMode }));
      setPendingMode(null);
    }
  };

  const isDisabled = showArchives || isReviewing || isTimerRunning;

  return (
    <>
    <header className="flex-none w-full h-16 px-6 flex items-center justify-between z-50 border-b border-app-border bg-app-bg/50 backdrop-blur-md drag">
        {/* Left window controls and logo */}
        <div className="flex items-center gap-6 no-drag">
            <div className="flex items-center space-x-2 text-app-muted/50 hover:text-app-muted transition-colors">
                <button onClick={() => window.electron?.closeApp()} className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center group"><i className="ph-bold ph-x text-[8px] opacity-0 group-hover:opacity-100 text-black"></i></button>
                <button onClick={() => window.electron?.minimizeApp()} className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 flex items-center justify-center group"><i className="ph-bold ph-minus text-[8px] opacity-0 group-hover:opacity-100 text-black"></i></button>
                <button onClick={() => window.electron?.maximizeApp()} className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 flex items-center justify-center group"><i className="ph-bold ph-arrows-out-simple text-[8px] opacity-0 group-hover:opacity-100 text-black"></i></button>
            </div>
            
            <div className="h-4 w-px bg-app-border"></div>
            
            <div className="flex items-center gap-2 text-app-primary">
                <span className="font-bold tracking-widest text-xs uppercase text-main">Time Master</span>
            </div>
        </div>

        {/* Center mode switcher */}
        <div className={`absolute left-1/2 -translate-x-1/2 flex items-center p-1 bg-app-tintLow border border-app-border rounded-full shadow-glass no-drag transition-opacity duration-300 ${isDisabled ? 'opacity-30 pointer-events-none' : ''}`}>
            <button onClick={() => selectMode('deepWork')} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${settings.sessionMode === 'deepWork' ? 'bg-app-tintMed text-main shadow-[0_0_10px_rgba(255,255,255,0.05)] border border-app-border' : 'text-app-muted hover:text-main'}`}>
                <i className="ph-bold ph-lightning"></i> Deep Work
            </button>
            <button onClick={() => selectMode('pomodoro')} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${settings.sessionMode === 'pomodoro' ? 'bg-app-tintMed text-main shadow-[0_0_10px_rgba(255,255,255,0.05)] border border-app-border' : 'text-app-muted hover:text-main'}`}>
                <i className="ph-bold ph-timer"></i> Pomodoro
            </button>
            <button onClick={() => selectMode('latencyBlocks')} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${settings.sessionMode === 'latencyBlocks' ? 'bg-app-tintMed text-main shadow-[0_0_10px_rgba(255,255,255,0.05)] border border-app-border' : 'text-app-muted hover:text-main'}`}>
                <i className="ph-bold ph-circles-three"></i> Ledger
            </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-4 no-drag">
            <div className="h-4 w-px bg-app-border"></div>
            <button onClick={() => setShowQuickNotes(prev => !prev)} className={`transition-colors p-1.5 rounded-lg ${showQuickNotes ? 'bg-app-primary/20 text-app-primary' : 'text-app-muted hover:text-main hover:bg-app-tintLow'}`} title="Quick Notes">
                <i className="ph ph-note-pencil text-lg"></i>
            </button>
            <button onClick={async () => {
                const logs = await window.electron?.getLogs(settings.logFilePath);
                setArchiveData(logs || {});
                setShowArchives(true);
            }} className="text-app-muted hover:text-main transition-colors p-1.5 hover:bg-app-tintLow rounded-lg">
                <i className="ph ph-clock-counter-clockwise text-lg"></i>
            </button>
            <button onClick={() => setShowSettingsModal(true)} className="text-app-muted hover:text-main transition-colors p-1.5 hover:bg-app-tintLow rounded-lg">
                <i className="ph ph-gear text-lg"></i>
            </button>
        </div>
    </header>
    
    {pendingMode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-app-bg/95 backdrop-blur-md no-drag">
            <div className="max-w-sm w-full p-8 border border-app-primary/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-app-bg text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-app-primary/10 text-app-primary flex items-center justify-center border border-app-primary/20 mb-2">
                    <i className="ph-fill ph-warning-circle text-3xl animate-pulse"></i>
                </div>
                <h2 className="text-xl font-black text-main uppercase tracking-widest">Wipe Data?</h2>
                <p className="text-app-muted text-sm leading-relaxed">
                    Switching to <span className="text-white font-semibold">{pendingMode === 'deepWork' ? 'Deep Work' : pendingMode === 'pomodoro' ? 'Pomodoro' : 'Neuro-Ledger'}</span> will completely reset your current session progress and block state.
                </p>
                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                    <button onClick={() => setPendingMode(null)} className="px-4 py-3 rounded-xl border border-app-border text-xs font-bold text-app-muted hover:text-main hover:bg-app-tintLow transition-colors tracking-widest uppercase">
                        Cancel
                    </button>
                    <button onClick={confirmModeSwitch} className="px-4 py-3 rounded-xl bg-app-primary text-app-primaryContrast hover:bg-app-primaryHover transition-all text-xs font-bold shadow-neon-primary hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] tracking-widest uppercase">
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};
