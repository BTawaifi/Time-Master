import React from "react";
import { ArrowRight, Compass, CornerDownLeft, FileCheck2, Orbit, Zap } from "lucide-react";

export const AnchorReviewView = ({
  formData,
  setFormData,
  handleAuthorization,
  handleSkip,
  handleGoBack,
  anchor,
}) => {
  const isValid = Boolean(
    formData.activity?.trim() &&
    formData.nextStep?.trim() &&
    formData.friction?.trim(),
  );

  return (
    <main className="flex-1 w-full overflow-y-auto pt-8 px-6 no-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8 pb-32 text-main">
        <header className="space-y-3">
          <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.25em] text-app-primary">
            <FileCheck2 size={16} />
            Anchor Closeout
          </div>
          <h1 className="text-3xl font-black tracking-tight text-main">{anchor?.title || "Anchor"}</h1>
          <p className="text-app-muted leading-relaxed">
            Capture the outcome, the next move, and what pulled you away. Keep it short and surgical.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <div className="glass-card p-6 border border-app-border bg-app-tintLow">
            <label className="block text-xs font-bold uppercase tracking-wider text-app-primary mb-3">
              Core Value
            </label>
            <div className="text-lg italic text-main leading-relaxed">{anchor?.intent || formData.bet || "No core value captured."}</div>
          </div>

          <div className="glass-card p-6 border border-app-border">
            <label className="block text-xs font-bold uppercase tracking-wider text-app-primary mb-3">
              Outcome <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.activity || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, activity: e.target.value }))}
              placeholder="What did this session actually produce?"
              className="input-field h-32 resize-none"
            />
          </div>

          <div className="glass-card p-6 border border-app-border">
            <label className="block text-xs font-bold uppercase tracking-wider text-app-primary mb-3">
              Next Step <span className="text-red-500">*</span>
            </label>
            <div className="flex items-start gap-3">
              <ArrowRight size={18} className="accent-text mt-3" />
              <textarea
                value={formData.nextStep || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, nextStep: e.target.value }))}
                placeholder="What exact next action should happen after this?"
                className="input-field h-28 resize-none"
              />
            </div>
          </div>

          <div className="glass-card p-6 border border-app-border">
            <label className="block text-xs font-bold uppercase tracking-wider text-app-primary mb-3">
              Drift Cause <span className="text-red-500">*</span>
            </label>
            <div className="flex items-start gap-3">
              <Orbit size={18} className="text-yellow-400 mt-3" />
              <textarea
                value={formData.friction || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, friction: e.target.value }))}
                placeholder="What broke your focus or made the anchor unstable?"
                className="input-field h-28 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 border border-app-border">
              <label className="block text-xs font-bold uppercase tracking-wider text-app-primary mb-3">
                Notes Summary
              </label>
              <div className="flex items-start gap-3">
                <CornerDownLeft size={18} className="accent-text mt-3" />
                <textarea
                  value={formData.output || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, output: e.target.value }))}
                  placeholder="Optional summary, result, or useful note."
                  className="input-field h-28 resize-none"
                />
              </div>
            </div>

            <div className="glass-card p-6 border border-app-border">
              <label className="block text-xs font-bold uppercase tracking-wider text-app-primary mb-3">
                Tangent Follow-Up
              </label>
              <div className="flex items-start gap-3">
                <Zap size={18} className="text-yellow-400 mt-3" />
                <textarea
                  value={formData.quickWin || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quickWin: e.target.value }))}
                  placeholder="Optional note about parked tangents or follow-ups."
                  className="input-field h-28 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full p-6 bg-transparent backdrop-blur-3xl border-t border-app-border flex flex-col sm:flex-row gap-4 justify-center z-50">
          <button
            onClick={() => handleAuthorization(false)}
            disabled={!isValid}
            className={`px-10 py-4 rounded-xl font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-3 ${isValid ? "bg-app-primary text-app-primaryContrast shadow-neon-primary" : "bg-app-tintLow border border-app-border text-app-muted opacity-50 cursor-not-allowed"}`}
          >
            <i className="ph-bold ph-arrows-clockwise text-lg"></i> Save Anchor
          </button>
          <button
            onClick={() => handleAuthorization(true)}
            disabled={!isValid}
            className={`px-10 py-4 rounded-xl font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-3 border ${isValid ? "bg-app-bg border-app-primary text-app-primary" : "border-app-border text-app-muted opacity-30 cursor-not-allowed"}`}
          >
            <Compass size={18} />
            Save & Reset
          </button>
          <button
            onClick={handleGoBack}
            className="px-8 py-4 rounded-xl border border-app-border hover:border-app-primary text-app-muted hover:text-main font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 bg-app-tintLow hover:bg-app-tintMed shadow-[0_0_15px_rgba(255,255,255,0.05)] shrink-0"
          >
            <i className="ph-bold ph-arrow-left text-lg"></i> Go Back
          </button>
          <button
            onClick={handleSkip}
            className="px-8 py-4 rounded-xl border border-app-danger/30 hover:border-app-danger text-app-danger font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 bg-app-danger/5 hover:bg-app-danger/10 shadow-[0_0_15px_rgba(239,68,68,0.1)] shrink-0"
          >
            <i className="ph-bold ph-trash text-lg"></i> Discard
          </button>
        </div>
      </div>
    </main>
  );
};
