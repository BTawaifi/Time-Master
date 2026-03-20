import React, { useState, useEffect, useRef } from "react";
import { X, Trash, Save, Check } from "lucide-react";

export const QuickNotesPanel = ({ onClose, onSaveToArchive }) => {
  const [notes, setNotes] = useState(() => localStorage.getItem("quickNotes") || "");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const confirmTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("quickNotes", notes);
  }, [notes]);

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, []);

  const handleSave = () => {
    if (notes.trim() && onSaveToArchive) {
      onSaveToArchive(notes);
      setNotes("");
      // Keep panel open but clear input as requested
    }
  };

  const handleClearClick = () => {
    if (showClearConfirm) {
      // Second click: Actual clear
      setNotes("");
      setShowClearConfirm(false);
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    } else {
      // First click: Enter confirm mode
      setShowClearConfirm(true);
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = setTimeout(() => {
        setShowClearConfirm(false);
      }, 5000);
    }
  };

  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 bg-app-bg/95 backdrop-blur-md border-l border-app-border p-4 flex flex-col z-[100] shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-8 duration-300 drag-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-main flex items-center gap-2">
          <i className="ph-fill ph-note-pencil text-app-primary"></i> Quick Notes
        </h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave} 
            disabled={!notes.trim()}
            className="text-app-muted hover:text-green-400 disabled:opacity-30 disabled:hover:text-app-muted transition-colors" 
            title="Save to Archive"
          >
            <Save size={14} />
          </button>
          <button 
            onClick={handleClearClick} 
            className={`transition-colors ${showClearConfirm ? 'text-green-400 hover:text-green-300' : 'text-app-muted hover:text-red-400'}`} 
            title={showClearConfirm ? "Click again to confirm" : "Clear Notes"}
          >
            {showClearConfirm ? <Check size={14} className="animate-in zoom-in-50 duration-200" /> : <Trash size={14} />}
          </button>
          <button onClick={onClose} className="text-app-muted hover:text-main transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>
      <textarea
        autoFocus
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Jot down quick thoughts, distractions, or ideas to review later..."
        className="flex-1 w-full bg-app-tintLow border border-app-border rounded-xl p-4 text-sm text-main placeholder:text-app-muted/50 resize-none focus:outline-none focus:border-app-primary/50 transition-colors leading-relaxed"
      />
    </div>
  );
};