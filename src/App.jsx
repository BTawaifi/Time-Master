import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, AlertCircle, Save, X, Terminal, Activity, Zap, HelpCircle, ArrowRight, Play, Pause, RotateCcw, Plus, Minus, Target, Palette, Layout, Minimize2, Maximize2, Square, Bell, Volume2, Copy, Archive, Calendar, ClipboardCheck, Trash2, Edit3, Settings2, Box, Type, Database, PenTool, RefreshCcw } from 'lucide-react';

const THEMES = [
  { id: 'enforcer', name: 'Enforcer', bg: '#121212', accent: '#8B5CF6', contrast: '#ffffff', card: 'rgba(255, 255, 255, 0.05)', input: 'rgba(0, 0, 0, 0.2)', inputText: '#ffffff', dataText: '#ffffff', text: '#ffffff' },
  { id: 'carbon', name: 'Carbon', bg: '#0A0A0A', accent: '#404040', contrast: '#ffffff', card: 'rgba(255, 255, 255, 0.03)', input: 'rgba(0, 0, 0, 0.4)', inputText: '#ffffff', dataText: '#ffffff', text: '#ffffff' },
  { id: 'noir', name: 'Noir', bg: '#050505', accent: '#F8FAFC', contrast: '#000000', card: 'rgba(255, 255, 255, 0.02)', input: 'rgba(255, 255, 255, 0.05)', inputText: '#ffffff', dataText: '#ffffff', text: '#ffffff' },
  { id: 'midnight', name: 'Midnight Blueprint', bg: '#020617', accent: '#E2E8F0', contrast: '#000000', card: 'rgba(255, 255, 255, 0.03)', input: 'rgba(255, 255, 255, 0.05)', inputText: '#ffffff', dataText: '#ffffff', text: '#ffffff' },
  { id: 'neon', name: 'Neon Overload', bg: '#050505', accent: '#22C55E', contrast: '#000000', card: 'rgba(34, 197, 94, 0.05)', input: 'rgba(0, 0, 0, 0.4)', inputText: '#ffffff', dataText: '#ffffff', text: '#ffffff' },
  { id: 'bloodline', name: 'Bloodline', bg: '#0F0505', accent: '#EF4444', contrast: '#ffffff', card: 'rgba(239, 68, 68, 0.05)', input: 'rgba(0, 0, 0, 0.4)', inputText: '#ffffff', dataText: '#ffffff', text: '#ffffff' },
  { id: 'deepsea', name: 'Deep Sea', bg: '#020617', accent: '#38BDF8', contrast: '#000000', card: 'rgba(56, 189, 248, 0.05)', input: 'rgba(0, 0, 0, 0.4)', inputText: '#ffffff', dataText: '#ffffff', text: '#ffffff' },
  { id: 'solaris', name: 'Solaris', bg: '#070701', accent: '#EAB308', contrast: '#000000', card: 'rgba(234, 179, 8, 0.05)', input: 'rgba(0, 0, 0, 0.4)', inputText: '#ffffff', dataText: '#ffffff', text: '#ffffff' },
  { id: 'void', name: 'Void', bg: '#000000', accent: '#ffffff', contrast: '#000000', card: 'rgba(255, 255, 255, 0.05)', input: 'rgba(255, 255, 255, 0.02)', inputText: '#ffffff', dataText: '#ffffff', text: '#ffffff' },
  { id: 'paper', name: 'Paper', bg: '#FFFFFF', accent: '#2563EB', contrast: '#ffffff', card: 'rgba(0, 0, 0, 0.02)', input: 'rgba(0, 0, 0, 0.04)', inputText: '#1e293b', dataText: '#1e293b', text: '#1e293b', dim: 'rgba(0, 0, 0, 0.4)' },
  { id: 'nordic', name: 'Nordic Light', bg: '#ECEFF4', accent: '#5E81AC', contrast: '#ffffff', card: 'rgba(0, 0, 0, 0.02)', input: 'rgba(0, 0, 0, 0.04)', inputText: '#2E3440', dataText: '#2E3440', text: '#2E3440', dim: 'rgba(0, 0, 0, 0.4)' },
  { id: 'champagne', name: 'Champagne', bg: '#FDFCF0', accent: '#D97706', contrast: '#ffffff', card: 'rgba(0, 0, 0, 0.02)', input: 'rgba(0, 0, 0, 0.04)', inputText: '#451a03', dataText: '#451a03', text: '#451a03', dim: 'rgba(0, 0, 0, 0.4)' },
  { id: 'custom', name: 'Custom', bg: '#121212', accent: '#8B5CF6', contrast: '#ffffff', card: 'rgba(255, 255, 255, 0.05)', input: 'rgba(0, 0, 0, 0.2)', inputText: '#ffffff', dataText: '#ffffff', text: '#ffffff' }
];

