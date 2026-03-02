import React from "react";
import { Palette, RefreshCcw, X } from "lucide-react";
import { rgbaToHexAndAlpha, hexToRgba } from "../utils";
import { DEFAULT_SETTINGS } from "../constants";

export const CustomThemeModal = ({
  settings,
  setSettings,
  setShowCustomModal,
}) => {
  const cardVis = rgbaToHexAndAlpha(settings.customTheme.card);
  const inputVis = rgbaToHexAndAlpha(settings.customTheme.input);
  const placeholderVis = rgbaToHexAndAlpha(
    settings.customTheme.inputPlaceholder,
  );
  const upd = (u) =>
    setSettings((prev) => ({
      ...prev,
      customTheme: { ...prev.customTheme, ...u },
    }));
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[var(--bg-color)]/95 backdrop-blur-xl">
      <div className="glass-card max-w-2xl w-full p-8 space-y-8 border border-white/10 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between text-main">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Palette size={24} className="accent-text" /> Design Your Theme
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => upd(DEFAULT_SETTINGS.customTheme)}
              className="p-2 hover:bg-white/10 rounded-full opacity-40"
            >
              <RefreshCcw size={18} />
            </button>
            <button
              onClick={() => setShowCustomModal(false)}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 text-main">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2">
              Colors & Surfaces
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-40">
                Background
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.customTheme.bg}
                  onChange={(e) => upd({ bg: e.target.value })}
                  className="w-10 h-10 bg-transparent cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-40">
                Card Transparency
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={cardVis.alpha}
                onChange={(e) =>
                  upd({ card: hexToRgba(cardVis.hex, e.target.value) })
                }
                className="w-full accent-accent-color"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-40">
                Input Transparency
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={inputVis.alpha}
                onChange={(e) =>
                  upd({ input: hexToRgba(inputVis.hex, e.target.value) })
                }
                className="w-full accent-accent-color"
              />
            </div>
          </div>
          <div className="space-y-6 text-main">
            <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2">
              Text & Accents
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-40">
                Main Text Color
              </label>
              <input
                type="color"
                value={settings.customTheme.text}
                onChange={(e) =>
                  upd({ text: e.target.value, dataText: e.target.value })
                }
                className="w-10 h-10 bg-transparent cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-40">
                Input Text Color
              </label>
              <input
                type="color"
                value={settings.customTheme.inputText}
                onChange={(e) => upd({ inputText: e.target.value })}
                className="w-10 h-10 bg-transparent cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-40">
                Placeholder Color
              </label>
              <input
                type="color"
                value={placeholderVis.hex}
                onChange={(e) =>
                  upd({
                    inputPlaceholder: hexToRgba(
                      e.target.value,
                      placeholderVis.alpha,
                    ),
                  })
                }
                className="w-10 h-10 bg-transparent cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-40">
                Highlight Color
              </label>
              <input
                type="color"
                value={settings.customTheme.accent}
                onChange={(e) => upd({ accent: e.target.value })}
                className="w-10 h-10 bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowCustomModal(false)}
          className="w-full py-4 accent-bg accent-contrast-text rounded-2xl font-black uppercase tracking-widest"
        >
          Save Design
        </button>
      </div>
    </div>
  );
};
