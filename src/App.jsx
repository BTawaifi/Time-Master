import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, AlertCircle, Save, X, Terminal, Activity, Zap, HelpCircle, ArrowRight, Play, Pause, RotateCcw, Plus, Minus, Target, Palette, Layout, Minimize2, Maximize2, Square, Bell, Volume2, Copy, Archive, Calendar, ClipboardCheck, Trash2, Edit3, Settings2, Box, Type, Database, PenTool, RefreshCcw, EyeOff, FastForward, Radio, Shuffle, Music, Sliders } from 'lucide-react';

const THEMES = [
  { id: 'enforcer', name: 'Enforcer', bg: '#121212', accent: '#8B5CF6', contrast: '#ffffff', card: 'rgba(255, 255, 255, 0.05)', input: 'rgba(0, 0, 0, 0.2)', inputText: '#ffffff', inputPlaceholder: 'rgba(255, 255, 255, 0.4)', dataText: '#ffffff', text: '#ffffff' },
  { id: 'carbon', name: 'Carbon', bg: '#0A0A0A', accent: '#404040', contrast: '#ffffff', card: 'rgba(255, 255, 255, 0.03)', input: 'rgba(0, 0, 0, 0.4)', inputText: '#ffffff', inputPlaceholder: 'rgba(255, 255, 255, 0.3)', dataText: '#ffffff', text: '#ffffff' },
  { id: 'noir', name: 'Noir', bg: '#050505', accent: '#F8FAFC', contrast: '#000000', card: 'rgba(255, 255, 255, 0.02)', input: 'rgba(255, 255, 255, 0.05)', inputText: '#ffffff', inputPlaceholder: 'rgba(255, 255, 255, 0.4)', dataText: '#ffffff', text: '#ffffff' },
  { id: 'midnight', name: 'Midnight Blueprint', bg: '#020617', accent: '#E2E8F0', contrast: '#000000', card: 'rgba(255, 255, 255, 0.03)', input: 'rgba(255, 255, 255, 0.05)', inputText: '#ffffff', inputPlaceholder: 'rgba(255, 255, 255, 0.4)', dataText: '#ffffff', text: '#ffffff' },
  { id: 'neon', name: 'Neon Overload', bg: '#050505', accent: '#22C55E', contrast: '#000000', card: 'rgba(34, 197, 94, 0.05)', input: 'rgba(0, 0, 0, 0.4)', inputText: '#ffffff', inputPlaceholder: 'rgba(34, 197, 94, 0.4)', dataText: '#ffffff', text: '#ffffff' },
  { id: 'bloodline', name: 'Bloodline', bg: '#0F0505', accent: '#EF4444', contrast: '#ffffff', card: 'rgba(239, 68, 68, 0.05)', input: 'rgba(0, 0, 0, 0.4)', inputText: '#ffffff', inputPlaceholder: 'rgba(239, 68, 68, 0.4)', dataText: '#ffffff', text: '#ffffff' },
  { id: 'deepsea', name: 'Deep Sea', bg: '#020617', accent: '#38BDF8', contrast: '#000000', card: 'rgba(56, 189, 248, 0.05)', input: 'rgba(0, 0, 0, 0.4)', inputText: '#ffffff', inputPlaceholder: 'rgba(56, 189, 248, 0.4)', dataText: '#ffffff', text: '#ffffff' },
  { id: 'solaris', name: 'Solaris', bg: '#070701', accent: '#EAB308', contrast: '#000000', card: 'rgba(234, 179, 8, 0.05)', input: 'rgba(0, 0, 0, 0.4)', inputText: '#ffffff', inputPlaceholder: 'rgba(234, 179, 8, 0.4)', dataText: '#ffffff', text: '#ffffff' },
  { id: 'void', name: 'Void', bg: '#000000', accent: '#ffffff', contrast: '#000000', card: 'rgba(255, 255, 255, 0.05)', input: 'rgba(255, 255, 255, 0.02)', inputText: '#ffffff', inputPlaceholder: 'rgba(255, 255, 255, 0.4)', dataText: '#ffffff', text: '#ffffff' },
  { id: 'paper', name: 'Paper', bg: '#FFFFFF', accent: '#2563EB', contrast: '#ffffff', card: 'rgba(0, 0, 0, 0.02)', input: 'rgba(0, 0, 0, 0.04)', inputText: '#1e293b', inputPlaceholder: 'rgba(30, 41, 59, 0.4)', dataText: '#1e293b', text: '#1e293b', dim: 'rgba(0, 0, 0, 0.4)' },
  { id: 'nordic', name: 'Nordic Light', bg: '#ECEFF4', accent: '#5E81AC', contrast: '#ffffff', card: 'rgba(0, 0, 0, 0.02)', input: 'rgba(0, 0, 0, 0.04)', inputText: '#2E3440', inputPlaceholder: 'rgba(46, 52, 64, 0.4)', dataText: '#2E3440', text: '#2E3440', dim: 'rgba(0, 0, 0, 0.4)' },
  { id: 'champagne', name: 'Champagne', bg: '#FDFCF0', accent: '#D97706', contrast: '#ffffff', card: 'rgba(0, 0, 0, 0.02)', input: 'rgba(0, 0, 0, 0.04)', inputText: '#451a03', inputPlaceholder: 'rgba(69, 26, 3, 0.4)', dataText: '#451a03', text: '#451a03', dim: 'rgba(0, 0, 0, 0.4)' },
  { id: 'custom', name: 'Custom', bg: '#121212', accent: '#8B5CF6', contrast: '#ffffff', card: 'rgba(255, 255, 255, 0.05)', input: 'rgba(0, 0, 0, 0.2)', inputText: '#ffffff', inputPlaceholder: 'rgba(255, 255, 255, 0.4)', dataText: '#ffffff', text: '#ffffff' }
];