function App() {
  const getInitialSetting = (key, defaultValue) => {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    try { return JSON.parse(stored); } catch(e) { return stored; }
  };

  const [customThemeSettings, setCustomThemeSettings] = useState(() => getInitialSetting('customThemeSettings', THEMES[THEMES.length - 1]));
  const [currentTheme, setCurrentTheme] = useState(() => {
    const themeId = localStorage.getItem('themeId') || THEMES[0].id;
    if (themeId === 'custom') return getInitialSetting('customThemeSettings', THEMES[THEMES.length - 1]);
    return THEMES.find(t => t.id === themeId) || THEMES[0];
  });
  
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [autoMinimize, setAutoMinimize] = useState(() => getInitialSetting('autoMinimize', true));
  const [reminderInterval, setReminderInterval] = useState(() => getInitialSetting('reminderInterval', 60));
  const [timerDuration, setTimerDuration] = useState(() => getInitialSetting('timerDuration', 25 * 60));
  const [isMaximized, setIsMaximized] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [archiveData, setArchiveData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const reminderToneRef = useRef(0);
  const [formData, setFormData] = useState({ activity: '', output: '', utility: 5, friction: '', uncertainty: 'decreased', hypothesisValid: true, hypothesisNote: '', nextStep: '', pivot: false, quickWin: '', bet: '' });

  const [isEnforced, setIsEnforced] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);
  const reminderRef = useRef(null);

  useEffect(() => { localStorage.setItem('themeId', currentTheme.id); }, [currentTheme]);
  useEffect(() => { localStorage.setItem('autoMinimize', JSON.stringify(autoMinimize)); }, [autoMinimize]);
  useEffect(() => { localStorage.setItem('reminderInterval', JSON.stringify(reminderInterval)); }, [reminderInterval]);
  useEffect(() => { localStorage.setItem('timerDuration', JSON.stringify(timerDuration)); }, [timerDuration]);
  useEffect(() => { localStorage.setItem('customThemeSettings', JSON.stringify(customThemeSettings)); }, [customThemeSettings]);

  useEffect(() => {
    const themeToApply = currentTheme.id === 'custom' ? customThemeSettings : currentTheme;
    const root = document.documentElement;
    root.style.setProperty('--bg-color', themeToApply.bg);
    root.style.setProperty('--accent-color', themeToApply.accent);
    root.style.setProperty('--accent-contrast', themeToApply.contrast);
    root.style.setProperty('--card-bg', themeToApply.card);
    root.style.setProperty('--input-bg', themeToApply.input);
    root.style.setProperty('--input-text', themeToApply.inputText || themeToApply.text);
    root.style.setProperty('--text-main', themeToApply.text);
    root.style.setProperty('--text-data', themeToApply.dataText || themeToApply.text);
    root.style.setProperty('--text-dim', themeToApply.dim || 'rgba(255,255,255,0.4)');
  }, [currentTheme, customThemeSettings]);

  useEffect(() => {
    if (window.electron) {
        window.electron.onMaximized((state) => setIsMaximized(state));
        window.electron.onEnforce(() => {
            setIsEnforced(true);
            setIsActive(false);
        });
    }
  }, []);

  const loadArchives = async () => {
    if (window.electron) {
        const logs = await window.electron.getLogs();
        setArchiveData(logs);
        setShowArchives(true);
    }
  };

  const deleteLog = async (date, id) => {
    if (!confirm("Are you sure you want to delete this session log?")) return;
    const newData = { ...archiveData };
    newData[date] = newData[date].filter(log => log.id !== id);
    if (newData[date].length === 0) delete newData[date];
    if (window.electron) {
        await window.electron.updateLogs(newData);
        setArchiveData(newData);
    }
  };

  const startEditing = (log) => {
    setEditingId(log.id);
    setEditFields(log);
  };

  const saveEdit = async (date) => {
    const newData = { ...archiveData };
    newData[date] = newData[date].map(log => log.id === editingId ? editFields : log);
    if (window.electron) {
        await window.electron.updateLogs(newData);
        setArchiveData(newData);
        setEditingId(null);
    }
  };

  useEffect(() => {
    if (isActive && autoMinimize && window.electron && !isEnforced) {
        window.electron.minimizeApp();
    }
  }, [isActive, autoMinimize, isEnforced]);

  useEffect(() => {
    if (!isActive && !isEnforced && reminderInterval > 0) {
      reminderRef.current = setInterval(() => playReminder(), reminderInterval * 1000);
    } else {
      clearInterval(reminderRef.current);
    }
    return () => clearInterval(reminderRef.current);
  }, [isActive, isEnforced, reminderInterval]);

  const playReminder = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      const tones = [{ freq: 330, type: 'triangle' }, { freq: 440, type: 'sine' }, { freq: 554, type: 'square' }, { freq: 659, type: 'triangle' }];
      const currentTone = tones[reminderToneRef.current % tones.length];
      oscillator.type = currentTone.type;
      oscillator.frequency.setValueAtTime(currentTone.freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.4);
      reminderToneRef.current += 1;
    } catch (e) { console.warn(e); }
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
    } catch (e) { console.warn(e); }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsEnforced(true);
      playAlarm();
      if (window.electron) window.electron.triggerEnforce();
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const adjustTimer = (amount) => {
    const newDuration = Math.max(60, timerDuration + amount);
    setTimerDuration(newDuration);
    if (!isActive) setTimeLeft(newDuration);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(timerDuration);
  };

  const forceFinish = () => {
    setIsActive(false);
    setIsEnforced(true);
    if (window.electron) window.electron.triggerEnforce();
  };

  const isValid = () => formData.activity && formData.output && formData.friction && formData.nextStep && formData.quickWin;

  const handleSubmit = () => {
    if (!isValid()) return;
    if (window.electron) {
        window.electron.saveLog(formData);
        setIsEnforced(false);
        const resetFields = { activity: '', output: '', utility: 5, friction: '', uncertainty: 'decreased', hypothesisValid: true, hypothesisNote: '', nextStep: '', pivot: false, quickWin: '' };
        if (!formData.pivot) {
            setFormData(prev => ({ ...prev, ...resetFields }));
            setTimeLeft(timerDuration);
            setIsActive(true);
        } else {
            setFormData({ ...resetFields, bet: '' });
            setTimeLeft(timerDuration);
            setIsActive(false); 
        }
    } else {
        setIsEnforced(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard Node.");
  };

  const Header = () => (
    <div className="fixed top-0 left-0 w-full h-10 flex items-center justify-between px-4 z-[100] drag">
        <div className="flex items-center gap-4 no-drag">
            <button onClick={loadArchives} className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-40 hover:opacity-100 flex items-center gap-2">
                <Archive size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Archives</span>
            </button>
            <div className="flex items-center gap-2 opacity-40 text-[10px] font-bold uppercase tracking-widest">
                <Clock size={12} className="accent-text" />
                Time Master
            </div>
        </div>
        <div className="flex items-center gap-1 no-drag">
            <button onClick={() => window.electron?.minimizeApp()} className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-40 hover:opacity-100">
                <Minus size={14} />
            </button>
            <button onClick={() => window.electron?.maximizeApp()} className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-40 hover:opacity-100">
                {isMaximized ? <Copy size={14} className="rotate-180" /> : <Square size={12} />}
            </button>
            <button onClick={() => window.electron?.closeApp()} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors opacity-40 hover:opacity-100">
                <X size={14} />
            </button>
        </div>
    </div>
  );

  const rgbaToHexAndAlpha = (rgba) => {
    if (!rgba || !rgba.startsWith('rgba')) return { hex: '#ffffff', alpha: 0.05 };
    const parts = rgba.replace('rgba(', '').replace(')', '').split(', ');
    const r = parseInt(parts[0]);
    const g = parseInt(parts[1]);
    const b = parseInt(parts[2]);
    const a = parseFloat(parts[3]);
    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return { hex, alpha: a };
  };

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const CustomThemeModal = () => {
    const cardVisuals = rgbaToHexAndAlpha(customThemeSettings.card);
    const inputVisuals = rgbaToHexAndAlpha(customThemeSettings.input);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <div className="glass-card max-w-2xl w-full p-8 space-y-8 border-2 accent-border overflow-y-auto max-h-[90vh] shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <Settings2 size={24} className="accent-text" /> Theme Architect
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => {
                            setCustomThemeSettings(THEMES[THEMES.length - 1]);
                            alert("Theme reset to laboratory defaults.");
                        }} className="p-2 hover:bg-white/10 rounded-full text-white/40" title="Reset to Defaults"><RefreshCcw size={18}/></button>
                        <button onClick={() => setShowCustomModal(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2">Surface Layers</h3>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase opacity-40">Main Background</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={customThemeSettings.bg} onChange={(e) => setCustomThemeSettings({...customThemeSettings, bg: e.target.value})} className="w-10 h-10 bg-transparent cursor-pointer" />
                                <span className="font-mono text-xs uppercase">{customThemeSettings.bg}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase opacity-40 flex items-center gap-2"><Box size={12} /> Cards Color & Alpha</label>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <input type="color" value={cardVisuals.hex} onChange={(e) => { setCustomThemeSettings({...customThemeSettings, card: hexToRgba(e.target.value, cardVisuals.alpha)}); }} className="w-10 h-10 bg-transparent cursor-pointer" />
                                    <input type="range" min="0" max="1" step="0.01" value={cardVisuals.alpha} onChange={(e) => { setCustomThemeSettings({...customThemeSettings, card: hexToRgba(cardVisuals.hex, e.target.value)}); }} className="flex-1 accent-white" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase opacity-40 flex items-center gap-2"><Terminal size={12} /> Inputs Color & Alpha</label>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <input type="color" value={inputVisuals.hex} onChange={(e) => { setCustomThemeSettings({...customThemeSettings, input: hexToRgba(e.target.value, inputVisuals.alpha)}); }} className="w-10 h-10 bg-transparent cursor-pointer" />
                                    <input type="range" min="0" max="1" step="0.01" value={inputVisuals.alpha} onChange={(e) => { setCustomThemeSettings({...customThemeSettings, input: hexToRgba(inputVisuals.hex, e.target.value)}); }} className="flex-1 accent-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black tracking-widest opacity-30 uppercase border-b border-white/5 pb-2">Typography & Content</h3>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase opacity-40">System UI Text (Labels)</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={customThemeSettings.text} onChange={(e) => setCustomThemeSettings({...customThemeSettings, text: e.target.value})} className="w-10 h-10 bg-transparent cursor-pointer" />
                                <span className="font-mono text-xs uppercase">{customThemeSettings.text}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase opacity-40 flex items-center gap-2"><PenTool size={12} /> Active Input Text Color</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={customThemeSettings.inputText || customThemeSettings.text} onChange={(e) => setCustomThemeSettings({...customThemeSettings, inputText: e.target.value})} className="w-10 h-10 bg-transparent cursor-pointer" />
                                <span className="font-mono text-xs uppercase">{customThemeSettings.inputText || customThemeSettings.text}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase opacity-40 flex items-center gap-2"><Database size={12} /> Archived Log Data Color</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={customThemeSettings.dataText || customThemeSettings.text} onChange={(e) => setCustomThemeSettings({...customThemeSettings, dataText: e.target.value})} className="w-10 h-10 bg-transparent cursor-pointer" />
                                <span className="font-mono text-xs uppercase">{customThemeSettings.dataText || customThemeSettings.text}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase opacity-40">Accent & Action Color</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={customThemeSettings.accent} onChange={(e) => setCustomThemeSettings({...customThemeSettings, accent: e.target.value})} className="w-10 h-10 bg-transparent cursor-pointer" />
                                <span className="font-mono text-xs uppercase">{customThemeSettings.accent}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={() => setShowCustomModal(false)} className="w-full py-4 accent-bg accent-contrast-text rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Finalize Interface</button>
            </div>
        </div>
    );
  };

  if (showArchives) {
    const logsForDate = archiveData[selectedDate] || [];
    return (
        <div className="min-h-screen p-8 overflow-y-auto pt-14 bg-[#0a0a0a]">
            <Header />
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex items-center justify-between">
                    <button onClick={() => setShowArchives(false)} className="flex items-center gap-2 text-sm font-bold opacity-40 hover:opacity-100 transition-all accent-text">
                        <ArrowRight className="rotate-180" size={16} /> BACK TO NODE
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                            <Calendar size={16} className="accent-text" />
                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-sm font-mono focus:outline-none"/>
                        </div>
                        <button onClick={() => copyToClipboard(JSON.stringify(logsForDate, null, 2))} className="px-4 py-2 bg-white text-black text-xs font-black rounded-xl hover:bg-[#8B5CF6] hover:text-white transition-all flex items-center gap-2">
                            <ClipboardCheck size={16} /> COPY JSON
                        </button>
                    </div>
                </header>
                <div className="space-y-4">
                    <h2 className="text-xl font-bold uppercase tracking-tighter opacity-60 flex items-center gap-2"><Terminal size={20} className="accent-text" /> Logs for {selectedDate} ({logsForDate.length} sessions)</h2>
                    {logsForDate.length === 0 ? <div className="glass-card p-20 text-center opacity-20 italic">No historical data found for this temporal node.</div> : 
                        logsForDate.map((log) => (
                            <div key={log.id} className="glass-card p-6 space-y-4 border-l-4 accent-border relative group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-mono opacity-20">{log.timestamp}</span>
                                    <div className="flex items-center gap-2">
                                        {editingId === log.id ? (
                                            <><button onClick={() => saveEdit(selectedDate)} className="p-1.5 bg-green-500/20 text-green-400 rounded-md"><Save size={14} /></button><button onClick={() => setEditingId(null)} className="p-1.5 bg-white/5 text-white/40 rounded-md"><X size={14} /></button></>
                                        ) : (
                                            <><button onClick={() => startEditing(log)} className="p-1.5 bg-white/5 text-white/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 size={14} /></button><button onClick={() => deleteLog(selectedDate, log.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button></>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold accent-text uppercase opacity-40 block mb-1">Bet / Hypothesis</label>
                                        {editingId === log.id ? <textarea value={editFields.bet} onChange={(e) => setEditFields({...editFields, bet: e.target.value})} className="input-field h-20 text-sm"/> : <p className="italic text-lg font-light data-text">"{log.bet}"</p>}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold accent-text uppercase opacity-40 block mb-1">Activity</label>
                                        {editingId === log.id ? <input value={editFields.activity} onChange={(e) => setEditFields({...editFields, activity: e.target.value})} className="input-field py-2"/> : <p className="text-sm data-text">{log.activity}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold accent-text uppercase opacity-40 block mb-1">Output</label>
                                        {editingId === log.id ? <input value={editFields.output} onChange={(e) => setEditFields({...editFields, output: e.target.value})} className="input-field py-2"/> : <p className="text-sm font-mono data-text">{log.output}</p>}
                                    </div>
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
            <div className="max-w-2xl mx-auto w-full space-y-8 py-4">
                <div className="glass-card p-10 flex flex-col items-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 accent-bg opacity-30"></div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => adjustTimer(-300)} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"><Minus size={24} /></button>
                        <div className="text-7xl font-mono font-light tracking-tighter">{formatTime(timeLeft)}</div>
                        <button onClick={() => adjustTimer(300)} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"><Plus size={24} /></button>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setIsActive(!isActive)} className={`px-10 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${isActive ? 'bg-amber-500/20 border border-amber-500/50 text-amber-500 hover:bg-amber-500/30' : 'accent-bg accent-contrast-text shadow-[0_0_30px_rgba(0,0,0,0.2)]'}`}>
                            {isActive ? <><Pause fill="currentColor" size={20} /> PAUSE</> : <><Play fill="currentColor" size={20} /> START FOCUS</>}
                        </button>
                        <button onClick={forceFinish} className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Finish</button>
                        <button onClick={resetTimer} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"><RotateCcw size={20} /></button>
                    </div>
                </div>

                <div className="glass-card p-8 space-y-6">
                    <div className="flex items-center gap-3"><Target className="accent-text" size={24} /><h2 className="text-xl font-bold tracking-tight">The Hour's Bet</h2></div>
                    <textarea name="bet" value={formData.bet} onChange={handleChange} placeholder="I bet I can [Result] if I [Action] because [Reason]..." className="input-field h-32 resize-none"/>
                </div>

                <div className="glass-card p-6 space-y-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3"><Layout className="accent-text" size={20} /><h2 className="text-sm font-bold uppercase tracking-wider opacity-60">System Behavior</h2></div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => window.electron?.openLogsFolder()} className="px-4 py-2 rounded-lg text-[10px] font-black transition-all border border-white/10 hover:bg-white/5 opacity-60 hover:opacity-100 flex items-center gap-2"><X size={12} className="rotate-45" /> OPEN DATA FOLDER</button>
                                <button onClick={() => setAutoMinimize(!autoMinimize)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${autoMinimize ? 'accent-bg accent-border accent-contrast-text' : 'border-white/10 opacity-40'}`}>{autoMinimize ? 'AUTO-MINIMIZE: ON' : 'AUTO-MINIMIZE: OFF'}</button>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3"><Bell className="accent-text" size={20} /><div className="flex flex-col"><h2 className="text-sm font-bold uppercase tracking-wider opacity-60 text-left">Idle Reminder</h2><p className="text-[10px] opacity-30 uppercase tracking-widest font-mono">Ping every {reminderInterval}s when inactive</p></div></div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setReminderInterval(Math.max(0, reminderInterval - 10))} className="p-1 hover:bg-white/5 rounded border border-white/10"><Minus size={12} /></button>
                                <span className="font-mono text-sm w-12 text-center">{reminderInterval}s</span>
                                <button onClick={() => setReminderInterval(reminderInterval + 10)} className="p-1 hover:bg-white/5 rounded border border-white/10"><Plus size={12} /></button>
                                <button onClick={() => playReminder()} className="ml-2 p-1.5 hover:bg-white/10 rounded-full transition-colors opacity-40 hover:opacity-100"><Volume2 size={14} /> </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3"><Palette className="accent-text" size={20} /><h2 className="text-sm font-bold uppercase tracking-wider opacity-60">Visual Interface</h2></div>
                        <div className="flex flex-wrap gap-2">
                            {THEMES.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => {
                                        setCurrentTheme(theme);
                                        if (theme.id === 'custom') setShowCustomModal(true);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${currentTheme.id === theme.id ? 'accent-border accent-bg accent-contrast-text' : 'border-white/5 hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                                >
                                    {theme.name}
                                    {theme.id === 'custom' && <Settings2 size={10} className="inline ml-1 opacity-50" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center opacity-20 text-xs gap-8">
                    <span className="flex items-center gap-1 font-mono uppercase tracking-widest"><CheckCircle size={12} /> Scientific Betting Active</span>
                    <span className="flex items-center gap-1 font-mono uppercase tracking-widest"><Zap size={12} /> Enforcer Monitoring</span>
                </div>
            </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen p-8 overflow-y-auto relative pt-14">
      <Header />
      <div className="max-w-4xl mx-auto space-y-8 pb-24">
        <header className="flex items-center justify-between mb-8">
            <div><h1 className="text-2xl font-bold accent-text flex items-center gap-2 uppercase tracking-tight"><Terminal size={24} /> Reflection Node</h1><p className="opacity-40 text-sm mt-1">Audit your bet results to regain control.</p></div>
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1 animate-pulse font-bold"><AlertCircle size={12} /> ENFORCER LOCK ACTIVE</div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 md:col-span-2 border-l-4 accent-border bg-white/5"><label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider opacity-60">Your Pre-Commitment</label><p className="italic text-lg opacity-90 data-text">"{formData.bet || "No bet recorded."}"</p></div>
            <div className="glass-card p-6 md:col-span-2"><label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider opacity-60">1. Actual Activity</label><textarea name="activity" value={formData.activity} onChange={handleChange} placeholder="Audit your time..." className="input-field h-24 resize-none"/></div>
            <div className="glass-card p-6"><label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider opacity-60">2. Tangible Output</label><textarea name="output" value={formData.output} onChange={handleChange} placeholder="Proof of work..." className="input-field h-24 resize-none"/></div>
            <div className="glass-card p-6 border-2 accent-border">
                 <label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider opacity-60">3. Scientific Result</label>
                 <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => setFormData({...formData, hypothesisValid: true})} className={`flex-1 py-3 rounded-xl border text-sm font-black transition-all ${formData.hypothesisValid === true ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-transparent border-white/10 opacity-30'}`}>BET WON</button>
                    <button onClick={() => setFormData({...formData, hypothesisValid: false})} className={`flex-1 py-3 rounded-xl border text-sm font-black transition-all ${formData.hypothesisValid === false ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-transparent border-white/10 opacity-30'}`}>BET LOST</button>
                 </div>
                 <input type="text" name="hypothesisNote" value={formData.hypothesisNote} onChange={handleChange} placeholder="Corrective insight..." className="input-field"/>
            </div>
            <div className="glass-card p-6"><label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider opacity-60">4. Friction Analysis</label><textarea name="friction" value={formData.friction} onChange={handleChange} placeholder="Identify the bottleneck..." className="input-field h-24 resize-none"/></div>
             <div className="glass-card p-6 flex flex-col justify-center space-y-4">
                 <label className="block text-xs font-bold accent-text uppercase tracking-wider opacity-60">5. Protocol Decision</label>
                 <div className="flex items-center gap-3">
                    <button onClick={() => setFormData({...formData, pivot: false})} className={`flex-1 py-4 rounded-xl border transition-all font-bold ${!formData.pivot ? 'bg-white/10 border-white/40 opacity-100' : 'border-white/5 opacity-30'}`}>CONTINUE</button>
                    <button onClick={() => setFormData({...formData, pivot: true})} className={`flex-1 py-4 rounded-xl border transition-all font-bold ${formData.pivot ? 'accent-bg accent-border accent-contrast-text' : 'border-white/5 opacity-30'}`}>PIVOT</button>
                 </div>
            </div>
            <div className="glass-card p-6 md:col-span-2"><label className="block text-xs font-bold accent-text mb-2 uppercase tracking-wider opacity-60">6. Next Critical Step</label><div className="flex items-center gap-3"><ArrowRight size={20} className="accent-text" /><input type="text" name="nextStep" value={formData.nextStep} onChange={handleChange} placeholder="Precision target for next hour..." className="input-field py-4 text-base"/></div></div>
            <div className="glass-card p-6 md:col-span-2 bg-yellow-400/5 border-yellow-400/20"><label className="block text-xs font-bold text-yellow-500 mb-2 uppercase tracking-wider opacity-60">7. Velocity Boost (2 Min)</label><div className="flex items-center gap-3"><Zap size={20} className="text-yellow-400" /><input type="text" name="quickWin" value={formData.quickWin} onChange={handleChange} placeholder="Instant win to clear the deck..." className="input-field py-4 border-yellow-400/10 focus:border-yellow-400/50"/></div></div>
        </div>
        <div className="fixed bottom-0 left-0 w-full p-6 bg-transparent backdrop-blur-3xl border-t border-white/5 flex justify-center z-50">
            <button onClick={handleSubmit} disabled={!isValid()} className={`px-12 py-4 rounded-2xl font-black tracking-widest transition-all flex items-center gap-3 ${isValid() ? 'accent-bg accent-contrast-text shadow-[0_0_40px_rgba(0,0,0,0.4)] scale-105 active:scale-95' : 'bg-white/5 opacity-20 cursor-not-allowed'}`}><CheckCircle size={20} /> AUTHORIZE UNLOCK</button>
        </div>
      </div>
    </div>
  );
}

export default App;
