import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, AlertCircle, Save, X, Terminal, Activity, Zap, HelpCircle, ArrowRight, Play, Pause, RotateCcw, Plus, Minus, Palette, Layout, Minimize2, Maximize2, Square, Bell, Volume2, Copy, Archive, Calendar, ClipboardCheck, Trash2, Edit3, Settings2, Box, Type, Database, PenTool, RefreshCcw, EyeOff, FastForward, Radio, Shuffle, Music, Sliders, RefreshCw, Compass, Waves, Settings, BatteryCharging, ChevronDown, ChevronUp, SkipForward, Coffee, Target as TargetIcon, History, Lightbulb, FileJson, FolderOpen, Star, BrainCircuit, Flag, Tally5, Gem, Battery, Pen, Quote, Microscope, Target } from 'lucide-react';

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
  pomodoroOnly: false,
  reminderInterval: 60,
  reminderMode: 'stochastic',
  timerDuration: 25 * 60,
  restDuration: 5 * 60,
  logFilePath: '',
  customTheme: { id: 'custom', name: 'Custom', bg: '#121212', accent: '#8B5CF6', contrast: '#ffffff', card: 'rgba(255, 255, 255, 0.05)', input: 'rgba(0, 0, 0, 0.2)', inputText: '#ffffff', inputPlaceholder: 'rgba(255, 255, 255, 0.4)', dataText: '#ffffff', text: '#ffffff' },
  customTone: { freq: 440, type: 'sine', volume: 0.15, duration: 0.4 }
};

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
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed, customTheme: { ...DEFAULT_SETTINGS.customTheme, ...(parsed.customTheme || {}) }, customTone: { ...DEFAULT_SETTINGS.customTone, ...(parsed.customTone || {}) } };
    } catch (e) { return DEFAULT_SETTINGS; }
  });

  const [timeLeft, setTimeLeft] = useState(settings.timerDuration);
  const [isActive, setIsActive] = useState(false);
  const [isEnforced, setIsEnforced] = useState(false);
  const [pomodoroState, setPomodoroState] = useState('focus'); // 'focus' or 'rest'
  const [focusCount, setFocusCount] = useState(0);
  const [showArchives, setShowArchives] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showToneModal, setShowToneModal] = useState(false);
  const [archiveData, setArchiveData] = useState({});
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMaximized, setIsMaximized] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);
  const [editFields, setEditFields] = useState({});
  const [formData, setFormData] = useState({ activity: '', output: '', utility: 5, friction: '', uncertainty: 'stable', focusDepth: 5, energyLevel: 5, hypothesisValid: true, hypothesisNote: '', nextStep: '', quickWin: '', bet: '' });

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

  const handleSystemMinimize = () => {
      if (settings.autoMinimize && window.electron) {
          window.electron.minimizeApp();
      }
  };

  useEffect(() => {
    if (isActive && !isEnforced) {
        handleSystemMinimize();
    }
  }, [isActive, isEnforced]);

  useEffect(() => {
    if (!isActive && !isEnforced && settings.reminderInterval > 0) {
      reminderRef.current = setInterval(() => playReminder(), settings.reminderInterval * 1000);
    } else {
      clearInterval(reminderRef.current);
    }
    return () => clearInterval(reminderRef.current);
  }, [isActive, isEnforced, settings.reminderInterval, settings.reminderMode]);

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

  const playPeep = (freq = 660, dur = 0.1) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + dur);
    } catch (e) {}
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false); 
      playAlarm();
      if (settings.pomodoroOnly) {
          if (pomodoroState === 'focus') {
              setFocusCount(prev => prev + 1);
              setPomodoroState('rest');
              setTimeLeft(settings.restDuration);
              playPeep(440, 0.5);
              setTimeout(() => setIsActive(true), 100);
          } else {
              setPomodoroState('focus');
              setTimeLeft(settings.timerDuration);
              playPeep(880, 0.5);
              setTimeout(() => setIsActive(true), 100);
          }
      } else {
          setIsEnforced(true);
          if (window.electron) window.electron.triggerEnforce();
      }
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, settings.pomodoroOnly, pomodoroState]);

  const handleSettingChange = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));
  const adjustTimer = (amt) => { 
      const key = pomodoroState === 'focus' ? 'timerDuration' : 'restDuration';
      const nd = Math.max(60, settings[key] + amt); 
      setSettings(prev => ({...prev, [key]: nd})); 
      if (!isActive) setTimeLeft(nd); 
  };
  const resetTimer = () => { playPeep(440); setIsActive(false); setTimeLeft(pomodoroState === 'focus' ? settings.timerDuration : settings.restDuration); };
  const forceFinish = () => { 
      playPeep(880); 
      setIsActive(false); 
      if (settings.pomodoroOnly) {
          if (pomodoroState === 'focus') {
              setFocusCount(prev => prev + 1);
              setPomodoroState('rest');
              setTimeLeft(settings.restDuration);
          } else {
              setPomodoroState('focus');
              setTimeLeft(settings.timerDuration);
          }
          setTimeout(() => setIsActive(true), 100);
      } else {
          setIsEnforced(true); 
          if (window.electron) window.electron.triggerEnforce(); 
      }
  };

  const handleAuthorization = (shouldPivot) => {
    if (!formData.activity || !formData.output || !formData.nextStep) return;
    if (window.electron) {
        window.electron.saveLog({ ...formData, pivot: shouldPivot }, settings.logFilePath);
        setIsEnforced(false);
        const reset = { activity: '', output: '', utility: 5, friction: '', uncertainty: 'stable', focusDepth: 5, energyLevel: 5, hypothesisValid: true, hypothesisNote: '', nextStep: '', quickWin: '' };
        if (!shouldPivot) {
            setFormData(prev => ({ ...prev, ...reset }));
            setTimeLeft(settings.timerDuration);
            setIsActive(true);
            playPeep(880, 0.2);
        } else {
            setFormData({ ...reset, bet: '' });
            setTimeLeft(settings.timerDuration);
            setIsActive(false); 
            playPeep(440, 0.2);
            handleSystemMinimize();
        }
    }
  };

  const handleSkip = () => {
      playPeep(440, 0.3);
      setIsEnforced(false);
      const reset = { activity: '', output: '', utility: 5, friction: '', uncertainty: 'stable', focusDepth: 5, energyLevel: 5, hypothesisValid: true, hypothesisNote: '', nextStep: '', quickWin: '' };
      setFormData(prev => ({ ...prev, ...reset, bet: '' }));
      setTimeLeft(settings.timerDuration);
      setIsActive(false);
      handleSystemMinimize();
  };

  const toggleExpand = (id) => setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const Header = () => (
    <div className="fixed top-0 left-0 w-full h-10 flex items-center justify-between px-4 z-[100] drag">
        <div className="flex items-center gap-4 no-drag">
            <button onClick={async () => { const logs = await window.electron?.getLogs(settings.logFilePath); setArchiveData(logs || {}); setShowArchives(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-40 hover:opacity-100 flex items-center gap-2 text-main">
                <History size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest text-main">History</span>
            </button>
            <button onClick={() => setShowSettingsModal(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-40 hover:opacity-100 flex items-center gap-2 text-main">
                <Settings size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest text-main">Settings</span>
            </button>
            <div className="flex items-center gap-2 opacity-40 text-[10px] font-bold uppercase tracking-widest text-main">
                <Clock size={12} className="accent-text" /> Time Master
            </div>
        </div>
        <div className="flex items-center gap-1 no-drag">
            <button onClick={() => window.electron?.minimizeApp()} className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-40 hover:opacity-100 text-main"><Minus size={14} /></button>
            <button onClick={() => window.electron?.maximizeApp()} className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-40 hover:opacity-100 text-main">{isMaximized ? <Copy size={14} className="rotate-180" /> : <Square size={12} />}</button>
            <button onClick={() => window.electron?.closeApp()} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors opacity-40 hover:opacity-100 text-main"><X size={14} /></button>
        </div>
    </div>
  );

  const CustomThemeModal = () => {
    const cardVis = rgbaToHexAndAlpha(settings.customTheme.card);
    const inputVis = rgbaToHexAndAlpha(settings.customTheme.input);
    const placeholderVis = rgbaToHexAndAlpha(settings.customTheme.inputPlaceholder);
    const upd = (u) => setSettings(prev => ({ ...prev, customTheme: { ...prev.customTheme, ...u } }));
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[var(--bg-color)]/95 backdrop-blur-xl">
            <div className="glass-card max-w-2xl w-full p-8 space-y-8 border border-white/10 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between text-main"><h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2"><Palette size={24} className="accent-text" /> Design Your Theme</h2>
                    <div className="flex items-center gap-2"><button onClick={() => upd(DEFAULT_SETTINGS.customTheme)} className="p-2 hover:bg-white/10 rounded-full opacity-40"><RefreshCcw size={18}/></button><button onClick={() => setShowCustomModal(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 text-main">
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2">Colors & Surfaces</h3>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Background</label><div className="flex items-center gap-3"><input type="color" value={settings.customTheme.bg} onChange={(e) => upd({bg: e.target.value})} className="w-10 h-10 bg-transparent cursor-pointer" /></div></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Card Transparency</label><input type="range" min="0" max="1" step="0.01" value={cardVis.alpha} onChange={(e) => upd({card: hexToRgba(cardVis.hex, e.target.value)})} className="w-full accent-accent-color" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Input Transparency</label><input type="range" min="0" max="1" step="0.01" value={inputVis.alpha} onChange={(e) => upd({input: hexToRgba(inputVis.hex, e.target.value)})} className="w-full accent-accent-color" /></div>
                    </div>
                    <div className="space-y-6 text-main">
                        <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2">Text & Accents</h3>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Main Text Color</label><input type="color" value={settings.customTheme.text} onChange={(e) => upd({text: e.target.value, dataText: e.target.value})} className="w-10 h-10 bg-transparent cursor-pointer" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Input Text Color</label><input type="color" value={settings.customTheme.inputText} onChange={(e) => upd({inputText: e.target.value})} className="w-10 h-10 bg-transparent cursor-pointer" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Placeholder Color</label><input type="color" value={placeholderVis.hex} onChange={(e) => upd({inputPlaceholder: hexToRgba(e.target.value, placeholderVis.alpha)})} className="w-10 h-10 bg-transparent cursor-pointer" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Highlight Color</label><input type="color" value={settings.customTheme.accent} onChange={(e) => upd({accent: e.target.value})} className="w-10 h-10 bg-transparent cursor-pointer" /></div>
                    </div>
                </div>
                <button onClick={() => setShowCustomModal(false)} className="w-full py-4 accent-bg accent-contrast-text rounded-2xl font-black uppercase tracking-widest">Save Design</button>
            </div>
        </div>
    );
  };

  const CustomToneModal = () => {
    const upd = (u) => setSettings(prev => ({ ...prev, customTone: { ...prev.customTone, ...u } }));
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[var(--bg-color)]/95 backdrop-blur-xl">
            <div className="glass-card max-w-md w-full p-8 space-y-8 border border-white/10 text-main">
                <div className="flex items-center justify-between"><h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2"><Music size={24} className="accent-text" /> Alert Sound</h2><button onClick={() => setShowToneModal(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button></div>
                <div className="space-y-6">
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Pitch ({settings.customTone.freq}Hz)</label><input type="range" min="100" max="2000" value={settings.customTone.freq} onChange={(e) => upd({freq: parseInt(e.target.value)})} className="w-full accent-accent-color" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase opacity-40">Sound Style</label><div className="grid grid-cols-2 gap-2">{['sine', 'triangle', 'square', 'sawtooth'].map(t => (<button key={t} onClick={() => upd({type: t})} className={`py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${settings.customTone.type === t ? 'accent-bg accent-contrast-text border-transparent' : 'border-white/10'}`}>{t}</button>))}</div></div>
                </div>
                <div className="flex gap-3"><button onClick={() => playReminder(settings.customTone)} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 text-main"><Volume2 size={16} /> Test Sound</button><button onClick={() => setShowToneModal(false)} className="flex-1 py-4 accent-bg accent-contrast-text rounded-2xl font-black uppercase tracking-widest">Apply Sound</button></div>
            </div>
        </div>
    );
  };

  const SettingsModal = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[var(--bg-color)]/95 backdrop-blur-xl">
        <div className="glass-card max-w-3xl w-full p-8 space-y-8 border border-white/10 overflow-y-auto max-h-[90vh] shadow-[0_0_100px_rgba(0,0,0,0.5)] text-main">
            <div className="flex items-center justify-between"><h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3"><Settings size={28} className="accent-text" /> Settings</h2><button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2">Storage Node</h3>
                    <div className="space-y-4 text-main">
                        <button onClick={async () => { const path = await window.electron.selectLogFile(); if (path) setSettings(prev => ({...prev, logFilePath: path})); }} className="w-full py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-3"><FileJson size={16} className="accent-text" /><div className="flex flex-col items-start"><span className="text-xs font-bold opacity-60 uppercase">Select Log File</span><span className="text-[8px] font-mono opacity-30 truncate max-w-[150px]">{settings.logFilePath || 'Default System Path'}</span></div></div>
                            <ArrowRight size={14} className="opacity-20 group-hover:opacity-100 transition-all accent-text" />
                        </button>
                        <button onClick={() => window.electron?.openLogsFolder(settings.logFilePath)} className="w-full py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-3"><FolderOpen size={16} className="accent-text" /><span className="text-xs font-bold opacity-60 uppercase">Open Folder</span></div>
                            <X size={14} className="rotate-45 opacity-20 group-hover:opacity-100 transition-all accent-text" />
                        </button>
                    </div>

                    <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2 pt-4">Break Times</h3>
                    <div className="space-y-4 text-main">
                        <div className="flex items-center justify-between"><span className="text-xs font-bold opacity-60 uppercase tracking-tighter">Rest Duration</span><div className="flex items-center gap-3"><button onClick={() => setSettings(prev => ({ ...prev, restDuration: Math.max(60, prev.restDuration - 60) }))} className="p-1 hover:bg-white/5 rounded border border-white/10"><Minus size={12}/></button><span className="font-mono text-sm">{Math.floor(settings.restDuration / 60)}m</span><button onClick={() => setSettings(prev => ({ ...prev, restDuration: prev.restDuration + 60 }))} className="p-1 hover:bg-white/5 rounded border border-white/10"><Plus size={12}/></button></div></div>
                    </div>
                    <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2 pt-4">Reminders</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><span className="text-xs font-bold opacity-60 uppercase tracking-tighter text-main">Alert Every</span><div className="flex items-center gap-3"><button onClick={() => setSettings(prev => ({ ...prev, reminderInterval: Math.max(0, prev.reminderInterval - 10) }))} className="p-1 hover:bg-white/5 rounded border border-white/10 text-main"><Minus size={12}/></button><span className="font-mono text-sm text-main">{settings.reminderInterval}s</span><button onClick={() => setSettings(prev => ({ ...prev, reminderInterval: prev.reminderInterval + 10 }))} className="p-1 hover:bg-white/5 rounded border border-white/10 text-main"><Plus size={12}/></button></div></div>
                        <div className="flex items-center justify-between text-main"><span className="text-xs font-bold opacity-60 uppercase tracking-tighter">Sound Type</span><div className="flex bg-white/5 rounded-lg p-1 border border-white/10"><button onClick={() => setSettings(prev => ({...prev, reminderMode: 'stochastic'}))} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${settings.reminderMode === 'stochastic' ? 'accent-bg accent-contrast-text' : 'opacity-40'}`}>RANDOM</button><button onClick={() => { setSettings(prev => ({...prev, reminderMode: 'presets'})); setShowToneModal(true); }} className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all ${settings.reminderMode === 'presets' ? 'accent-bg accent-contrast-text' : 'opacity-40'}`}>CUSTOM <Sliders size={10}/></button></div></div>
                    </div>
                </div>
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2">Visual Style</h3>
                    <div className="grid grid-cols-2 gap-2 text-main">{THEMES.map(t => (<button key={t.id} onClick={() => { setSettings(prev => ({...prev, themeId: t.id})); if (t.id === 'custom') setShowCustomModal(true); }} className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${settings.themeId === t.id ? 'accent-border accent-bg accent-contrast-text' : 'border-white/5 hover:bg-white/5 opacity-40'}`}>{t.name} {t.id === 'custom' && <Settings2 size={10} className="inline ml-1" />}</button>))}</div>
                </div>
            </div>
            <button onClick={() => setShowSettingsModal(false)} className="w-full py-5 accent-bg accent-contrast-text rounded-2xl font-black uppercase tracking-widest shadow-[0_0_40px_rgba(0,0,0,0.3)] active:scale-95 transition-all">Apply All Changes</button>
        </div>
    </div>
  );

  if (showArchives) {
    const getVisibleLogs = () => {
        const visible = [];
        const sortedDates = Object.keys(archiveData).sort((a, b) => b.localeCompare(a));
        
        for (const date of sortedDates) {
            const isInRange = (!startDate || date >= startDate) && (!endDate || date <= endDate);
            if (isInRange) {
                const dayLogs = [...archiveData[date]].reverse().map(l => ({ ...l, date }));
                visible.push(...dayLogs);
            }
        }
        return visible;
    };

    const logs = getVisibleLogs();

    return (
        <div className="min-h-screen p-8 overflow-y-auto pt-14 text-main">
            <Header />
            {showSettingsModal && <SettingsModal />}
            {showCustomModal && <CustomThemeModal />}
            {showToneModal && <CustomToneModal />}
            <div className="max-w-5xl mx-auto space-y-10">
                <header className="flex items-center justify-between flex-wrap gap-8 border-b border-white/5 pb-8">
                    <button onClick={() => setShowArchives(false)} className="flex items-center gap-2 text-sm font-bold opacity-40 hover:opacity-100 transition-all accent-text"><ArrowRight className="rotate-180" size={16} /> BACK TO LAB</button>
                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex items-center bg-white/5 px-5 py-3 rounded-2xl border border-white/10 text-main">
                            <Calendar size={14} className="accent-text mr-4 opacity-40" />
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-xs font-mono focus:outline-none data-text [color-scheme:dark] cursor-pointer"/>
                            <ArrowRight size={14} className="mx-4 opacity-20" />
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-xs font-mono focus:outline-none data-text [color-scheme:dark] cursor-pointer"/>
                        </div>
                        <button onClick={() => navigator.clipboard.writeText(JSON.stringify(logs, null, 2))} className="px-6 py-3 accent-bg accent-contrast-text text-xs font-black rounded-2xl hover:opacity-80 transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(0,0,0,0.2)]"><ClipboardCheck size={18} /> COPY RECORDS ({logs.length})</button>
                    </div>
                </header>

                <div className="space-y-6">
                    {logs.length === 0 ? <div className="glass-card p-32 text-center opacity-20 italic flex flex-col items-center gap-4"><Microscope size={48} /> No session data found in this range.</div> : 
                        logs.map((log) => {
                            const isExpanded = expandedIds.includes(log.id) || editingId === log.id;
                            const won = (editingId === log.id ? editFields.hypothesisValid : log.hypothesisValid);
                            return (
                                <div key={log.id} className={`glass-card overflow-hidden border transition-all duration-500 relative group ${isExpanded ? 'border-accent-color/30 shadow-2xl bg-white/[0.02]' : 'border-white/10 hover:border-white/20'}`}>
                                    <div className={`absolute left-0 top-0 w-1.5 h-full transition-colors duration-500 ${won ? 'bg-green-500/40' : 'bg-red-500/40'}`}></div>
                                    
                                    <div onClick={() => !editingId && toggleExpand(log.id)} className={`p-5 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-white/5 border-b border-white/5' : 'hover:bg-white/[0.02]'}`}>
                                        <div className="flex items-center gap-8 pl-4">
                                            <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-white/5 pr-8">
                                                <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter text-main">{log.date.split('-').slice(1).join('/')}</span>
                                                <span className="text-sm font-mono font-bold accent-text">{log.timestamp.split(', ')[1]?.split(':').slice(0,2).join(':') || log.timestamp}</span>
                                            </div>
                                            
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-base font-bold data-text tracking-tight truncate max-w-md">{log.activity}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest border transition-all ${won ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{won ? 'GOAL MET' : 'MISSED'}</span>
                                                        {editingId === log.id && <button onClick={(e) => { e.stopPropagation(); setEditFields({...editFields, hypothesisValid: !editFields.hypothesisValid}); }} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-[4px] text-[8px] font-black hover:bg-white/10 transition-all uppercase">Flip</button>}
                                                    </div>
                                                </div>
                                                
                                                {!isExpanded && (
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-40 uppercase"><Star size={10} className="accent-text"/> {log.focusDepth} Focus</div>
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-40 uppercase"><Gem size={10} className="text-blue-400"/> {log.utility} Value</div>
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-40 uppercase"><Battery size={10} className="text-yellow-400"/> {log.energyLevel} Energy</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 no-drag text-main">
                                                {editingId === log.id ? (
                                                    <><button onClick={async (e) => { e.stopPropagation(); const nd = {...archiveData}; nd[log.date] = nd[log.date].map(l => l.id === editingId ? editFields : l); await window.electron.updateLogs(nd, settings.logFilePath); setArchiveData(nd); setEditingId(null); }} className="p-2 bg-green-500/20 text-green-400 rounded-lg"><Save size={16} /></button><button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="p-2 bg-white/5 text-white/40 rounded-lg"><X size={16} /></button></>
                                                ) : (
                                                    <><button onClick={(e) => { e.stopPropagation(); setEditingId(log.id); setEditFields(log); }} className="p-2 bg-white/5 text-white/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"><Edit3 size={16} /></button><button onClick={async (e) => { e.stopPropagation(); if (!confirm("Purge Technical Record?")) return; const nd = {...archiveData}; nd[log.date] = nd[log.date].filter(l => l.id !== log.id); if (nd[log.date].length === 0) delete nd[log.date]; await window.electron.updateLogs(nd, settings.logFilePath); setArchiveData(nd); }} className="p-2 bg-red-500/5 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"><Trash2 size={16} /></button></>
                                                )}
                                            </div>
                                            <div className={`p-2 rounded-full transition-transform duration-500 ${isExpanded ? 'rotate-180 bg-white/5' : 'opacity-20 group-hover:opacity-100'}`}><ChevronDown size={18} className="text-main" /></div>
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div className="p-8 space-y-10 animate-in fade-in slide-in-from-top-2 duration-500 text-main">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-30"><TargetIcon size={14} className="accent-text"/> Pre-Commitment Goal</div>
                                                    {editingId === log.id ? <textarea value={editFields.bet} onChange={(e) => setEditFields({...editFields, bet: e.target.value})} className="input-field h-28 text-sm"/> : <p className="italic text-xl font-light data-text leading-relaxed pl-4 border-l-2 border-accent-color/20">"{log.bet}"</p>}
                                                </div>
                                                <div className="grid grid-cols-1 gap-8">
                                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 block">Technical Activity</label>{editingId === log.id ? <input value={editFields.activity} onChange={(e) => setEditFields({...editFields, activity: e.target.value})} className="input-field py-3"/> : <p className="text-base font-bold data-text">{log.activity}</p>}</div>
                                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 block">Verified Output</label>{editingId === log.id ? <input value={editFields.output} onChange={(e) => setEditFields({...editFields, output: e.target.value})} className="input-field py-3"/> : <p className="text-sm font-mono data-text bg-black/20 p-3 rounded-lg border border-white/5">{log.output}</p>}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                <div className="glass-card p-6 border-white/5 space-y-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30"><BrainCircuit size={14}/> Metrics</div>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between text-[10px] font-bold"><span>FOCUS DEPTH</span><span className="accent-text">{editingId === log.id ? editFields.focusDepth : log.focusDepth}/10</span></div>
                                                        {editingId === log.id ? <input type="range" min="1" max="10" value={editFields.focusDepth} onChange={(e) => setEditFields({...editFields, focusDepth: parseInt(e.target.value)})} className="w-full accent-accent-color" /> : <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full accent-bg" style={{width: `${(log.focusDepth/10)*100}%`}}></div></div>}
                                                        <div className="flex items-center justify-between text-[10px] font-bold"><span>SESSION VALUE</span><span className="text-blue-400">{editingId === log.id ? editFields.utility : log.utility}/10</span></div>
                                                        {editingId === log.id ? <input type="range" min="1" max="10" value={editFields.utility} onChange={(e) => setEditFields({...editFields, utility: parseInt(e.target.value)})} className="w-full accent-accent-color" /> : <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-400" style={{width: `${(log.utility/10)*100}%`}}></div></div>}
                                                        <div className="flex items-center justify-between text-[10px] font-bold"><span>MENTAL ENERGY</span><span className="text-yellow-400">{editingId === log.id ? editFields.energyLevel : log.energyLevel}/10</span></div>
                                                        {editingId === log.id ? <input type="range" min="1" max="10" value={editFields.energyLevel} onChange={(e) => setEditFields({...editFields, energyLevel: parseInt(e.target.value)})} className="w-full accent-accent-color" /> : <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-yellow-400" style={{width: `${(log.energyLevel/10)*100}%`}}></div></div>}
                                                    </div>
                                                </div>
                                                
                                                <div className="glass-card p-6 border-white/5 space-y-4 md:col-span-2">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30"><AlertCircle size={14}/> Resistance & Observations</div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-2"><label className="text-[8px] font-black opacity-30 uppercase">FRICTION NODES</label>{editingId === log.id ? <textarea value={editFields.friction} onChange={(e) => setEditFields({...editFields, friction: e.target.value})} className="input-field h-24 text-xs"/> : <p className="text-xs data-text leading-relaxed">{log.friction || 'Zero friction recorded.'}</p>}</div>
                                                        <div className="space-y-2"><label className="text-[8px] font-black opacity-30 uppercase">SCIENTIFIC LESSON</label>{editingId === log.id ? <textarea value={editFields.hypothesisNote} onChange={(e) => setEditFields({...editFields, hypothesisNote: e.target.value})} className="input-field h-24 text-xs"/> : <p className="text-xs data-text leading-relaxed italic">{log.hypothesisNote || 'No lesson derived.'}</p>}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                                                <div className="flex items-start gap-4">
                                                    <Flag size={18} className="accent-text mt-1 shrink-0"/>
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-black uppercase opacity-30">NEXT STRATEGIC TASK</span>
                                                        {editingId === log.id ? <input value={editFields.nextStep} onChange={(e) => setEditFields({...editFields, nextStep: e.target.value})} className="input-field py-2"/> : <p className="text-sm font-bold data-text underline decoration-accent-color decoration-2 underline-offset-4">{log.nextStep}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <Zap size={18} className="text-yellow-400 mt-1 shrink-0"/>
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-black uppercase opacity-30">MOMENTUM CATALYST</span>
                                                        {editingId === log.id ? <input value={editFields.quickWin} onChange={(e) => setEditFields({...editFields, quickWin: e.target.value})} className="input-field py-2"/> : <p className="text-sm font-medium data-text opacity-60">{log.quickWin || 'None specified.'}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
  }

  if (!isEnforced) {
     return (
        <div className="min-h-screen flex flex-col p-8 overflow-y-auto relative pt-14 text-main">
            <Header />
            {showSettingsModal && <SettingsModal />}
            {showCustomModal && <CustomThemeModal />}
            {showToneModal && <CustomToneModal />}
            <div className="max-w-2xl mx-auto w-full py-4 text-main">
                <div className="glass-card p-10 flex flex-col items-center space-y-8 relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 left-0 w-full h-1 accent-bg opacity-30"></div>
                    
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                            {settings.pomodoroOnly ? (
                                pomodoroState === 'focus' ? <><Activity size={14} className="accent-text" /> <span className="text-[10px] font-black uppercase tracking-[0.2em] accent-text">Focusing</span></> : <><Coffee size={14} className="text-amber-500" /> <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Resting</span></>
                            ) : (
                                <><Zap size={14} className="accent-text" /> <span className="text-[10px] font-black uppercase tracking-[0.2em] accent-text">Deep Work Focus</span></>
                            )}
                        </div>
                        {settings.pomodoroOnly && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-lg animate-in zoom-in duration-300">
                                <Tally5 size={12} className="accent-text" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Sessions: {focusCount}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        <button onClick={() => adjustTimer(-300)} className="p-2 hover:bg-white/5 rounded-full opacity-40 hover:opacity-100 transition-all"><Minus size={24} /></button>
                        <div className="text-7xl font-mono font-light tracking-tighter">{Math.floor(timeLeft / 60)}:{ (timeLeft % 60).toString().padStart(2, '0') }</div>
                        <button onClick={() => adjustTimer(300)} className="p-2 hover:bg-white/5 rounded-full opacity-40 hover:opacity-100 transition-all"><Plus size={24} /></button>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => { playPeep(880); setIsActive(!isActive); }} className={`px-10 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${isActive ? 'bg-amber-500/20 border border-amber-500/50 text-amber-500' : 'accent-bg accent-contrast-text'}`}>{isActive ? <><Pause fill="currentColor" size={20} /> PAUSE</> : <><Play fill="currentColor" size={20} /> START {pomodoroState === 'rest' ? 'REST' : 'FOCUS'}</>}</button>
                        <button onClick={forceFinish} className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl transition-all font-bold text-xs uppercase flex items-center gap-2 text-main"><CheckCircle size={18} className="text-green-500" /> Finish</button>
                        <button onClick={resetTimer} className="p-4 bg-white/5 border border-white/10 rounded-2xl transition-all text-main"><RotateCcw size={20} /></button>
                    </div>
                    
                    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-3 justify-center">
                            <TargetIcon className="accent-text" size={18} />
                            <h2 className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">
                                {settings.pomodoroOnly ? "I'm focusing on" : "My Goal for this session"}
                            </h2>
                        </div>
                        <textarea 
                            value={formData.bet} 
                            onChange={(e) => setFormData(prev => ({...prev, bet: e.target.value}))} 
                            placeholder={settings.pomodoroOnly ? "I will work on..." : "I will finish..."} 
                            className="input-field h-24 resize-none text-center bg-black/20 border-white/5 focus:border-accent-color/30"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/5 w-full flex flex-col items-center gap-3">
                        <button 
                            onClick={() => { playPeep(660, 0.05); setFocusCount(0); setSettings(prev => ({...prev, pomodoroOnly: !prev.pomodoroOnly})); if (pomodoroState === 'rest') { setPomodoroState('focus'); setTimeLeft(settings.timerDuration); } }}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all border ${settings.pomodoroOnly ? 'accent-bg accent-border accent-contrast-text shadow-[0_0_20px_rgba(0,0,0,0.2)]' : 'border-white/10 opacity-30 hover:opacity-100'}`}
                        >
                            {settings.pomodoroOnly ? <Box size={12} fill="currentColor" /> : <Clock size={12} />}
                            {settings.pomodoroOnly ? 'SIMPLE TIMER: ON' : 'DEEP WORK: ON'}
                        </button>
                        <button 
                            onClick={() => { playPeep(660, 0.05); setSettings(prev => ({...prev, autoMinimize: !prev.autoMinimize})); }}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all border ${settings.autoMinimize ? 'accent-bg accent-border accent-contrast-text' : 'border-white/10 opacity-20 hover:opacity-100'}`}
                        >
                            <Minimize2 size={12} />
                            {settings.autoMinimize ? 'AUTO-HIDE: ON' : 'AUTO-HIDE: OFF'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen p-8 overflow-y-auto relative pt-14 text-main">
      <Header />
      {showSettingsModal && <SettingsModal />}
      {showCustomModal && <CustomThemeModal />}
      {showToneModal && <CustomToneModal />}
      <div className="max-w-4xl mx-auto space-y-8 pb-24 text-main">
        <header className="flex items-center justify-between mb-8"><div><h1 className="text-2xl font-bold accent-text uppercase tracking-tight"><ClipboardCheck size={24} /> Session Review</h1><p className="opacity-40 text-sm mt-1">Check your progress.</p></div><div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1 animate-pulse font-bold"><AlertCircle size={12} /> STAY FOCUSED</div></header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 md:col-span-2 border border-white/10 bg-white/5">
                <label className="block text-xs font-bold accent-text mb-2 uppercase opacity-60">My Goal</label>
                <textarea 
                    value={formData.bet} 
                    onChange={(e) => setFormData(prev => ({...prev, bet: e.target.value}))} 
                    className="input-field h-24 resize-none bg-black/20 border-white/5 focus:border-accent-color/30 italic text-lg"
                />
            </div>
            
            <div className="glass-card p-6 border border-white/10">
                <label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider flex items-center gap-1">1. Work Description <span className="text-red-500">*</span></label>
                <textarea value={formData.activity} onChange={(e) => setFormData(prev => ({...prev, activity: e.target.value}))} placeholder="What did you focus on?" className="input-field h-32 resize-none"/>
            </div>
            
            <div className="glass-card p-6 border border-white/10">
                <label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider flex items-center gap-1">2. Tangible Output <span className="text-red-500">*</span></label>
                <textarea value={formData.output} onChange={(e) => setFormData(prev => ({...prev, output: e.target.value}))} placeholder="What did you complete?" className="input-field h-32 resize-none"/>
            </div>

            <div className="glass-card p-6 border border-white/10">
                 <label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider">3. Hypothesis Validation</label>
                 <div className="flex gap-4 mb-4"><button onClick={() => setFormData({...formData, hypothesisValid: true})} className={`flex-1 py-3 rounded-xl border text-sm font-black transition-all ${formData.hypothesisValid === true ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-transparent border-white/10 opacity-30'}`}>YES</button><button onClick={() => setFormData({...formData, hypothesisValid: false})} className={`flex-1 py-3 rounded-xl border text-sm font-black transition-all ${formData.hypothesisValid === false ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-transparent border-white/10 opacity-30'}`}>NO</button></div>
                 <input type="text" value={formData.hypothesisNote} onChange={(e) => setFormData(prev => ({...prev, hypothesisNote: e.target.value}))} placeholder="Technical lesson learned..." className="input-field"/>
            </div>

            <div className="glass-card p-6 border border-white/10">
                <label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider">4. Resistance & Friction</label>
                <textarea value={formData.friction} onChange={(e) => setFormData(prev => ({...prev, friction: e.target.value}))} placeholder="Any distractions or obstacles?" className="input-field h-24 resize-none"/>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex flex-col justify-center space-y-4 border border-white/10">
                     <label className="block text-[10px] font-bold accent-text uppercase tracking-wider flex items-center gap-2"><Waves size={14} /> Focus Depth</label>
                     <div className="space-y-4"><input type="range" min="1" max="10" value={formData.focusDepth} onChange={(e) => setFormData(prev => ({...prev, focusDepth: parseInt(e.target.value)}))} className="w-full accent-accent-color" /><div className="text-center font-mono text-xl font-bold accent-text">{formData.focusDepth}/10</div></div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-center space-y-4 border border-white/10">
                     <label className="block text-[10px] font-bold accent-text uppercase tracking-wider flex items-center gap-2"><Gem size={14} /> Session Value</label>
                     <div className="space-y-4"><input type="range" min="1" max="10" value={formData.utility} onChange={(e) => setFormData(prev => ({...prev, utility: parseInt(e.target.value)}))} className="w-full accent-accent-color" /><div className="text-center font-mono text-xl font-bold accent-text">{formData.utility}/10</div></div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-center space-y-4 border border-white/10">
                     <label className="block text-[10px] font-bold accent-text uppercase tracking-wider flex items-center gap-2"><Battery size={14} /> Mental Energy</label>
                     <div className="space-y-4"><input type="range" min="1" max="10" value={formData.energyLevel} onChange={(e) => setFormData(prev => ({...prev, energyLevel: parseInt(e.target.value)}))} className="w-full accent-accent-color" /><div className="text-center font-mono text-xl font-bold accent-text">{formData.energyLevel}/10</div></div>
                </div>
            </div>

            <div className="glass-card p-6 md:col-span-2 border border-white/10"><label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider flex items-center gap-1">5. Next Strategic Task <span className="text-red-500">*</span></label><div className="flex items-center gap-3"><ArrowRight size={20} className="accent-text" /><input type="text" value={formData.nextStep} onChange={(e) => setFormData(prev => ({...prev, nextStep: e.target.value}))} placeholder="What is the very next thing to do?" className="input-field py-4 text-base"/></div></div>
            <div className="glass-card p-6 md:col-span-2 bg-yellow-400/5 border-yellow-400/20"><label className="block text-xs font-bold text-yellow-500 mb-2 uppercase tracking-wider"><Zap size={14} className="inline mr-1" /> 6. Immediate Momentum Catalyst (Do it now)</label><div className="flex items-center gap-3"><Zap size={20} className="text-yellow-400" /><input type="text" value={formData.quickWin} onChange={(e) => setFormData(prev => ({...prev, quickWin: e.target.value}))} placeholder="Simple 2-minute task..." className="input-field py-4 border-yellow-400/10 focus:border-yellow-400/50"/></div></div>
        </div>
        <div className="fixed bottom-0 left-0 w-full p-6 bg-transparent backdrop-blur-3xl border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-center z-50">
            <button onClick={() => handleAuthorization(false)} disabled={!formData.activity || !formData.output || !formData.nextStep} className={`px-12 py-4 rounded-2xl font-black tracking-widest transition-all flex items-center justify-center gap-3 ${formData.activity && formData.output && formData.nextStep ? 'accent-bg accent-contrast-text shadow-[0_0_40px_rgba(0,0,0,0.4)] scale-105 active:scale-95' : 'bg-white/5 opacity-20 cursor-not-allowed'}`}><RefreshCw size={20} /> SAVE & RESTART</button>
            <button onClick={() => handleAuthorization(true)} disabled={!formData.activity || !formData.output || !formData.nextStep} className={`px-12 py-4 rounded-2xl font-black tracking-widest transition-all flex items-center justify-center gap-3 border border-white/10 ${formData.activity && formData.output && formData.nextStep ? 'bg-white/5 hover:bg-white/10 text-main' : 'opacity-20 cursor-not-allowed'}`}><Compass size={20} /> SAVE & STOP</button>
            <button onClick={handleSkip} className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 border border-red-500/20 text-main"><SkipForward size={18} /> Discard Session</button>
        </div>
      </div>
    </div>
  );
}

export default App;
