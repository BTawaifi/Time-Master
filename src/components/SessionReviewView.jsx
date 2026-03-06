import React from "react";
import {
  ClipboardCheck,
  AlertCircle,
  Waves,
  Gem,
  Battery,
  ArrowRight,
  Zap,
  RefreshCw,
  Compass,
  SkipForward,
} from "lucide-react";
import { MantraGate } from "./MantraGate";

export const SessionReviewView = ({
  formData,
  setFormData,
  settings,
  handleAuthorization,
  handleSkip,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 text-main">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold accent-text uppercase tracking-tight">
            <ClipboardCheck size={24} /> Session Review
          </h1>
          <p className="opacity-40 text-sm mt-1">Check your progress.</p>
        </div>
        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1 animate-pulse font-bold text-main">
          <AlertCircle size={12} /> STAY FOCUSED
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 md:col-span-2 border border-white/10 bg-white/5">
          <label className="block text-xs font-bold accent-text mb-2 uppercase opacity-60">
            My Goal
          </label>
          <textarea
            value={formData.bet}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bet: e.target.value }))
            }
            placeholder="What high-leverage outcome did you bet on?"
            className="input-field h-24 resize-none bg-black/20 border-white/5 focus:border-accent-color/30 italic text-lg"
          />
        </div>
        <div className="glass-card p-6 border border-white/10">
          <label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider flex items-center gap-1">
            1. Activity Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.activity}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, activity: e.target.value }))
            }
            placeholder="What did you focus on?"
            className="input-field h-32 resize-none"
          />
        </div>
        <div className="glass-card p-6 border border-white/10">
          <label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider flex items-center gap-1">
            2. Tangible Output <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.output}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, output: e.target.value }))
            }
            placeholder="What did you complete?"
            className="input-field h-32 resize-none"
          />
        </div>
        <div className="glass-card p-6 border border-white/10">
          <label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider">
            3. Method or Tool
          </label>
          <input
            type="text"
            value={formData.method}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, method: e.target.value }))
            }
            placeholder="Which method or tool did you use?"
            className="input-field"
          />
        </div>
        <div className="glass-card p-6 border border-white/10">
          <label className="block text-xs font-bold accent-text mb-3 uppercase tracking-wider">
            4. Uncertainty Trend
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["decreased", "Down"],
              ["stable", "Stable"],
              ["increased", "Up"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, uncertainty: value }))
                }
                className={`py-3 rounded-xl border text-xs font-black uppercase transition-all ${formData.uncertainty === value ? "accent-bg accent-contrast-text border-transparent" : "bg-transparent border-white/10 opacity-50 hover:opacity-100"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="glass-card p-6 border border-white/10">
          <label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider">
            5. Hypothesis Validation
          </label>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() =>
                setFormData({ ...formData, hypothesisValid: true })
              }
              className={`flex-1 py-3 rounded-xl border text-sm font-black transition-all ${formData.hypothesisValid === true ? "bg-green-500/20 border-green-500 text-green-400" : "bg-transparent border-white/10 opacity-30"}`}
            >
              YES
            </button>
            <button
              onClick={() =>
                setFormData({ ...formData, hypothesisValid: false })
              }
              className={`flex-1 py-3 rounded-xl border text-sm font-black transition-all ${formData.hypothesisValid === false ? "bg-red-500/20 border-red-500 text-red-400" : "bg-transparent border-white/10 opacity-30"}`}
            >
              NO
            </button>
          </div>
          <input
            type="text"
            value={formData.hypothesisNote}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                hypothesisNote: e.target.value,
              }))
            }
            placeholder="Technical lesson learned..."
            className="input-field"
          />
        </div>

        <div className="glass-card p-6 border border-white/10">
          <label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider">
            6. Resistance & Friction
          </label>
          <textarea
            value={formData.friction}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, friction: e.target.value }))
            }
            placeholder="Any distractions or obstacles?"
            className="input-field h-24 resize-none"
          />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 flex flex-col justify-center space-y-4 border border-white/10">
            <label className="block text-[10px] font-bold accent-text uppercase tracking-wider flex items-center gap-2">
              <Waves size={14} /> Focus Depth
            </label>
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.focusDepth}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    focusDepth: parseInt(e.target.value),
                  }))
                }
                className="w-full accent-accent-color"
              />
              <div className="text-center font-mono text-xl font-bold accent-text">
                {formData.focusDepth}/10
              </div>
            </div>
          </div>
          <div className="glass-card p-6 flex flex-col justify-center space-y-4 border border-white/10">
            <label className="block text-[10px] font-bold accent-text uppercase tracking-wider flex items-center gap-2">
              <Gem size={14} /> Session Value
            </label>
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.utility}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    utility: parseInt(e.target.value),
                  }))
                }
                className="w-full accent-accent-color"
              />
              <div className="text-center font-mono text-xl font-bold accent-text">
                {formData.utility}/10
              </div>
            </div>
          </div>
          <div className="glass-card p-6 flex flex-col justify-center space-y-4 border border-white/10">
            <label className="block text-[10px] font-bold accent-text uppercase tracking-wider flex items-center gap-2">
              <Battery size={14} /> Mental Energy
            </label>
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energyLevel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    energyLevel: parseInt(e.target.value),
                  }))
                }
                className="w-full accent-accent-color"
              />
              <div className="text-center font-mono text-xl font-bold accent-text">
                {formData.energyLevel}/10
              </div>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 md:col-span-2 border border-white/10">
          <label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider flex items-center gap-1">
            7. Next Strategic Task <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <ArrowRight size={20} className="accent-text" />
            <input
              type="text"
              value={formData.nextStep}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nextStep: e.target.value }))
              }
              placeholder="What is the very next thing to do?"
              className="input-field py-4 text-base"
            />
          </div>
        </div>
        <div className="glass-card p-6 md:col-span-2 bg-yellow-400/5 border-yellow-400/20">
          <label className="block text-xs font-bold text-yellow-500 mb-2 uppercase tracking-wider">
            <Zap size={14} className="inline mr-1" /> 8. Immediate Momentum
            Catalyst (Do it now)
          </label>
          <div className="flex items-center gap-3">
            <Zap size={20} className="text-yellow-400" />
            <input
              type="text"
              value={formData.quickWin}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, quickWin: e.target.value }))
              }
              placeholder="Simple 2-minute task..."
              className="input-field py-4 border-yellow-400/10 focus:border-yellow-400/50"
            />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full p-6 bg-transparent backdrop-blur-3xl border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-center z-50">
        {settings.enforcement?.mantraGate && !formData.unlocked ? (
          <div className="w-full max-w-lg">
            <MantraGate
              goal={formData.bet}
              onUnlock={() =>
                setFormData((prev) => ({ ...prev, unlocked: true }))
              }
            />
          </div>
        ) : (
          <>
            <button
              onClick={() => handleAuthorization(false)}
              disabled={
                !formData.activity || !formData.output || !formData.nextStep
              }
              className={`px-12 py-4 rounded-2xl font-black tracking-widest transition-all flex items-center justify-center gap-3 ${formData.activity && formData.output && formData.nextStep ? "accent-bg accent-contrast-text shadow-[0_0_40px_rgba(0,0,0,0.4)] scale-105 active:scale-95" : "bg-white/5 opacity-20 cursor-not-allowed"}`}
            >
              <RefreshCw size={20} /> Save & Continue
            </button>
            <button
              onClick={() => handleAuthorization(true)}
              disabled={
                !formData.activity || !formData.output || !formData.nextStep
              }
              className={`px-12 py-4 rounded-2xl font-black tracking-widest transition-all flex items-center justify-center gap-3 border border-white/10 ${formData.activity && formData.output && formData.nextStep ? "bg-white/5 hover:bg-white/10 text-main" : "opacity-20 cursor-not-allowed"}`}
            >
              <Compass size={20} /> Save & Modify
            </button>
            {!settings.enforcement?.kioskMode && (
              <button
                onClick={handleSkip}
                className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 border border-red-500/20 text-main"
              >
                <SkipForward size={18} /> Discard Session
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
