import React, { useState } from "react";

export const MantraGate = ({ onUnlock, goal }) => {
  const [input, setInput] = useState("");
  const target = `I WILL COMPLETE ${goal || "MY WORK"}`.toUpperCase();
  return (
    <div className="space-y-4 animate-in fade-in zoom-in duration-300" role="alert" aria-live="assertive">
      <label htmlFor="mantra-input" className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 animate-pulse block">
        VERIFICATION REQUIRED
      </label>
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2">
        <p id="mantra-target" className="text-xs font-mono opacity-60 text-center select-none" aria-hidden="false">
          {target}
        </p>
        <input
          id="mantra-input"
          autoFocus
          value={input}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase());
            if (e.target.value.toUpperCase() === target) onUnlock();
          }}
          placeholder="TYPE THE ABOVE TO UNLOCK"
          aria-label="Type the target mantra to unlock the save controls"
          aria-describedby="mantra-target"
          aria-invalid={input !== target && input.length > 0 ? "true" : "false"}
          className="w-full bg-black/40 border border-red-500/30 rounded-lg py-2 px-3 text-center text-xs font-black text-red-400 focus:outline-none focus:border-red-500"
        />
      </div>
    </div>
  );
};
