import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Radio, 
  Wind,
  Sparkles,
  Zap,
  Sliders,
  Music
} from 'lucide-react';
import { 
  shrutiAudio, 
  NOTE_NAMES, 
  INDIAN_KEY_NAMES, 
  SoundEngineSettings 
} from '../audio/shrutiEngine';

export const FM1Hardware: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [settings, setSettings] = useState<SoundEngineSettings>(shrutiAudio.settings);
  const [activeStringIndex, setActiveStringIndex] = useState<number>(-1);
  const [activeMenuPage, setActiveMenuPage] = useState<'HOME' | 'EDIT' | 'ENV' | 'LFO' | 'FX' | 'GLO'>('HOME');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPumping, setIsPumping] = useState<boolean>(false);
  const [activeKeyIndex, setActiveKeyIndex] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const ensureAudioStarted = async () => {
    if (!hasStarted) {
      await shrutiAudio.init();
      setHasStarted(true);
    }
  };

  // Keyboard shortcut listener: Spacebar to pump bellows or trigger pluck
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setIsPumping(true);
        shrutiAudio.startPump();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPumping(false);
        shrutiAudio.stopPump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Hook string pluck callback
  useEffect(() => {
    shrutiAudio.setStringPluckListener((idx) => {
      setActiveStringIndex(idx);
    });
  }, []);

  const updateSettings = (partial: Partial<SoundEngineSettings>) => {
    ensureAudioStarted();
    const updated = { ...settings, ...partial };
    setSettings(updated);
    Object.assign(shrutiAudio.settings, partial);

    if ('boxWarmth' in partial) {
      shrutiAudio.updateTone();
    }
    if ('masterVolume' in partial || 'muted' in partial || 'tanpuraVolume' in partial || 'shrutiVolume' in partial || 'tanpuraEnabled' in partial || 'shrutiEnabled' in partial) {
      shrutiAudio.updateVolume();
    }
    if ('rootKey' in partial || 'octave' in partial || 'tuningMode' in partial || 'fineDetuneCents' in partial || 'reedDetuneSpread' in partial) {
      shrutiAudio.syncReeds();
    }
  };

  // Turn Knob 1: Dayan Key
  const handleKnob1 = (delta: 1 | -1) => {
    ensureAudioStarted();
    const cur = NOTE_NAMES.indexOf(settings.rootKey as typeof NOTE_NAMES[number]);
    const next = (cur + delta + 12) % 12;
    updateSettings({ rootKey: NOTE_NAMES[next] });
  };

  // Turn Knob 2: Pluck BPM
  const handleKnob2 = (delta: number) => {
    ensureAudioStarted();
    const newBpm = Math.max(20, Math.min(90, settings.pluckSpeedBpm + delta));
    updateSettings({ pluckSpeedBpm: newBpm });
  };

  // Turn Knob 3: Javari Buzz
  const handleKnob3 = (delta: number) => {
    ensureAudioStarted();
    const newBuzz = Math.max(0.1, Math.min(1.0, settings.javariBuzzAmount + delta));
    updateSettings({ javariBuzzAmount: Math.round(newBuzz * 100) / 100 });
  };

  // Turn Knob 4: Tanpura/Shruti Mix
  const handleKnob4 = (delta: number) => {
    ensureAudioStarted();
    const newT = Math.max(0, Math.min(1.0, settings.tanpuraVolume + delta));
    updateSettings({ tanpuraVolume: newT, shrutiVolume: 1 - newT * 0.4 });
  };

  // Select encoder turns: cycle Tanpura Patterns
  const patterns: Array<SoundEngineSettings['tanpuraPattern']> = ['Pa-Sa-Sa-Sa', 'Ma-Sa-Sa-Sa', 'Ni-Sa-Sa-Sa', '5-String'];
  const handleSelectTurn = (delta: 1 | -1) => {
    ensureAudioStarted();
    const cur = patterns.indexOf(settings.tanpuraPattern);
    const next = (cur + delta + patterns.length) % patterns.length;
    updateSettings({ tanpuraPattern: patterns[next] });
  };

  // Toggle Sequencer Play/Stop
  const handlePlayToggle = () => {
    ensureAudioStarted();
    const next = !settings.tanpuraEnabled;
    setIsPlaying(next);
    updateSettings({ tanpuraEnabled: next });
  };

  // Octave adjustments
  const handleOctave = (dir: 1 | -1) => {
    ensureAudioStarted();
    const nextOct = Math.max(2, Math.min(4, settings.octave + dir));
    updateSettings({ octave: nextOct });
  };

  // 27 Silicone Keys representation (spanning C2 to D4, 27 notes)
  // Standard piano keys with frequencies for the 27-key silicone keyboard
  const keys27 = [
    { note: 'C', isBlack: false, semitone: 0 },
    { note: 'C#', isBlack: true, semitone: 1 },
    { note: 'D', isBlack: false, semitone: 2 },
    { note: 'D#', isBlack: true, semitone: 3 },
    { note: 'E', isBlack: false, semitone: 4 },
    { note: 'F', isBlack: false, semitone: 5 },
    { note: 'F#', isBlack: true, semitone: 6 },
    { note: 'G', isBlack: false, semitone: 7 },
    { note: 'G#', isBlack: true, semitone: 8 },
    { note: 'A', isBlack: false, semitone: 9 },
    { note: 'A#', isBlack: true, semitone: 10 },
    { note: 'B', isBlack: false, semitone: 11 },
    { note: 'C', isBlack: false, semitone: 12 },
    { note: 'C#', isBlack: true, semitone: 13 },
    { note: 'D', isBlack: false, semitone: 14 },
    { note: 'D#', isBlack: true, semitone: 15 },
    { note: 'E', isBlack: false, semitone: 16 },
    { note: 'F', isBlack: false, semitone: 17 },
    { note: 'F#', isBlack: true, semitone: 18 },
    { note: 'G', isBlack: false, semitone: 19 },
    { note: 'G#', isBlack: true, semitone: 20 },
    { note: 'A', isBlack: false, semitone: 21 },
    { note: 'A#', isBlack: true, semitone: 22 },
    { note: 'B', isBlack: false, semitone: 23 },
    { note: 'C', isBlack: false, semitone: 24 },
    { note: 'C#', isBlack: true, semitone: 25 },
    { note: 'D', isBlack: false, semitone: 26 },
  ];

  // Press a key on the silicone keyboard: sets the Dayan key immediately
  const handleKeyTouch = (noteName: string, idx: number) => {
    ensureAudioStarted();
    setActiveKeyIndex(idx);
    updateSettings({ rootKey: noteName });
    setTimeout(() => setActiveKeyIndex(null), 300);
  };

  // Render FM-1 1.54" TFT Color Display (240x240 pixel canvas)
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const pressure = shrutiAudio.getCurrentPressure();
      const dayanHz = shrutiAudio.getDayanFrequency();
      const strings = shrutiAudio.getTanpuraStrings();

      // Screen background: Dark navy/grey TFT display with backlight glow
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle LCD pixel raster grid
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillRect(0, y, canvas.width, 1);
      }

      // Top Status Bar (M-VAVE firmware header style)
      ctx.fillStyle = '#111d33';
      ctx.fillRect(0, 0, canvas.width, 24);

      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#4cc9f0';
      ctx.fillText('FM-1', 6, 16);

      ctx.fillStyle = '#ffb703';
      const engTag = settings.synthesisEngine === 'HYBRID' ? 'HYBR' : settings.synthesisEngine === 'SAMPLES_PCM' ? 'PCM' : 'MATH';
      ctx.fillText(`[${engTag}]`, 42, 16);

      ctx.fillStyle = '#a0aec0';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`${settings.tuningStandard}Hz`, 90, 16);

      // BT / Status Icon
      ctx.fillStyle = settings.muted ? '#ef4444' : (settings.tanpuraEnabled ? '#10b981' : '#64748b');
      ctx.fillRect(205, 7, 28, 11);
      ctx.fillStyle = '#060a12';
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.fillText(settings.muted ? 'MUTE' : (settings.tanpuraEnabled ? 'PLAY' : 'IDLE'), 208, 16);

      // Main Display Area: Depending on active Menu Page
      if (activeMenuPage === 'HOME') {
        // --- HOME SCREEN: Dayan Pitch + Oscilloscope + 4 Strings ---
        
        // Large Dayan Pitch
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 26px "JetBrains Mono", monospace';
        ctx.fillText(`${settings.rootKey}${settings.octave}`, 10, 56);

        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`${dayanHz.toFixed(1)} Hz`, 90, 48);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        const centsText = settings.fineDetuneCents > 0 ? `+${settings.fineDetuneCents}¢` : `${settings.fineDetuneCents}¢`;
        ctx.fillText(`Dayan (${centsText})`, 90, 62);

        // Indian Note Name Banner
        ctx.fillStyle = 'rgba(255, 183, 3, 0.15)';
        ctx.fillRect(10, 68, canvas.width - 20, 16);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        const indName = INDIAN_KEY_NAMES[settings.rootKey] || '';
        ctx.fillText(indName.slice(0, 32), 16, 80);

        // 4 Tanpura Strings Visualizer Row
        const boxW = Math.floor((canvas.width - 24) / strings.length);
        for (let i = 0; i < strings.length; i++) {
          const s = strings[i];
          const isStruck = activeStringIndex === i;
          const sx = 12 + i * boxW;
          const sy = 90;

          ctx.fillStyle = isStruck ? '#fbbf24' : '#1e293b';
          ctx.fillRect(sx, sy, boxW - 3, 26);
          ctx.strokeStyle = isStruck ? '#fef08a' : '#334155';
          ctx.strokeRect(sx, sy, boxW - 3, 26);

          ctx.fillStyle = isStruck ? '#0f172a' : '#e2e8f0';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillText(s.name.split(' ')[0], sx + 4, sy + 15);

          ctx.fillStyle = isStruck ? '#334155' : '#64748b';
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillText(`${s.ratio}x`, sx + 4, sy + 23);
        }

        // Real-Time Audio Oscilloscope
        const analyser = shrutiAudio.getAnalyser();
        if (analyser && hasStarted && !settings.muted) {
          const bufLen = analyser.frequencyBinCount;
          const timeData = new Uint8Array(bufLen);
          analyser.getByteTimeDomainData(timeData);

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const sliceW = (canvas.width - 24) / bufLen;
          let px = 12;
          for (let i = 0; i < bufLen; i++) {
            const v = timeData[i] / 128.0;
            const py = 145 + (v - 1.0) * 18;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
            px += sliceW;
          }
          ctx.stroke();
        } else {
          ctx.strokeStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(12, 145);
          ctx.lineTo(canvas.width - 12, 145);
          ctx.stroke();
        }

        // Bellows Air Gauge & String Pattern
        ctx.fillStyle = '#64748b';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`AIR:`, 12, 178);

        ctx.strokeStyle = '#334155';
        ctx.strokeRect(40, 170, 70, 10);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(41, 171, Math.max(2, Math.floor(68 * pressure)), 8);

        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`PAT: ${settings.tanpuraPattern}`, 125, 178);

      } else if (activeMenuPage === 'EDIT') {
        // Fine Tune Cents Page
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText('DAYAN FINE TUNING', 14, 52);

        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`Exact Dayan: ${dayanHz.toFixed(2)} Hz`, 14, 76);
        ctx.fillText(`Cents Offset: ${settings.fineDetuneCents > 0 ? `+${settings.fineDetuneCents}` : settings.fineDetuneCents}¢`, 14, 98);

        ctx.strokeStyle = '#475569';
        ctx.strokeRect(14, 115, 212, 14);
        const centerPos = 14 + 106;
        const offsetPx = (settings.fineDetuneCents / 40) * 100;
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(Math.min(centerPos, centerPos + offsetPx), 116, Math.max(4, Math.abs(offsetPx)), 12);
        
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Use Knob 1 to step Tonic, Knob 3 for Cents', 14, 155);

      } else if (activeMenuPage === 'ENV') {
        // Bellows Air Dynamics Page
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText('BELLOWS (AIR) ENGINE', 14, 52);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText(`Mode: ${settings.bellowsMode.toUpperCase()}`, 14, 80);
        ctx.fillText(`Pressure: ${Math.round(pressure * 100)}%`, 14, 102);
        ctx.fillText(`Swell Depth: ${Math.round(settings.autoBellowsDepth * 100)}%`, 14, 124);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('Press & Hold [REC/PUMP] to pump air manually!', 14, 155);

      } else if (activeMenuPage === 'LFO') {
        // Javari Bridge Bloom Page
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText('JAVARI (JIWA) SHIMMER', 14, 52);

        ctx.fillStyle = '#fbbf24';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText(`Buzz Intensity: ${Math.round(settings.javariBuzzAmount * 100)}%`, 14, 80);
        ctx.fillText(`String Sustain: ${settings.stringSustain} sec`, 14, 102);
        ctx.fillText(`Pluck Tempo: ${settings.pluckSpeedBpm} BPM`, 14, 124);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Cotton thread contact on curved bridge', 14, 155);

      } else if (activeMenuPage === 'FX') {
        // Wood cavity filter
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText('TEAKWOOD CAVITY FILTER', 14, 52);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText(`Box Warmth: ${Math.round(settings.boxWarmth)} Hz`, 14, 80);
        ctx.fillText(`Reed Beating: ${settings.reedDetuneSpread}¢`, 14, 102);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Simulates acoustic body of Shruti box', 14, 155);

      } else if (activeMenuPage === 'GLO') {
        // Global / Tuning Mode
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText('GLOBAL CONFIG', 14, 52);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText(`Tuning: ${settings.tuningMode.toUpperCase()} (Pure Swaras)`, 14, 80);
        ctx.fillText(`Pitch Standard: ${settings.tuningStandard} Hz`, 14, 102);
        ctx.fillText(`Octave: ${settings.octave}`, 14, 124);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Authentic 3:2 Pancham and 4:3 Madhyam', 14, 155);
      }

      // --- BOTTOM 4 PARAMETER LABELS (Directly aligned above the 4 Knobs) ---
      ctx.fillStyle = '#090f1d';
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 30);
      ctx.lineTo(canvas.width, canvas.height - 30);
      ctx.stroke();

      const colW = canvas.width / 4;
      
      // Knob 1 Label (Key)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText('K1:KEY', 8, canvas.height - 18);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(settings.rootKey, 8, canvas.height - 6);

      // Knob 2 Label (BPM)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText('K2:TEMPO', colW + 8, canvas.height - 18);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(`${settings.pluckSpeedBpm}m`, colW + 8, canvas.height - 6);

      // Knob 3 Label (Javari)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText('K3:BUZZ', colW * 2 + 8, canvas.height - 18);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(`${Math.round(settings.javariBuzzAmount * 100)}%`, colW * 2 + 8, canvas.height - 6);

      // Knob 4 Label (Mix)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText('K4:MIX', colW * 3 + 8, canvas.height - 18);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(`${Math.round(settings.tanpuraVolume * 100)}T`, colW * 3 + 8, canvas.height - 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [settings, hasStarted, activeStringIndex, activeMenuPage]);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full select-none">
      
      {/* Power On Prompt */}
      {!hasStarted && (
        <button
          onClick={ensureAudioStarted}
          className="mb-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer animate-pulse"
        >
          <Zap className="w-4 h-4 fill-current" />
          Click to Power On FM-1 Hardware Faceplate
        </button>
      )}

      {/* M-VAVE FM-1 PHYSICAL SYNTH FACEPLATE */}
      <div className="w-full max-w-[760px] bg-[#141416] rounded-[28px] p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] border border-[#26262a] relative">
        
        {/* Chassis Mounting Screws (Hex / Torx style) */}
        <div className="absolute top-3.5 left-3.5 w-3 h-3 rounded-full bg-[#202024] border border-[#333338] flex items-center justify-center shadow-inner">
          <div className="w-1.5 h-0.5 bg-black"></div>
        </div>
        <div className="absolute top-3.5 right-3.5 w-3 h-3 rounded-full bg-[#202024] border border-[#333338] flex items-center justify-center shadow-inner">
          <div className="w-1.5 h-0.5 bg-black"></div>
        </div>
        <div className="absolute bottom-3.5 left-3.5 w-3 h-3 rounded-full bg-[#202024] border border-[#333338] flex items-center justify-center shadow-inner">
          <div className="w-1.5 h-0.5 bg-black"></div>
        </div>
        <div className="absolute bottom-3.5 right-3.5 w-3 h-3 rounded-full bg-[#202024] border border-[#333338] flex items-center justify-center shadow-inner">
          <div className="w-1.5 h-0.5 bg-black"></div>
        </div>

        {/* Top Silkscreen Branding */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#222226]">
          <div className="flex items-center gap-2">
            <span className="font-black tracking-widest text-stone-200 text-sm">M-VAVE</span>
            <span className="font-mono text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              FM-1
            </span>
            <span className="text-[10px] font-mono text-stone-400 hidden sm:inline">
              DIGITAL FM SYNTHESIZER • CUSTOM FIRMWARE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#1a1a1e] px-2 py-0.5 rounded-md border border-[#2e2e34] text-[10px] font-mono text-stone-400">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>JieLi AC791N</span>
            </div>
          </div>
        </div>

        {/* TOP SECTION: MASTER KNOB (Left), TFT DISPLAY (Center), SELECT ENCODER (Right) */}
        <div className="grid grid-cols-12 gap-4 items-center mb-5">
          
          {/* Left Column: MASTER Volume Potentiometer */}
          <div className="col-span-3 sm:col-span-2 flex flex-col items-center">
            <span className="text-[9px] font-mono font-bold tracking-wider text-stone-400 uppercase mb-1.5">
              MASTER
            </span>

            {/* Master Potentiometer Knob */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#2a2a30] via-[#1f1f24] to-[#121215] border-2 border-[#383842] shadow-xl flex items-center justify-center relative group cursor-pointer">
              <div 
                className="w-1 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform"
                style={{
                  transform: `rotate(${(settings.muted ? 0 : settings.masterVolume) * 270 - 135}deg)`,
                  transformOrigin: 'bottom center',
                }}
              />
              <button
                onClick={() => updateSettings({ muted: !settings.muted })}
                className="w-8 h-8 rounded-full bg-[#18181c] flex items-center justify-center text-stone-300 hover:text-white"
                title="Mute / Unmute"
              >
                {settings.muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>

            <div className="flex gap-1 mt-2">
              <button 
                onClick={() => updateSettings({ masterVolume: Math.max(0, settings.masterVolume - 0.1) })}
                className="w-5 h-5 rounded bg-[#222228] text-stone-300 text-[10px] font-bold font-mono hover:bg-[#2c2c34] cursor-pointer"
              >
                -
              </button>
              <button 
                onClick={() => updateSettings({ masterVolume: Math.min(1, settings.masterVolume + 0.1) })}
                className="w-5 h-5 rounded bg-[#222228] text-stone-300 text-[10px] font-bold font-mono hover:bg-[#2c2c34] cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Center Column: Authentic 1.54" Color TFT Display */}
          <div className="col-span-6 sm:col-span-8 flex justify-center">
            <div className="w-full max-w-[280px] aspect-square bg-[#03060a] p-2.5 rounded-2xl border-[3px] border-[#222228] shadow-[inset_0_3px_12px_rgba(0,0,0,0.95)] flex flex-col items-center justify-center relative overflow-hidden">
              <canvas
                ref={canvasRef}
                width={240}
                height={240}
                className="w-full h-full rounded-xl pixelated shadow-inner"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          {/* Right Column: SELECT Encoder Knob */}
          <div className="col-span-3 sm:col-span-2 flex flex-col items-center">
            <span className="text-[9px] font-mono font-bold tracking-wider text-stone-400 uppercase mb-1.5">
              SELECT
            </span>

            {/* Select Encoder */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#2a2a30] via-[#1f1f24] to-[#121215] border-2 border-[#383842] shadow-xl flex items-center justify-center relative cursor-pointer group">
              <div 
                className="w-1 h-4 bg-amber-400 rounded-full absolute top-1 shadow-sm transition-transform"
                style={{
                  transform: `rotate(${(patterns.indexOf(settings.tanpuraPattern) / patterns.length) * 360}deg)`,
                  transformOrigin: 'bottom center',
                }}
              />
              <button
                onClick={() => handleSelectTurn(1)}
                className="w-8 h-8 rounded-full bg-[#18181c] flex items-center justify-center text-amber-400 text-xs font-mono font-bold hover:bg-[#24242a]"
                title="Click: Cycle Tanpura Lead"
              >
                SEL
              </button>
            </div>

            <div className="flex gap-1 mt-2">
              <button 
                onClick={() => handleSelectTurn(-1)}
                className="w-5 h-5 rounded bg-[#222228] text-stone-300 text-[10px] font-bold font-mono hover:bg-[#2c2c34] cursor-pointer"
              >
                &lt;
              </button>
              <button 
                onClick={() => handleSelectTurn(1)}
                className="w-5 h-5 rounded bg-[#222228] text-stone-300 text-[10px] font-bold font-mono hover:bg-[#2c2c34] cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>

        </div>

        {/* 4 HORIZONTAL PARAMETER ENCODERS: Directly aligned underneath screen */}
        <div className="bg-[#19191d] rounded-2xl p-3 sm:p-4 border border-[#2b2b32] mb-5">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            
            {/* KNOB 1: DAYAN KEY (Sa) */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono font-bold text-stone-400 uppercase">
                KNOB 1
              </span>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#2e2e36] to-[#16161a] border-2 border-[#3e3e4a] shadow-lg my-1.5 flex items-center justify-center relative">
                <div 
                  className="w-1 h-3.5 bg-amber-400 rounded-full absolute top-1 transition-transform"
                  style={{
                    transform: `rotate(${(NOTE_NAMES.indexOf(settings.rootKey as typeof NOTE_NAMES[number]) / 12) * 300 - 150}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                />
                <span className="text-xs font-black font-mono text-stone-100">
                  {settings.rootKey}
                </span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleKnob1(-1)}
                  className="w-5 h-5 rounded bg-[#222228] hover:bg-[#2f2f38] text-stone-300 text-[10px] font-mono cursor-pointer"
                >
                  -
                </button>
                <button 
                  onClick={() => handleKnob1(1)}
                  className="w-5 h-5 rounded bg-[#222228] hover:bg-[#2f2f38] text-stone-300 text-[10px] font-mono cursor-pointer"
                >
                  +
                </button>
              </div>
              <span className="text-[8px] font-mono text-stone-400 mt-1">SA KEY</span>
            </div>

            {/* KNOB 2: TEMPO (BPM) */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono font-bold text-stone-400 uppercase">
                KNOB 2
              </span>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#2e2e36] to-[#16161a] border-2 border-[#3e3e4a] shadow-lg my-1.5 flex items-center justify-center relative">
                <div 
                  className="w-1 h-3.5 bg-amber-400 rounded-full absolute top-1 transition-transform"
                  style={{
                    transform: `rotate(${((settings.pluckSpeedBpm - 20) / 70) * 300 - 150}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                />
                <span className="text-[10px] font-bold font-mono text-stone-200">
                  {settings.pluckSpeedBpm}
                </span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleKnob2(-2)}
                  className="w-5 h-5 rounded bg-[#222228] hover:bg-[#2f2f38] text-stone-300 text-[10px] font-mono cursor-pointer"
                >
                  -
                </button>
                <button 
                  onClick={() => handleKnob2(2)}
                  className="w-5 h-5 rounded bg-[#222228] hover:bg-[#2f2f38] text-stone-300 text-[10px] font-mono cursor-pointer"
                >
                  +
                </button>
              </div>
              <span className="text-[8px] font-mono text-stone-400 mt-1">PLUCK BPM</span>
            </div>

            {/* KNOB 3: JAVARI BUZZ */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono font-bold text-stone-400 uppercase">
                KNOB 3
              </span>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#2e2e36] to-[#16161a] border-2 border-[#3e3e4a] shadow-lg my-1.5 flex items-center justify-center relative">
                <div 
                  className="w-1 h-3.5 bg-amber-400 rounded-full absolute top-1 transition-transform"
                  style={{
                    transform: `rotate(${(settings.javariBuzzAmount) * 300 - 150}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                />
                <span className="text-[10px] font-bold font-mono text-amber-300">
                  {Math.round(settings.javariBuzzAmount * 100)}%
                </span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleKnob3(-0.05)}
                  className="w-5 h-5 rounded bg-[#222228] hover:bg-[#2f2f38] text-stone-300 text-[10px] font-mono cursor-pointer"
                >
                  -
                </button>
                <button 
                  onClick={() => handleKnob3(0.05)}
                  className="w-5 h-5 rounded bg-[#222228] hover:bg-[#2f2f38] text-stone-300 text-[10px] font-mono cursor-pointer"
                >
                  +
                </button>
              </div>
              <span className="text-[8px] font-mono text-stone-400 mt-1">JAVARI BUZZ</span>
            </div>

            {/* KNOB 4: MIX (TANPURA / SHRUTI) */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono font-bold text-stone-400 uppercase">
                KNOB 4
              </span>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#2e2e36] to-[#16161a] border-2 border-[#3e3e4a] shadow-lg my-1.5 flex items-center justify-center relative">
                <div 
                  className="w-1 h-3.5 bg-cyan-400 rounded-full absolute top-1 transition-transform"
                  style={{
                    transform: `rotate(${(settings.tanpuraVolume) * 300 - 150}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                />
                <span className="text-[10px] font-bold font-mono text-cyan-300">
                  {Math.round(settings.tanpuraVolume * 100)}%
                </span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleKnob4(-0.05)}
                  className="w-5 h-5 rounded bg-[#222228] hover:bg-[#2f2f38] text-stone-300 text-[10px] font-mono cursor-pointer"
                >
                  -
                </button>
                <button 
                  onClick={() => handleKnob4(0.05)}
                  className="w-5 h-5 rounded bg-[#222228] hover:bg-[#2f2f38] text-stone-300 text-[10px] font-mono cursor-pointer"
                >
                  +
                </button>
              </div>
              <span className="text-[8px] font-mono text-stone-400 mt-1">TANPURA MIX</span>
            </div>

          </div>
        </div>

        {/* FUNCTION BUTTONS ROW (Silicone squircle buttons with LED backlights) */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 sm:gap-2 mb-5">
          
          {/* HOME BUTTON */}
          <button
            onClick={() => setActiveMenuPage('HOME')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
              activeMenuPage === 'HOME'
                ? 'bg-[#2b2b34] text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:text-stone-200'
            }`}
          >
            <span>HOME</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeMenuPage === 'HOME' ? 'bg-amber-400' : 'bg-stone-700'}`} />
          </button>

          {/* EDIT BUTTON */}
          <button
            onClick={() => setActiveMenuPage('EDIT')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
              activeMenuPage === 'EDIT'
                ? 'bg-[#2b2b34] text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:text-stone-200'
            }`}
          >
            <span>EDIT</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeMenuPage === 'EDIT' ? 'bg-amber-400' : 'bg-stone-700'}`} />
          </button>

          {/* ENV BUTTON (Bellows) */}
          <button
            onClick={() => setActiveMenuPage('ENV')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
              activeMenuPage === 'ENV'
                ? 'bg-[#2b2b34] text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:text-stone-200'
            }`}
          >
            <span>ENV</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeMenuPage === 'ENV' ? 'bg-cyan-400' : 'bg-stone-700'}`} />
          </button>

          {/* LFO BUTTON (Javari Shimmer) */}
          <button
            onClick={() => setActiveMenuPage('LFO')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
              activeMenuPage === 'LFO'
                ? 'bg-[#2b2b34] text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:text-stone-200'
            }`}
          >
            <span>LFO</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeMenuPage === 'LFO' ? 'bg-cyan-400' : 'bg-stone-700'}`} />
          </button>

          {/* FX BUTTON (Teakwood Tone) */}
          <button
            onClick={() => setActiveMenuPage('FX')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
              activeMenuPage === 'FX'
                ? 'bg-[#2b2b34] text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:text-stone-200'
            }`}
          >
            <span>FX</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeMenuPage === 'FX' ? 'bg-cyan-400' : 'bg-stone-700'}`} />
          </button>

          {/* GLO BUTTON (Global / Just Tuning) */}
          <button
            onClick={() => setActiveMenuPage('GLO')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
              activeMenuPage === 'GLO'
                ? 'bg-[#2b2b34] text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:text-stone-200'
            }`}
          >
            <span>GLO</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeMenuPage === 'GLO' ? 'bg-amber-400' : 'bg-stone-700'}`} />
          </button>

          {/* OCT- BUTTON */}
          <button
            onClick={() => handleOctave(-1)}
            className="py-2 px-1 rounded-xl flex flex-col items-center justify-center border border-[#28282f] bg-[#18181c] hover:bg-[#24242c] text-stone-300 font-mono text-[9px] font-bold cursor-pointer"
          >
            <span>OCT-</span>
            <span className="text-[8px] text-stone-400 mt-1">{settings.octave}</span>
          </button>

          {/* OCT+ BUTTON */}
          <button
            onClick={() => handleOctave(1)}
            className="py-2 px-1 rounded-xl flex flex-col items-center justify-center border border-[#28282f] bg-[#18181c] hover:bg-[#24242c] text-stone-300 font-mono text-[9px] font-bold cursor-pointer"
          >
            <span>OCT+</span>
            <span className="text-[8px] text-stone-400 mt-1">{settings.octave}</span>
          </button>

          {/* ARP BUTTON (Pluck String on demand) */}
          <button
            onClick={() => {
              ensureAudioStarted();
              const next = (activeStringIndex + 1) % 4;
              shrutiAudio.pluckTanpuraString(next);
            }}
            className="py-2 px-1 rounded-xl flex flex-col items-center justify-center border border-[#28282f] bg-[#18181c] hover:bg-[#24242c] text-stone-300 font-mono text-[9px] font-bold cursor-pointer"
          >
            <span>ARP</span>
            <div className="w-1.5 h-1.5 rounded-full mt-1 bg-amber-500/50" />
          </button>

          {/* SEQ BUTTON (Sequencer toggle) */}
          <button
            onClick={() => updateSettings({ tanpuraEnabled: !settings.tanpuraEnabled })}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
              settings.tanpuraEnabled
                ? 'bg-[#2b2b34] text-emerald-400 border-emerald-500/50'
                : 'bg-[#18181c] text-stone-400 border-[#28282f]'
            }`}
          >
            <span>SEQ</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${settings.tanpuraEnabled ? 'bg-emerald-400' : 'bg-stone-700'}`} />
          </button>

          {/* REC BUTTON (Bellows Pump - Hold or click) */}
          <button
            onMouseDown={() => {
              ensureAudioStarted();
              updateSettings({ bellowsMode: 'manual' });
              setIsPumping(true);
              shrutiAudio.startPump();
            }}
            onMouseUp={() => {
              setIsPumping(false);
              shrutiAudio.stopPump();
            }}
            onMouseLeave={() => {
              setIsPumping(false);
              shrutiAudio.stopPump();
            }}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
              isPumping
                ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                : 'bg-[#18181c] text-amber-400 border-[#28282f] hover:bg-[#24242c]'
            }`}
            title="Press and hold to pump air bellows"
          >
            <span>PUMP</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isPumping ? 'bg-stone-950' : 'bg-amber-500'}`} />
          </button>

          {/* PLAY/STOP BUTTON */}
          <button
            onClick={handlePlayToggle}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
              isPlaying
                ? 'bg-emerald-500 text-stone-950 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:bg-[#24242c]'
            }`}
          >
            <span>{isPlaying ? 'PLAY' : 'STOP'}</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isPlaying ? 'bg-stone-950' : 'bg-stone-700'}`} />
          </button>

        </div>

        {/* BOTTOM SECTION: 27-KEY SILICONE KEYBOARD (Authentic FM-1 2-Octave Piano Layout) */}
        <div className="bg-[#0e0e11] rounded-2xl p-3 border border-[#222228] shadow-inner">
          <div className="flex items-center justify-between mb-2 px-1 text-[10px] font-mono text-stone-400">
            <span className="font-bold text-stone-300">27-KEY SILICONE KEYBOARD</span>
            <span>Tap key to tune Dayan instantly • Illuminated LEDs</span>
          </div>

          <div className="relative h-24 sm:h-28 flex items-stretch w-full justify-between gap-1 overflow-x-auto pb-1">
            {keys27.map((k, idx) => {
              const isSelected = settings.rootKey === k.note;
              const isPushed = activeKeyIndex === idx;

              if (k.isBlack) {
                // Black Key
                return (
                  <button
                    key={idx}
                    onClick={() => handleKeyTouch(k.note, idx)}
                    className={`flex-1 min-w-[18px] sm:min-w-[22px] h-16 sm:h-18 rounded-b-md z-10 -mx-1.5 sm:-mx-2 transition-all cursor-pointer flex flex-col items-center justify-between pb-1.5 shadow-md ${
                      isPushed || (isSelected && activeStringIndex !== -1)
                        ? 'bg-amber-400 text-stone-950 shadow-[0_0_12px_rgba(251,191,36,0.8)] translate-y-0.5'
                        : isSelected
                        ? 'bg-[#2b2b32] border border-amber-500/60 text-amber-300'
                        : 'bg-[#18181c] hover:bg-[#222228] text-stone-400 border border-[#2e2e36]'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' : 'bg-stone-700'}`} />
                    <span className="text-[8px] font-mono font-bold leading-none">{k.note}</span>
                  </button>
                );
              }

              // White Key
              return (
                <button
                  key={idx}
                  onClick={() => handleKeyTouch(k.note, idx)}
                  className={`flex-1 min-w-[22px] sm:min-w-[26px] h-full rounded-b-lg border transition-all cursor-pointer flex flex-col items-center justify-between pb-2 shadow-sm ${
                    isPushed || (isSelected && activeStringIndex !== -1)
                      ? 'bg-amber-300 text-stone-950 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] translate-y-0.5'
                      : isSelected
                      ? 'bg-[#e2e8f0] text-stone-950 border-amber-500 ring-1 ring-amber-500/40'
                      : 'bg-[#cbd5e1] hover:bg-[#e2e8f0] text-stone-800 border-[#94a3b8]'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-amber-500 shadow-[0_0_6px_#fbbf24]' : 'bg-stone-400'}`} />
                  <span className="text-[9px] font-mono font-black">{k.note}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