const DEFAULT_SETTINGS = {
  themeId: 'enforcer',
  autoMinimize: true,
  reminderInterval: 60,
  reminderMode: 'stochastic',
  timerDuration: 25 * 60,
  customTheme: { ...THEMES[THEMES.length - 1] },
  customTone: { freq: 440, type: 'sine', volume: 0.15, duration: 0.4 }
};

// --- Utilities Node ---
const rgbaToHexAndAlpha = (rgba) => {
  if (!rgba || !rgba.startsWith('rgba')) return { hex: '#ffffff', alpha: 0.05 };
  const clean = rgba.replace('rgba(', '').replace(')', '').split(',').map(s => s.trim());
  const r = parseInt(clean[0]) || 255;
  const g = parseInt(clean[1]) || 255;
  const b = parseInt(clean[2]) || 255;
  const a = parseFloat(clean[3]) || 0.05;
  return { hex: "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1), alpha: a };
};

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function App() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('time_master_settings');
      if (!stored) return DEFAULT_SETTINGS;
      const p = JSON.parse(stored);
      return {
        ...DEFAULT_SETTINGS, ...p,
        customTheme: { ...DEFAULT_SETTINGS.customTheme, ...(p.customTheme || {}) },
        customTone: { ...DEFAULT_SETTINGS.customTone, ...(p.customTone || {}) }
      };
    } catch (e) { return DEFAULT_SETTINGS; }
  });

  const [timeLeft, setTimeLeft] = useState(settings.timerDuration);
  const [isActive, setIsActive] = useState(false);
  const [isEnforced, setIsEnforced] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showToneModal, setShowToneModal] = useState(false);
  const [archiveData, setArchiveData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMaximized, setIsMaximized] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [formData, setFormData] = useState({ activity: '', output: '', utility: 5, friction: '', uncertainty: 'decreased', hypothesisValid: true, hypothesisNote: '', nextStep: '', pivot: false, quickWin: '', bet: '' });

  const timerRef = useRef(null);
  const reminderRef = useRef(null);

  useEffect(() => { localStorage.setItem('time_master_settings', JSON.stringify(settings)); }, [settings]);

  useEffect(() => {
    const activeTheme = settings.themeId === 'custom' ? settings.customTheme : (THEMES.find(t => t.id === settings.themeId) || THEMES[0]);
    const root = document.documentElement;
    root.style.setProperty('--bg-color', activeTheme.bg);
    root.style.setProperty('--accent-color', activeTheme.accent);
    root.style.setProperty('--accent-contrast', activeTheme.contrast);
    root.style.setProperty('--card-bg', activeTheme.card);
    root.style.setProperty('--input-bg', activeTheme.input);
    root.style.setProperty('--input-text', activeTheme.inputText);
    root.style.setProperty('--input-placeholder', activeTheme.inputPlaceholder);
    root.style.setProperty('--text-main', activeTheme.text);
    root.style.setProperty('--text-data', activeTheme.dataText);
    root.style.setProperty('--text-dim', activeTheme.dim || 'rgba(255,255,255,0.4)');
  }, [settings.themeId, settings.customTheme]);

  useEffect(() => {
    if (window.electron) {
        window.electron.onMaximized((state) => setIsMaximized(state));
        window.electron.onEnforce(() => { setIsEnforced(true); setIsActive(false); });
    }
  }, []);

  useEffect(() => {
    if (isActive && settings.autoMinimize && window.electron && !isEnforced) window.electron.minimizeApp();
  }, [isActive, isEnforced]);

  const playReminder = (forced = null) => {
    try {
      const tone = forced || settings.customTone;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      if (settings.reminderMode === 'stochastic' && !forced) {
        oscillator.type = ['sine', 'triangle', 'square'][Math.floor(Math.random() * 3)];
        oscillator.frequency.setValueAtTime(Math.floor(Math.random() * 500) + 300, audioCtx.currentTime);
      } else {
        oscillator.type = tone.type;
        oscillator.frequency.setValueAtTime(tone.freq, audioCtx.currentTime);
      }
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(tone.volume, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + tone.duration);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + tone.duration);
    } catch (e) {}
  };

  const playAlarm = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); 
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 1);
    } catch (e) {}
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false); setIsEnforced(true); playAlarm();
      if (window.electron) window.electron.triggerEnforce();
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleSettingChange = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));
  const adjustTimer = (amt) => { const nd = Math.max(60, settings.timerDuration + amt); handleSettingChange('timerDuration', nd); if (!isActive) setTimeLeft(nd); };
  const resetTimer = () => { setIsActive(false); setTimeLeft(settings.timerDuration); };
  const forceFinish = () => { setIsActive(false); setIsEnforced(true); if (window.electron) window.electron.triggerEnforce(); };

  const handleSubmit = () => {
    if (!formData.activity || !formData.output) return;
    if (window.electron) {
        window.electron.saveLog(formData);
        setIsEnforced(false);
        const reset = { activity: '', output: '', utility: 5, friction: '', uncertainty: 'decreased', hypothesisValid: true, hypothesisNote: '', nextStep: '', pivot: false, quickWin: '' };
        if (!formData.pivot) {
            setFormData(prev => ({ ...prev, ...reset }));
            setTimeLeft(settings.timerDuration);
            setIsActive(true);
        } else {
            setFormData({ ...reset, bet: '' });
            setTimeLeft(settings.timerDuration);
            setIsActive(false); 
        }
    }
  };

  const Header = () => (
    <div className="fixed top-0 left-0 w-full h-10 flex items-center justify-between px-4 z-[100] drag">
        <div className="flex items-center gap-4 no-drag">
            <button onClick={async () => { const logs = await window.electron?.getLogs(); setArchiveData(logs || {}); setShowArchives(true); }} className="p-2 hover:bg-white/10 rounded-lg opacity-40 hover:opacity-100 flex items-center gap-2">
                <Archive size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Archives</span>
            </button>
            <div className="flex items-center gap-2 opacity-40 text-[10px] font-bold uppercase tracking-widest">
                <Clock size={12} className="accent-text" /> Time Master
            </div>
        </div>
        <div className="flex items-center gap-1 no-drag">
            <button onClick={() => window.electron?.minimizeApp()} className="p-2 hover:bg-white/10 rounded-lg opacity-40 hover:opacity-100"><Minus size={14} /></button>
            <button onClick={() => window.electron?.maximizeApp()} className="p-2 hover:bg-white/10 rounded-lg opacity-40 hover:opacity-100">{isMaximized ? <Copy size={14} className="rotate-180" /> : <Square size={12} />}</button>
            <button onClick={() => window.electron?.closeApp()} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg opacity-40 hover:opacity-100"><X size={14} /></button>
        </div>
    </div>
  );

  const CustomThemeModal = () => {
    const cardVis = rgbaToHexAndAlpha(settings.customTheme.card);
    const inputVis = rgbaToHexAndAlpha(settings.customTheme.input);
    const placeholderVis = rgbaToHexAndAlpha(settings.customTheme.inputPlaceholder);
    const update = (u) => setSettings(prev => ({ ...prev, customTheme: { ...prev.customTheme, ...u } }));
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <div className="glass-card max-w-2xl w-full p-8 space-y-8 border-2 accent-border overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between"><h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2"><Settings2 size={24} className="accent-text" /> Theme Architect</h2>
                    <div className="flex items-center gap-2"><button onClick={() => update(DEFAULT_SETTINGS.customTheme)} className="p-2 hover:bg-white/10 rounded-full text-white/40"><RefreshCcw size={18}/></button><button onClick={() => setShowCustomModal(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2">Surfaces</h3>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Main BG</label><div className="flex items-center gap-3"><input type="color" value={settings.customTheme.bg} onChange={(e) => update({bg: e.target.value})} className="w-10 h-10 bg-transparent cursor-pointer" /></div></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Cards Alpha</label><input type="range" min="0" max="1" step="0.01" value={cardVis.alpha} onChange={(e) => update({card: hexToRgba(cardVis.hex, e.target.value)})} className="w-full accent-white" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Inputs Alpha</label><input type="range" min="0" max="1" step="0.01" value={inputVis.alpha} onChange={(e) => update({input: hexToRgba(inputVis.hex, e.target.value)})} className="w-full accent-white" /></div>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2">Typography</h3>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Main Text</label><input type="color" value={settings.customTheme.text} onChange={(e) => update({text: e.target.value, dataText: e.target.value})} className="w-10 h-10 bg-transparent cursor-pointer" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Input Text</label><input type="color" value={settings.customTheme.inputText} onChange={(e) => update({inputText: e.target.value})} className="w-10 h-10 bg-transparent cursor-pointer" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Placeholder</label><input type="color" value={placeholderVis.hex} onChange={(e) => update({inputPlaceholder: hexToRgba(e.target.value, placeholderVis.alpha)})} className="w-10 h-10 bg-transparent cursor-pointer" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Accent</label><input type="color" value={settings.customTheme.accent} onChange={(e) => update({accent: e.target.value})} className="w-10 h-10 bg-transparent cursor-pointer" /></div>
                    </div>
                </div>
                <button onClick={() => setShowCustomModal(false)} className="w-full py-4 accent-bg accent-contrast-text rounded-2xl font-black uppercase tracking-widest">Finalize</button>
            </div>
        </div>
    );
  };

  const CustomToneModal = () => {
    const upd = (u) => setSettings(prev => ({ ...prev, customTone: { ...prev.customTone, ...u } }));
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <div className="glass-card max-w-md w-full p-8 space-y-8 border-2 accent-border">
                <div className="flex items-center justify-between"><h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2"><Music size={24} className="accent-text" /> Tone Architect</h2><button onClick={() => setShowToneModal(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button></div>
                <div className="space-y-6">
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Freq ({settings.customTone.freq}Hz)</label><input type="range" min="100" max="2000" value={settings.customTone.freq} onChange={(e) => upd({freq: parseInt(e.target.value)})} className="w-full accent-white" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Waveform</label><div className="grid grid-cols-2 gap-2">{['sine', 'triangle', 'square', 'sawtooth'].map(t => (<button key={t} onClick={() => upd({type: t})} className={`py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${settings.customTone.type === t ? 'accent-bg accent-contrast-text' : 'border-white/10'}`}>{t}</button>))}</div></div>
                </div>
                <div className="flex gap-3"><button onClick={() => playReminder(settings.customTone)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-xs flex items-center justify-center gap-2"><Volume2 size={16} /> Test</button><button onClick={() => setShowToneModal(false)} className="flex-1 py-4 accent-bg accent-contrast-text rounded-2xl font-black uppercase tracking-widest">Calibrate</button></div>
            </div>
        </div>
    );
  };

  if (showArchives) {
    const logs = archiveData[selectedDate] || [];
    return (
        <div className="min-h-screen p-8 overflow-y-auto pt-14">
            <Header />
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex items-center justify-between"><button onClick={() => setShowArchives(false)} className="flex items-center gap-2 text-sm font-bold opacity-40 hover:opacity-100 accent-text"><ArrowRight className="rotate-180" size={16} /> BACK</button><div className="flex items-center gap-4"><div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10"><Calendar size={16} className="accent-text" /><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-sm font-mono focus:outline-none"/></div><button onClick={() => navigator.clipboard.writeText(JSON.stringify(logs, null, 2))} className="px-4 py-2 bg-white text-black text-xs font-black rounded-xl hover:bg-[#8B5CF6] hover:text-white transition-all flex items-center gap-2"><ClipboardCheck size={16} /> COPY JSON</button></div></header>
                <div className="space-y-4">
                    <h2 className="text-xl font-bold uppercase opacity-60 flex items-center gap-2"><Terminal size={20} className="accent-text" /> Logs for {selectedDate}</h2>
                    {logs.length === 0 ? <div className="glass-card p-20 text-center opacity-20 italic">No historical data.</div> : 
                        logs.map((log) => (
                            <div key={log.id} className="glass-card p-6 space-y-4 border-l-4 accent-border relative group">
                                <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono opacity-20">{log.timestamp}</span><div className="flex items-center gap-2">
                                    {editingId === log.id ? (<><button onClick={async () => { const nd = {...archiveData}; nd[selectedDate] = nd[selectedDate].map(l => l.id === editingId ? editFields : l); await window.electron.updateLogs(nd); setArchiveData(nd); setEditingId(null); }} className="p-1.5 bg-green-500/20 text-green-400 rounded-md"><Save size={14} /></button><button onClick={() => setEditingId(null)} className="p-1.5 bg-white/5 text-white/40 rounded-md"><X size={14} /></button></>) : 
                                    (<><button onClick={() => { setEditingId(log.id); setEditFields(log); }} className="p-1.5 bg-white/5 text-white/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 size={14} /></button><button onClick={async () => { if (!confirm("Delete?")) return; const nd = {...archiveData}; nd[selectedDate] = nd[selectedDate].filter(l => l.id !== log.id); if (nd[selectedDate].length === 0) delete nd[selectedDate]; await window.electron.updateLogs(nd); setArchiveData(nd); }} className="p-1.5 bg-red-500/10 text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button></>)}
                                </div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="md:col-span-2"><label className="text-[10px] font-bold accent-text uppercase opacity-40 block mb-1">Bet</label>{editingId === log.id ? <textarea value={editFields.bet} onChange={(e) => setEditFields({...editFields, bet: e.target.value})} className="input-field h-20 text-sm"/> : <p className="italic text-lg font-light data-text">"{log.bet}"</p>}</div>
                                    <div><label className="text-[10px] font-bold accent-text uppercase opacity-40 block mb-1">Activity</label>{editingId === log.id ? <input value={editFields.activity} onChange={(e) => setEditFields({...editFields, activity: e.target.value})} className="input-field py-2"/> : <p className="text-sm data-text">{log.activity}</p>}</div>
                                    <div><label className="text-[10px] font-bold accent-text uppercase opacity-40 block mb-1">Output</label>{editingId === log.id ? <input value={editFields.output} onChange={(e) => setEditFields({...editFields, output: e.target.value})} className="input-field py-2"/> : <p className="text-sm font-mono data-text">{log.output}</p>}</div>
                                    <div><label className="text-[10px] font-bold accent-text uppercase opacity-40 block mb-1">Next Step</label>{editingId === log.id ? <input value={editFields.nextStep} onChange={(e) => setEditFields({...editFields, nextStep: e.target.value})} className="input-field py-2"/> : <p className="text-sm data-text underline decoration-accent-color">{log.nextStep}</p>}</div>
                                    <div className="md:col-span-2 border-t border-white/5 pt-2"><label className="text-[10px] font-bold text-yellow-500 uppercase opacity-40 block mb-1">Friction</label>{editingId === log.id ? <input value={editFields.friction} onChange={(e) => setEditFields({...editFields, friction: e.target.value})} className="input-field py-2"/> : <p className="text-xs data-text opacity-60">{log.friction}</p>}</div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
  }

  if (!isEnforced) {
     return (
        <div className="min-h-screen flex flex-col p-8 overflow-y-auto relative pt-14">
            <Header />
            {showCustomModal && <CustomThemeModal />}
            {showToneModal && <CustomToneModal />}
            <div className="max-w-2xl mx-auto w-full space-y-8 py-4">
                <div className="glass-card p-10 flex flex-col items-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 accent-bg opacity-30"></div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => adjustTimer(-300)} className="p-2 hover:bg-white/5 rounded-full opacity-40 hover:opacity-100 transition-all"><Minus size={24} /></button>
                        <div className="text-7xl font-mono font-light tracking-tighter">{Math.floor(timeLeft / 60)}:{ (timeLeft % 60).toString().padStart(2, '0') }</div>
                        <button onClick={() => adjustTimer(300)} className="p-2 hover:bg-white/5 rounded-full opacity-40 hover:opacity-100 transition-all"><Plus size={24} /></button>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setIsActive(!isActive)} className={`px-10 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${isActive ? 'bg-amber-500/20 border border-amber-500/50 text-amber-500' : 'accent-bg accent-contrast-text'}`}>{isActive ? <><Pause fill="currentColor" size={20} /> PAUSE</> : <><Play fill="currentColor" size={20} /> START FOCUS</>}</button>
                        <button onClick={forceFinish} className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl transition-all font-bold text-xs uppercase flex items-center gap-2 flex-shrink-0"><CheckCircle size={18} className="text-green-500" /> Finish</button>
                        <button onClick={resetTimer} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"><RotateCcw size={20} /></button>
                    </div>
                </div>
                <div className="glass-card p-8 space-y-6">
                    <div className="flex items-center gap-3"><Target className="accent-text" size={24} /><h2 className="text-xl font-bold tracking-tight uppercase">Place Your Bet</h2></div>
                    <textarea value={formData.bet} onChange={(e) => setFormData(prev => ({...prev, bet: e.target.value}))} placeholder="I bet I can..." className="input-field h-32 resize-none"/>
                </div>
                <div className="glass-card p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3"><Layout className="accent-text" size={20} /><h2 className="text-sm font-bold uppercase tracking-wider opacity-60">System</h2></div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => window.electron?.openLogsFolder()} className="px-4 py-2 rounded-lg text-[10px] font-black border border-white/10 hover:bg-white/5 opacity-60 flex items-center gap-2"><X size={12} className="rotate-45" /> OPEN DATA</button>
                            <button onClick={() => handleSettingChange('autoMinimize', !settings.autoMinimize)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${settings.autoMinimize ? 'accent-bg accent-border accent-contrast-text' : 'border-white/10 opacity-40'}`}>{settings.autoMinimize ? 'MINIMIZE: ON' : 'MINIMIZE: OFF'}</button>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3"><Bell className="accent-text" size={20} /><div className="flex flex-col"><h2 className="text-sm font-bold uppercase opacity-60 tracking-wider">Idle Reminder</h2><p className="text-[10px] opacity-30 font-mono">Ping every {settings.reminderInterval}s</p></div></div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleSettingChange('reminderInterval', Math.max(0, settings.reminderInterval - 10))} className="p-1 hover:bg-white/5 rounded border border-white/10"><Minus size={12} /></button>
                                <span className="font-mono text-sm w-12 text-center">{settings.reminderInterval}s</span>
                                <button onClick={() => handleSettingChange('reminderInterval', settings.reminderInterval + 10)} className="p-1 hover:bg-white/5 rounded border border-white/10"><Plus size={12} /></button>
                                <button onClick={() => playReminder()} className="ml-2 p-1.5 hover:bg-white/10 rounded-full opacity-40 hover:opacity-100"><Volume2 size={14} /> </button>
                            </div>
                            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                                <button onClick={() => handleSettingChange('reminderMode', 'stochastic')} className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-all ${settings.reminderMode === 'stochastic' ? 'accent-bg accent-contrast-text' : 'opacity-40'}`}><Shuffle size={10}/> RANDOM</button>
                                <button onClick={() => { handleSettingChange('reminderMode', 'presets'); setShowToneModal(true); }} className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-all ${settings.reminderMode === 'presets' ? 'accent-bg accent-contrast-text' : 'opacity-40'}`}><Music size={10}/> CUSTOM <Sliders size={10}/></button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3"><Palette className="accent-text" size={20} /><h2 className="text-sm font-bold uppercase tracking-wider opacity-60 tracking-widest">Interface</h2></div>
                        <div className="flex flex-wrap gap-2">{THEMES.map(t => (<button key={t.id} onClick={() => { handleSettingChange('themeId', t.id); if (t.id === 'custom') setShowCustomModal(true); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${settings.themeId === t.id ? 'accent-border accent-bg accent-contrast-text' : 'border-white/5 hover:bg-white/5 opacity-50 hover:opacity-100'}`}>{t.name} {t.id === 'custom' && <Settings2 size={10} className="inline ml-1 opacity-50" />}</button>))}</div>
                    </div>
                </div>
            </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen p-8 overflow-y-auto relative pt-14">
      <Header />
      <div className="max-w-4xl mx-auto space-y-8 pb-24">
        <header className="flex items-center justify-between mb-8"><div><h1 className="text-2xl font-bold accent-text uppercase tracking-tight"><Terminal size={24} /> Reflection</h1><p className="opacity-40 text-sm mt-1">Audit results.</p></div><div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1 animate-pulse font-bold"><AlertCircle size={12} /> ENFORCER ACTIVE</div></header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 md:col-span-2 border-l-4 accent-border bg-white/5"><label className="block text-xs font-bold accent-text mb-2 uppercase opacity-60">Bet</label><p className="italic text-lg opacity-90 data-text">"{formData.bet || "No bet recorded."}"</p></div>
            <div className="glass-card p-6 md:col-span-2"><label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider opacity-60">1. Activity</label><textarea value={formData.activity} onChange={(e) => setFormData(prev => ({...prev, activity: e.target.value}))} placeholder="Audit time..." className="input-field h-24 resize-none"/></div>
            <div className="glass-card p-6"><label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider opacity-60">2. Output</label><textarea value={formData.output} onChange={(e) => setFormData(prev => ({...prev, output: e.target.value}))} placeholder="Proof..." className="input-field h-24 resize-none"/></div>
            <div className="glass-card p-6 border-2 accent-border">
                 <label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider opacity-60">3. Result</label>
                 <div className="flex gap-4 mb-4"><button onClick={() => setFormData({...formData, hypothesisValid: true})} className={`flex-1 py-3 rounded-xl border text-sm font-black transition-all ${formData.hypothesisValid === true ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-transparent border-white/10 opacity-30'}`}>WON</button><button onClick={() => setFormData({...formData, hypothesisValid: false})} className={`flex-1 py-3 rounded-xl border text-sm font-black transition-all ${formData.hypothesisValid === false ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-transparent border-white/10 opacity-30'}`}>LOST</button></div>
                 <input type="text" value={formData.hypothesisNote} onChange={(e) => setFormData(prev => ({...prev, hypothesisNote: e.target.value}))} placeholder="Takeaway..." className="input-field"/>
            </div>
            <div className="glass-card p-6"><label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider opacity-60">4. Friction</label><textarea value={formData.friction} onChange={(e) => setFormData(prev => ({...prev, friction: e.target.value}))} placeholder="Identify resistance..." className="input-field h-24 resize-none"/></div>
             <div className="glass-card p-6 flex flex-col justify-center space-y-4">
                 <label className="block text-xs font-bold accent-text uppercase tracking-wider opacity-60">5. Protocol</label>
                 <div className="flex items-center gap-3"><button onClick={() => setFormData({...formData, pivot: false})} className={`flex-1 py-4 rounded-xl border transition-all font-bold ${!formData.pivot ? 'bg-white/10 border-white/40' : 'border-white/5 opacity-30'}`}>CONTINUE</button><button onClick={() => setFormData({...formData, pivot: true})} className={`flex-1 py-4 rounded-xl border transition-all font-bold ${formData.pivot ? 'accent-bg accent-border accent-contrast-text' : 'border-white/5 opacity-30'}`}>PIVOT</button></div>
            </div>
            <div className="glass-card p-6 md:col-span-2"><label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider opacity-60">6. Next Step</label><div className="flex items-center gap-3"><ArrowRight size={20} className="accent-text" /><input type="text" value={formData.nextStep} onChange={(e) => setFormData(prev => ({...prev, nextStep: e.target.value}))} placeholder="Target..." className="input-field py-4 text-base"/></div></div>
            <div className="glass-card p-6 md:col-span-2 bg-yellow-400/5 border-yellow-400/20"><label className="block text-xs font-bold text-yellow-500 mb-2 uppercase tracking-wider opacity-60">7. Velocity Boost</label><div className="flex items-center gap-3"><Zap size={20} className="text-yellow-400" /><input type="text" value={formData.quickWin} onChange={(e) => setFormData(prev => ({...prev, quickWin: e.target.value}))} placeholder="2-min win..." className="input-field py-4 border-yellow-400/10 focus:border-yellow-400/50"/></div></div>
        </div>
        <div className="fixed bottom-0 left-0 w-full p-6 bg-transparent backdrop-blur-3xl border-t border-white/5 flex justify-center z-50">
            <button onClick={handleSubmit} disabled={!formData.activity || !formData.output} className={`px-12 py-4 rounded-2xl font-black tracking-widest transition-all flex items-center gap-3 ${formData.activity && formData.output ? 'accent-bg accent-contrast-text shadow-[0_0_40px_rgba(0,0,0,0.4)] scale-105 active:scale-95' : 'bg-white/5 opacity-20 cursor-not-allowed'}`}><CheckCircle size={20} /> AUTHORIZE UNLOCK</button>
        </div>
      </div>
    </div>
  );
}

export default App;
