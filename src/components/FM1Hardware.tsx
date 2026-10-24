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
  Music,
  Sun,
  Moon,
  Info,
  Layers,
  Cpu
} from 'lucide-react';
import { 
  shrutiAudio, 
  NOTE_NAMES, 
  INDIAN_KEY_NAMES, 
  SoundEngineSettings,
  FM1_PRESETS_LIST,
  FM1_ALGORITHMS
} from '../audio/shrutiEngine';

export const FM1Hardware: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [showDspExplanation, setShowDspExplanation] = useState(false);
  const [settings, setSettings] = useState<SoundEngineSettings>(shrutiAudio.settings);
  const [activeStringIndex, setActiveStringIndex] = useState<number>(-1);
  const [activeMenuPage, setActiveMenuPage] = useState<'HOME' | 'EDIT' | 'ENV' | 'LFO' | 'FX' | 'GLO'>('HOME');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPumping, setIsPumping] = useState<boolean>(false);
  const [activeKeyIndex, setActiveKeyIndex] = useState<number | null>(null);
  
  // Theme state: defaults to the requested Clean Light look!
  const [faceplateTheme, setFaceplateTheme] = useState<'light' | 'dark'>('light');
  const isLight = faceplateTheme === 'light';

  // LED Screen theme state: light clean LCD vs dark OLED
  const [screenTheme, setScreenTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const isScreenLight = screenTheme === 'auto' ? isLight : screenTheme === 'light';

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
    shrutiAudio.setStringPluckListener((idx: number) => {
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
    if ('dronePreset' in partial && partial.dronePreset) {
      shrutiAudio.applyShrutiPreset(partial.dronePreset);
    }
    if ('rootKey' in partial || 'octave' in partial || 'fineDetuneCents' in partial || 'reedDetuneSpread' in partial) {
      shrutiAudio.syncReeds();
      shrutiAudio.syncFMDrone();
    }
    if ('pluckSpeedBpm' in partial) {
      shrutiAudio.startTanpuraSequencer();
    }
  };

  // Turn Knob 1: Root Note (Sa Key)
  const handleKnob1 = (delta: 1 | -1) => {
    ensureAudioStarted();
    const currentIdx = NOTE_NAMES.indexOf(settings.rootKey as typeof NOTE_NAMES[number]);
    const nextIdx = (currentIdx + delta + 12) % 12;
    updateSettings({ rootKey: NOTE_NAMES[nextIdx] });
  };

  // Turn Knob 2: Pluck Speed / BPM
  const handleKnob2 = (delta: number) => {
    ensureAudioStarted();
    const newBpm = Math.max(20, Math.min(90, settings.pluckSpeedBpm + delta));
    updateSettings({ pluckSpeedBpm: newBpm });
  };

  // Turn Knob 3: Javari Buzz Amount
  const handleKnob3 = (delta: number) => {
    ensureAudioStarted();
    const newBuzz = Math.max(0.1, Math.min(1.0, settings.javariBuzzAmount + delta));
    updateSettings({ javariBuzzAmount: newBuzz });
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

  // Presets Encoder turns: Cycle 128 factory presets
  const handlePresetChange = (delta: number) => {
    ensureAudioStarted();
    const totalPresets = FM1_PRESETS_LIST.length;
    const curId = settings.presetNumber || 1;
    let nextId = curId + delta;
    if (nextId < 1) nextId = totalPresets;
    if (nextId > totalPresets) nextId = 1;
    shrutiAudio.loadPreset(nextId);
    setSettings({ ...shrutiAudio.settings });
  };

  // Algorithm Encoder turns: Cycle 32 algorithms
  const handleAlgorithmChange = (delta: number) => {
    ensureAudioStarted();
    const curAlgo = settings.algorithmNumber || 1;
    let nextAlgo = curAlgo + delta;
    if (nextAlgo < 1) nextAlgo = 32;
    if (nextAlgo > 32) nextAlgo = 1;
    shrutiAudio.setAlgorithm(nextAlgo);
    setSettings({ ...shrutiAudio.settings });
  };

  const [savedNotification, setSavedNotification] = useState(false);
  const handleSavePreset = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
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
      const loopProg = shrutiAudio.getLoopProgress();

      // Screen background: High-contrast Clean Light LCD vs deep OLED glass
      ctx.fillStyle = isScreenLight ? '#fbfcfe' : '#060a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle LCD pixel raster grid
      ctx.fillStyle = isScreenLight ? 'rgba(0, 0, 0, 0.025)' : 'rgba(255, 255, 255, 0.02)';
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillRect(0, y, canvas.width, 1);
      }

      // Top Status Bar (Authentic M-VAVE FM-1 firmware header style)
      ctx.fillStyle = isScreenLight ? '#f1f5f9' : '#111d33';
      ctx.fillRect(0, 0, canvas.width, 24);
      ctx.strokeStyle = isScreenLight ? '#e2e8f0' : '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, 24);
      ctx.lineTo(canvas.width, 24);
      ctx.stroke();

      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillStyle = isScreenLight ? '#0284c7' : '#4cc9f0';
      ctx.fillText('FM-1', 5, 16);

      // Preset & Algo Tags
      ctx.fillStyle = isScreenLight ? '#b45309' : '#ffb703';
      const pNum = (settings.presetNumber || 1).toString().padStart(3, '0');
      const aNum = (settings.algorithmNumber || 1).toString().padStart(2, '0');
      ctx.fillText(`P${pNum} A${aNum}`, 36, 16);

      // Engine badge
      ctx.fillStyle = isScreenLight ? '#0f766e' : '#2dd4bf';
      const engTag = settings.synthesisEngine === 'PHYSICAL_MODELING' 
        ? 'WAVEG' 
        : settings.synthesisEngine === 'FM_SYNTHESIS' 
        ? 'FM6OP' 
        : settings.synthesisEngine === 'SAMPLES_PCM' 
        ? 'PCM32' 
        : 'MATH';
      ctx.fillText(`[${engTag}]`, 96, 16);

      // Play/Mute Icon
      if (settings.muted) {
        ctx.fillStyle = isScreenLight ? '#fee2e2' : '#7f1d1d';
        ctx.fillRect(198, 5, 38, 14);
        ctx.strokeStyle = isScreenLight ? '#fca5a5' : '#ef4444';
        ctx.strokeRect(198, 5, 38, 14);
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.fillText('MUTE', 205, 15);
      } else if (settings.tanpuraEnabled) {
        ctx.fillStyle = isScreenLight ? '#dcfce7' : '#14532d';
        ctx.fillRect(198, 5, 38, 14);
        ctx.strokeStyle = isScreenLight ? '#86efac' : '#22c55e';
        ctx.strokeRect(198, 5, 38, 14);
        ctx.fillStyle = isScreenLight ? '#15803d' : '#4ade80';
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.fillText('PLAY', 205, 15);
      } else {
        ctx.fillStyle = isScreenLight ? '#f1f5f9' : '#1e293b';
        ctx.fillRect(198, 5, 38, 14);
        ctx.strokeStyle = isScreenLight ? '#cbd5e1' : '#334155';
        ctx.strokeRect(198, 5, 38, 14);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.fillText('IDLE', 205, 15);
      }

      // Main Display Area: Depending on active Menu Page
      if (activeMenuPage === 'HOME') {
        // --- HOME SCREEN: Dayan Pitch + Algorithm Schematic + Strings + Loop Bar ---
        
        // Preset Name & Algorithm Tag Bar
        ctx.fillStyle = isScreenLight ? '#0f172a' : '#f8fafc';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        const pName = (settings.presetName || 'Miraj Grand Tanpura').slice(0, 26);
        ctx.fillText(pName, 8, 38);

        // Algorithm Routing / Schematic Header
        ctx.fillStyle = isScreenLight ? '#64748b' : '#94a3b8';
        ctx.font = '8px "JetBrains Mono", monospace';
        const aName = (settings.algorithmName || 'Waveguide + Javari Bridge').slice(0, 34);
        ctx.fillText(aName, 8, 48);

        // Large Dayan Pitch Readout
        ctx.fillStyle = isScreenLight ? '#0f172a' : '#f8fafc';
        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.fillText(`${settings.rootKey}${settings.octave}`, 8, 71);

        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillStyle = isScreenLight ? '#0284c7' : '#38bdf8';
        ctx.fillText(`${dayanHz.toFixed(1)}Hz`, 82, 63);

        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = isScreenLight ? '#64748b' : '#94a3b8';
        const centsText = settings.fineDetuneCents > 0 ? `+${settings.fineDetuneCents}¢` : `${settings.fineDetuneCents}¢`;
        ctx.fillText(`Dayan (${centsText})`, 82, 73);

        // Algorithm Mini Schematic Block
        const isWaveguide = settings.synthesisEngine === 'PHYSICAL_MODELING' || settings.synthesisEngine === 'HYBRID';
        const isFm = settings.synthesisEngine === 'FM_SYNTHESIS';

        ctx.fillStyle = isScreenLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.12)';
        ctx.fillRect(8, 77, canvas.width - 16, 18);
        ctx.strokeStyle = isScreenLight ? '#bae6fd' : '#0369a1';
        ctx.strokeRect(8, 77, canvas.width - 16, 18);

        ctx.fillStyle = isScreenLight ? '#0369a1' : '#38bdf8';
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        if (isWaveguide) {
          ctx.fillText('Waveguide: Pluck ─>(+)─>[Delay N]─>[Javari Bridge]─>[FIR LPF]─>Out', 10, 89);
        } else if (isFm) {
          ctx.fillText('FM-1 Koto: [OP2/4 Bloom] ─> [OP1/3 Jodi (1.5¢)] + Flutter LFO ─> Out', 10, 89);
        } else {
          ctx.fillText(`PureTones: [32-Harmonic Acoustic Wavetables] ──> Out`, 12, 89);
        }

        // 4/5 Tanpura Strings Visualizer Row
        const boxW = Math.floor((canvas.width - 20) / strings.length);
        for (let i = 0; i < strings.length; i++) {
          const s = strings[i];
          const isStruck = activeStringIndex === i;
          const sx = 10 + i * boxW;
          const sy = 99;

          ctx.fillStyle = isStruck 
            ? (isScreenLight ? '#fef08a' : '#fbbf24') 
            : (isScreenLight ? '#ffffff' : '#1e293b');
          ctx.fillRect(sx, sy, boxW - 3, 20);
          ctx.strokeStyle = isStruck 
            ? (isScreenLight ? '#ca8a04' : '#fef08a') 
            : (isScreenLight ? '#cbd5e1' : '#334155');
          ctx.strokeRect(sx, sy, boxW - 3, 20);

          ctx.fillStyle = isStruck 
            ? (isScreenLight ? '#713f12' : '#0f172a') 
            : (isScreenLight ? '#1e293b' : '#e2e8f0');
          ctx.font = 'bold 8px "JetBrains Mono", monospace';
          ctx.fillText(s.name.split(' ')[0], sx + 3, sy + 13);
        }

        // Loop Progress Bar ("prison bat until the end of the loop")
        const lpY = 122;
        ctx.fillStyle = isScreenLight ? '#e2e8f0' : '#1e293b';
        ctx.fillRect(10, lpY, canvas.width - 20, 4);
        ctx.fillStyle = isScreenLight ? '#f59e0b' : '#fbbf24';
        ctx.fillRect(10, lpY, (canvas.width - 20) * loopProg, 4);

        // Real-Time Audio Oscilloscope
        const analyser = shrutiAudio.getAnalyser();
        if (analyser && hasStarted && !settings.muted) {
          const bufLen = analyser.frequencyBinCount;
          const timeData = new Uint8Array(bufLen);
          analyser.getByteTimeDomainData(timeData);

          ctx.strokeStyle = isScreenLight ? '#2563eb' : '#38bdf8';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          const sliceW = (canvas.width - 20) / bufLen;
          let px = 10;
          for (let i = 0; i < bufLen; i++) {
            const v = timeData[i] / 128.0;
            const py = 144 + (v - 1.0) * 14;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
            px += sliceW;
          }
          ctx.stroke();
        } else {
          ctx.strokeStyle = isScreenLight ? '#cbd5e1' : '#334155';
          ctx.beginPath();
          ctx.moveTo(10, 144);
          ctx.lineTo(canvas.width - 10, 144);
          ctx.stroke();
        }

        // Bellows Air Pressure Bar
        ctx.fillStyle = isScreenLight ? '#e2e8f0' : '#1e293b';
        ctx.fillRect(10, 163, canvas.width - 20, 6);
        ctx.fillStyle = isPumping 
          ? (isScreenLight ? '#d97706' : '#f59e0b') 
          : (isScreenLight ? '#0284c7' : '#3b82f6');
        ctx.fillRect(10, 163, (canvas.width - 20) * pressure, 6);

        ctx.font = '7.5px "JetBrains Mono", monospace';
        ctx.fillStyle = isScreenLight ? '#64748b' : '#64748b';
        ctx.fillText('AIR BELLOWS PRESSURE', 10, 178);

      } else if (activeMenuPage === 'EDIT') {
        // --- EDIT SCREEN: Tanpura Sequencer & Strings ---
        ctx.fillStyle = isScreenLight ? '#b45309' : '#fbbf24';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText('TANPURA STRING EDIT', 10, 46);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = isScreenLight ? '#334155' : '#e2e8f0';
        ctx.fillText(`Pattern: ${settings.tanpuraPattern}`, 10, 66);
        ctx.fillText(`Pluck Tempo: ${settings.pluckSpeedBpm} BPM`, 10, 82);
        ctx.fillText(`Sustain: ${settings.stringSustain} sec`, 10, 98);
        ctx.fillText(`Dayan Hz: ${dayanHz.toFixed(1)} Hz`, 10, 114);

        // Pattern representation
        ctx.fillStyle = isScreenLight ? '#ffffff' : '#1e293b';
        ctx.fillRect(10, 126, canvas.width - 20, 42);
        ctx.strokeStyle = isScreenLight ? '#f59e0b' : '#f59e0b';
        ctx.strokeRect(10, 126, canvas.width - 20, 42);

        strings.forEach((st, idx) => {
          ctx.fillStyle = activeStringIndex === idx 
            ? (isScreenLight ? '#b45309' : '#fbbf24') 
            : (isScreenLight ? '#64748b' : '#94a3b8');
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText(`${idx + 1}:${st.name}`, 16 + idx * 52, 152);
        });

      } else if (activeMenuPage === 'ENV') {
        // --- ENV SCREEN: Shruti Box Free-Reed Envelope & Bellows ---
        ctx.fillStyle = isScreenLight ? '#0284c7' : '#38bdf8';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText('SHRUTI REED & BELLOWS', 10, 46);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = isScreenLight ? '#334155' : '#e2e8f0';
        ctx.fillText(`Drone Preset: ${settings.dronePreset}`, 10, 66);
        ctx.fillText(`Reed Detune: ${settings.reedDetuneSpread} cents`, 10, 82);
        ctx.fillText(`Bellows: ${settings.bellowsMode.toUpperCase()}`, 10, 98);
        ctx.fillText(`Pressure: ${Math.round(pressure * 100)}%`, 10, 114);

        // Visual bellows wave
        ctx.strokeStyle = isScreenLight ? '#0284c7' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 10; x < canvas.width - 10; x++) {
          const y = 148 + Math.sin((x + performance.now() * 0.05) * 0.06) * (pressure * 18);
          if (x === 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (activeMenuPage === 'LFO') {
        // --- LFO SCREEN: Javari Bridge Non-linear Buzz & Thread Contact ---
        ctx.fillStyle = isScreenLight ? '#7c3aed' : '#a855f7';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText('JAVARI (JIWA) BUZZ ENGINE', 10, 46);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = isScreenLight ? '#334155' : '#e2e8f0';
        ctx.fillText(`Cotton Thread: ${Math.round(settings.javariBuzzAmount * 100)}%`, 10, 66);
        ctx.fillText('Bridge Curve: Parabolic Non-linear', 10, 82);
        ctx.fillText(`Flutter Rate: ${settings.javariFlutterRate.toFixed(1)} Hz`, 10, 98);
        ctx.fillText(`Flesh Click: ${Math.round(settings.fleshNoiseAmount * 100)}%`, 10, 114);

        // Javari harmonic shimmer wave simulation
        ctx.strokeStyle = isScreenLight ? '#7c3aed' : '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 10; x < canvas.width - 10; x++) {
          const f1 = Math.sin(x * 0.08);
          const f3 = Math.sin(x * 0.24) * settings.javariBuzzAmount;
          const f7 = Math.sin(x * 0.56) * settings.javariBuzzAmount * 0.5;
          const y = 148 + (f1 + f3 + f7) * 16;
          if (x === 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (activeMenuPage === 'FX') {
        // --- FX SCREEN: Teakwood Resonance & Reverb Space ---
        ctx.fillStyle = isScreenLight ? '#059669' : '#10b981';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText('BOX RESONANCE & FX', 10, 46);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = isScreenLight ? '#334155' : '#e2e8f0';
        ctx.fillText(`Box Warmth: ${Math.round(settings.boxWarmth)} Hz`, 10, 66);
        ctx.fillText(`Reverb Space: ${settings.reverbType.toUpperCase()}`, 10, 82);
        ctx.fillText(`Reverb Mix: ${Math.round(settings.reverbMix * 100)}%`, 10, 98);
        ctx.fillText(`Stereo Spread: ${Math.round(settings.stereoSpread * 100)}%`, 10, 114);

        // Filter Formant Curve
        ctx.strokeStyle = isScreenLight ? '#059669' : '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, 160);
        ctx.quadraticCurveTo(80, 126, 160, 160);
        ctx.lineTo(canvas.width - 10, 166);
        ctx.stroke();

      } else if (activeMenuPage === 'GLO') {
        // --- GLO SCREEN: Indian Just Intonation Calibration ---
        ctx.fillStyle = isScreenLight ? '#e11d48' : '#f43f5e';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText('GLOBAL TUNING (JUST INT.)', 10, 46);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = isScreenLight ? '#334155' : '#e2e8f0';
        ctx.fillText(`Tuning Mode: ${settings.tuningMode.toUpperCase()}`, 10, 66);
        ctx.fillText(`Concert Standard: ${settings.tuningStandard} Hz`, 10, 82);
        ctx.fillText(`Dayan Micro-Detune: ${settings.fineDetuneCents}¢`, 10, 98);
        ctx.fillText(`Engine: ${settings.synthesisEngine}`, 10, 114);

        ctx.fillStyle = isScreenLight ? '#ffe4e6' : '#334155';
        ctx.fillRect(10, 132, canvas.width - 20, 36);
        ctx.strokeStyle = isScreenLight ? '#fecdd3' : '#475569';
        ctx.strokeRect(10, 132, canvas.width - 20, 36);
        ctx.fillStyle = isScreenLight ? '#be123c' : '#f43f5e';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillText('Shadja-Panchama Bhava 3:2 Pure', 16, 154);
      }

      // Bottom Encoders Readout Ribbon (Matches 4 knobs below screen)
      ctx.fillStyle = isScreenLight ? '#f1f5f9' : '#0f172a';
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
      ctx.strokeStyle = isScreenLight ? '#cbd5e1' : '#334155';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 30);
      ctx.lineTo(canvas.width, canvas.height - 30);
      ctx.stroke();

      const colW = canvas.width / 4;
      const labels = [
        { name: 'K1:KEY', val: settings.rootKey },
        { name: 'K2:BPM', val: `${settings.pluckSpeedBpm}` },
        { name: 'K3:BUZZ', val: `${Math.round(settings.javariBuzzAmount * 100)}%` },
        { name: 'K4:MIX', val: `${Math.round(settings.tanpuraVolume * 100)}%` },
      ];

      for (let i = 0; i < 4; i++) {
        const lx = i * colW;
        ctx.fillStyle = isScreenLight ? '#64748b' : '#94a3b8';
        ctx.font = '7px "JetBrains Mono", monospace';
        ctx.fillText(labels[i].name, lx + 4, canvas.height - 18);

        ctx.fillStyle = i === 2 
          ? (isScreenLight ? '#b45309' : '#fbbf24') 
          : i === 3 
            ? (isScreenLight ? '#0284c7' : '#38bdf8') 
            : (isScreenLight ? '#0f172a' : '#f8fafc');
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText(labels[i].val, lx + 4, canvas.height - 7);

        if (i < 3) {
          ctx.strokeStyle = isScreenLight ? '#e2e8f0' : '#1e293b';
          ctx.beginPath();
          ctx.moveTo(lx + colW, canvas.height - 26);
          ctx.lineTo(lx + colW, canvas.height - 4);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [settings, hasStarted, activeStringIndex, activeMenuPage, isLight, isScreenLight]);

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
      <div className={`w-full max-w-[760px] rounded-[28px] p-5 sm:p-7 relative transition-all duration-300 ${
        isLight
          ? 'bg-gradient-to-b from-[#fbfaf8] via-[#f5f3ec] to-[#e8e4dc] border border-stone-300/80 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12),inset_0_2px_1px_rgba(255,255,255,0.95)]'
          : 'bg-[#141416] border border-[#26262a] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)]'
      }`}>
        
        {/* Chassis Mounting Screws (Hex / Torx style) */}
        <div className={`absolute top-3.5 left-3.5 w-3 h-3 rounded-full flex items-center justify-center shadow-inner ${
          isLight ? 'bg-stone-200 border border-stone-300' : 'bg-[#202024] border border-[#333338]'
        }`}>
          <div className={`w-1.5 h-0.5 ${isLight ? 'bg-stone-400' : 'bg-black'}`}></div>
        </div>
        <div className={`absolute top-3.5 right-3.5 w-3 h-3 rounded-full flex items-center justify-center shadow-inner ${
          isLight ? 'bg-stone-200 border border-stone-300' : 'bg-[#202024] border border-[#333338]'
        }`}>
          <div className={`w-1.5 h-0.5 ${isLight ? 'bg-stone-400' : 'bg-black'}`}></div>
        </div>
        <div className={`absolute bottom-3.5 left-3.5 w-3 h-3 rounded-full flex items-center justify-center shadow-inner ${
          isLight ? 'bg-stone-200 border border-stone-300' : 'bg-[#202024] border border-[#333338]'
        }`}>
          <div className={`w-1.5 h-0.5 ${isLight ? 'bg-stone-400' : 'bg-black'}`}></div>
        </div>
        <div className={`absolute bottom-3.5 right-3.5 w-3 h-3 rounded-full flex items-center justify-center shadow-inner ${
          isLight ? 'bg-stone-200 border border-stone-300' : 'bg-[#202024] border border-[#333338]'
        }`}>
          <div className={`w-1.5 h-0.5 ${isLight ? 'bg-stone-400' : 'bg-black'}`}></div>
        </div>

        {/* Top Silkscreen Branding & Theme Toggle */}
        <div className={`flex items-center justify-between pb-3 mb-4 border-b ${
          isLight ? 'border-stone-200/90 text-stone-900' : 'border-[#222226] text-stone-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-widest text-sm ${isLight ? 'text-stone-900' : 'text-stone-200'}`}>
              M-VAVE
            </span>
            <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 shadow-2xs">
              FM-1
            </span>
            <span className={`text-[10px] font-mono hidden sm:inline ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
              DIGITAL FM SYNTHESIZER • CUSTOM FIRMWARE
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setFaceplateTheme(t => t === 'light' ? 'dark' : 'light')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300 shadow-xs' 
                  : 'bg-[#1e1e24] hover:bg-[#282830] text-amber-300 border-[#33333e]'
              }`}
              title="Toggle Light Ceramic vs Dark Studio Theme"
            >
              {isLight ? <Sun className="w-3 h-3 text-amber-500 fill-amber-500" /> : <Moon className="w-3 h-3 text-cyan-400" />}
              <span>{isLight ? 'Light Look' : 'Dark Studio'}</span>
            </button>

            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono ${
              isLight ? 'bg-white/80 border-stone-200 text-stone-600' : 'bg-[#1a1a1e] border-[#2e2e34] text-stone-400'
            }`}>
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>JieLi AC791N</span>
            </div>
          </div>
        </div>

        {/* TOP SECTION: MASTER & PRESETS (Left), TFT DISPLAY (Center), ALGORITHM & SELECT (Right) */}
        <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center mb-5">
          
          {/* Left Column: MASTER Volume Potentiometer + PRESETS Rotary Encoder */}
          <div className="col-span-3 flex flex-col items-center justify-between gap-4">
            
            {/* 1. MASTER VOLUME POTENTIOMETER */}
            <div className="flex flex-col items-center w-full">
              <span className={`text-[9px] font-mono font-bold tracking-wider uppercase mb-1 ${
                isLight ? 'text-stone-600' : 'text-stone-400'
              }`}>
                MASTER
              </span>

              <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 shadow-xl flex items-center justify-center relative group cursor-pointer ${
                isLight 
                  ? 'bg-gradient-to-b from-white via-stone-100 to-stone-200 border-stone-300/90 shadow-md' 
                  : 'bg-gradient-to-b from-[#2a2a30] via-[#1f1f24] to-[#121215] border-[#383842]'
              }`}>
                <div 
                  className={`w-1 h-3.5 sm:h-4 rounded-full absolute top-1 shadow-sm transition-transform ${
                    isLight ? 'bg-amber-600' : 'bg-white'
                  }`}
                  style={{
                    transform: `rotate(${(settings.muted ? 0 : settings.masterVolume) * 270 - 135}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                />
                <button
                  onClick={() => updateSettings({ muted: !settings.muted })}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isLight ? 'bg-stone-50 hover:bg-white text-stone-700 shadow-inner' : 'bg-[#18181c] text-stone-300 hover:text-white'
                  }`}
                  title="Mute / Unmute"
                >
                  {settings.muted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              </div>

              <div className="flex gap-1 mt-1.5">
                <button 
                  onClick={() => updateSettings({ masterVolume: Math.max(0, settings.masterVolume - 0.1) })}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded text-[9px] sm:text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs' : 'bg-[#222228] text-stone-300 hover:bg-[#2c2c34]'
                  }`}
                >
                  -
                </button>
                <button 
                  onClick={() => updateSettings({ masterVolume: Math.min(1, settings.masterVolume + 0.1) })}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded text-[9px] sm:text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs' : 'bg-[#222228] text-stone-300 hover:bg-[#2c2c34]'
                  }`}
                >
                  +
                </button>
              </div>
            </div>

            {/* 2. PRESETS ROTARY ENCODER (001 - 128 Presets) */}
            <div className="flex flex-col items-center w-full">
              <span className={`text-[9px] font-mono font-bold tracking-wider uppercase mb-1 ${
                isLight ? 'text-stone-600' : 'text-stone-400'
              }`}>
                PRESETS
              </span>

              <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 shadow-xl flex items-center justify-center relative group cursor-pointer ${
                isLight 
                  ? 'bg-gradient-to-b from-white via-stone-100 to-stone-200 border-stone-300/90 shadow-md' 
                  : 'bg-gradient-to-b from-[#2a2a30] via-[#1f1f24] to-[#121215] border-[#383842]'
              }`}>
                <div 
                  className="w-1 h-3.5 sm:h-4 bg-amber-500 rounded-full absolute top-1 shadow-sm transition-transform"
                  style={{
                    transform: `rotate(${(((settings.presetNumber || 1) % 128) / 128) * 360}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                />
                <button
                  onClick={() => handlePresetChange(1)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-mono font-black cursor-pointer ${
                    isLight ? 'bg-stone-50 hover:bg-white text-amber-800 shadow-inner' : 'bg-[#18181c] text-amber-400 hover:bg-[#24242a]'
                  }`}
                  title="Next Preset"
                >
                  P{settings.presetNumber || 1}
                </button>
              </div>

              <div className="flex gap-1 mt-1.5">
                <button 
                  onClick={() => handlePresetChange(-1)}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded text-[9px] sm:text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs' : 'bg-[#222228] text-stone-300 hover:bg-[#2c2c34]'
                  }`}
                  title="Previous Preset"
                >
                  &lt;
                </button>
                <button 
                  onClick={() => handlePresetChange(1)}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded text-[9px] sm:text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs' : 'bg-[#222228] text-stone-300 hover:bg-[#2c2c34]'
                  }`}
                  title="Next Preset"
                >
                  &gt;
                </button>
              </div>
            </div>

          </div>

          {/* Center Column: Authentic 1.54" Color TFT Display with Bezel */}
          <div className="col-span-6 flex flex-col items-center">
            {/* Screen Header Bar: Resolution + Light/Dark Switcher + DSP Analysis Info */}
            <div className="flex items-center justify-between w-full max-w-[280px] px-1 mb-1.5 gap-1">
              <span className={`text-[8px] font-mono tracking-wider uppercase font-semibold truncate ${
                isLight ? 'text-stone-500' : 'text-stone-400'
              }`}>
                1.54" IPS TFT
              </span>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setShowDspExplanation(true)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border transition-all cursor-pointer ${
                    isLight 
                      ? 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100' 
                      : 'bg-[#1a2333] text-sky-300 border-sky-800 hover:bg-[#202c40]'
                  }`}
                  title="View DSP Architecture (FuMi-1 FM vs Waveguide + Non-linear Javari Bridge)"
                >
                  <Info className="w-2.5 h-2.5" />
                  <span>DSP INFO</span>
                </button>

                <button
                  onClick={() => setScreenTheme(t => (t === 'light' || (t === 'auto' && isLight)) ? 'dark' : 'light')}
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border transition-all cursor-pointer ${
                    isScreenLight
                      ? 'bg-amber-100/80 text-amber-900 border-amber-300 hover:bg-amber-200/80 shadow-2xs'
                      : 'bg-stone-850 text-stone-300 border-stone-700 hover:bg-stone-800'
                  }`}
                  title="Toggle FM-1 LED Screen between Light Clean LCD and Dark OLED"
                >
                  <span>{isScreenLight ? '☀️ LCD' : '🌙 OLED'}</span>
                </button>
              </div>
            </div>

            <div className={`w-full max-w-[280px] aspect-square p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all ${
              isLight 
                ? 'bg-stone-200/90 border-[3px] border-stone-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.18)]' 
                : 'bg-[#03060a] border-[3px] border-[#222228] shadow-[inset_0_3px_12px_rgba(0,0,0,0.95)]'
            }`}>
              <canvas
                ref={canvasRef}
                width={240}
                height={240}
                className="w-full h-full rounded-xl pixelated shadow-inner"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          {/* Right Column: ALGORITHM Rotary Encoder + SELECT Rotary Encoder */}
          <div className="col-span-3 flex flex-col items-center justify-between gap-4">
            
            {/* 1. ALGORITHM ROTARY ENCODER (32 Algorithms) */}
            <div className="flex flex-col items-center w-full">
              <span className={`text-[9px] font-mono font-bold tracking-wider uppercase mb-1 ${
                isLight ? 'text-stone-600' : 'text-stone-400'
              }`}>
                ALGORITHM
              </span>

              <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 shadow-xl flex items-center justify-center relative group cursor-pointer ${
                isLight 
                  ? 'bg-gradient-to-b from-white via-stone-100 to-stone-200 border-stone-300/90 shadow-md' 
                  : 'bg-gradient-to-b from-[#2a2a30] via-[#1f1f24] to-[#121215] border-[#383842]'
              }`}>
                <div 
                  className="w-1 h-3.5 sm:h-4 bg-cyan-500 rounded-full absolute top-1 shadow-sm transition-transform"
                  style={{
                    transform: `rotate(${(((settings.algorithmNumber || 1) % 32) / 32) * 360}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                />
                <button
                  onClick={() => handleAlgorithmChange(1)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-mono font-black cursor-pointer ${
                    isLight ? 'bg-stone-50 hover:bg-white text-cyan-800 shadow-inner' : 'bg-[#18181c] text-cyan-400 hover:bg-[#24242a]'
                  }`}
                  title="Next Algorithm (Waveguide vs FM vs Wavetable)"
                >
                  A{settings.algorithmNumber || 1}
                </button>
              </div>

              <div className="flex gap-1 mt-1.5">
                <button 
                  onClick={() => handleAlgorithmChange(-1)}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded text-[9px] sm:text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs' : 'bg-[#222228] text-stone-300 hover:bg-[#2c2c34]'
                  }`}
                  title="Previous Algorithm"
                >
                  &lt;
                </button>
                <button 
                  onClick={() => handleAlgorithmChange(1)}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded text-[9px] sm:text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs' : 'bg-[#222228] text-stone-300 hover:bg-[#2c2c34]'
                  }`}
                  title="Next Algorithm"
                >
                  &gt;
                </button>
              </div>
            </div>

            {/* 2. SELECT ROTARY ENCODER */}
            <div className="flex flex-col items-center w-full">
              <span className={`text-[9px] font-mono font-bold tracking-wider uppercase mb-1 ${
                isLight ? 'text-stone-600' : 'text-stone-400'
              }`}>
                SELECT
              </span>

              <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 shadow-xl flex items-center justify-center relative cursor-pointer group ${
                isLight 
                  ? 'bg-gradient-to-b from-white via-stone-100 to-stone-200 border-stone-300/90 shadow-md' 
                  : 'bg-gradient-to-b from-[#2a2a30] via-[#1f1f24] to-[#121215] border-[#383842]'
              }`}>
                <div 
                  className="w-1 h-3.5 sm:h-4 bg-amber-500 rounded-full absolute top-1 shadow-sm transition-transform"
                  style={{
                    transform: `rotate(${(patterns.indexOf(settings.tanpuraPattern) / patterns.length) * 360}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                />
                <button
                  onClick={() => handleSelectTurn(1)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-mono font-bold cursor-pointer ${
                    isLight ? 'bg-stone-50 hover:bg-white text-amber-700 shadow-inner' : 'bg-[#18181c] text-amber-400 hover:bg-[#24242a]'
                  }`}
                  title="Click: Cycle Tanpura Lead Swara"
                >
                  SEL
                </button>
              </div>

              <div className="flex gap-1 mt-1.5">
                <button 
                  onClick={() => handleSelectTurn(-1)}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded text-[9px] sm:text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs' : 'bg-[#222228] text-stone-300 hover:bg-[#2c2c34]'
                  }`}
                >
                  &lt;
                </button>
                <button 
                  onClick={() => handleSelectTurn(1)}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded text-[9px] sm:text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs' : 'bg-[#222228] text-stone-300 hover:bg-[#2c2c34]'
                  }`}
                >
                  &gt;
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* 4 HORIZONTAL PARAMETER ENCODERS: Aligned underneath screen */}
        <div className={`rounded-2xl p-3 sm:p-4 border mb-5 transition-all ${
          isLight 
            ? 'bg-white/80 border-stone-200/90 shadow-xs' 
            : 'bg-[#19191d] border-[#2b2b32]'
        }`}>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            
            {/* KNOB 1: DAYAN KEY (Sa) */}
            <div className="flex flex-col items-center">
              <span className={`text-[9px] font-mono font-bold uppercase ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                KNOB 1
              </span>
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 shadow-sm my-1.5 flex items-center justify-center relative ${
                isLight 
                  ? 'bg-gradient-to-b from-white to-stone-100 border-stone-300/90' 
                  : 'bg-gradient-to-b from-[#2e2e36] to-[#16161a] border-[#3e3e4a]'
              }`}>
                <div 
                  className="w-1 h-3.5 bg-amber-500 rounded-full absolute top-1 transition-transform"
                  style={{
                    transform: `rotate(${(NOTE_NAMES.indexOf(settings.rootKey as typeof NOTE_NAMES[number]) / 12) * 300 - 150}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                />
                <span className={`text-xs font-black font-mono ${isLight ? 'text-stone-800' : 'text-stone-100'}`}>
                  {settings.rootKey}
                </span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleKnob1(-1)}
                  className={`w-5 h-5 rounded text-[10px] font-mono cursor-pointer ${
                    isLight ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200' : 'bg-[#222228] hover:bg-[#2f2f38] text-stone-300'
                  }`}
                >
                  -
                </button>
                <button 
                  onClick={() => handleKnob1(1)}
                  className={`w-5 h-5 rounded text-[10px] font-mono cursor-pointer ${
                    isLight ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200' : 'bg-[#222228] hover:bg-[#2f2f38] text-stone-300'
                  }`}
                >
                  +
                </button>
              </div>
              <span className={`text-[8px] font-mono mt-1 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>SA KEY</span>
            </div>

            {/* KNOB 2: TEMPO (BPM) */}
            <div className="flex flex-col items-center">
              <span className={`text-[9px] font-mono font-bold uppercase ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                KNOB 2
              </span>
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 shadow-sm my-1.5 flex items-center justify-center relative ${
                isLight 
                  ? 'bg-gradient-to-b from-white to-stone-100 border-stone-300/90' 
                  : 'bg-gradient-to-b from-[#2e2e36] to-[#16161a] border-[#3e3e4a]'
              }`}>
                <div 
                  className="w-1 h-3.5 bg-amber-500 rounded-full absolute top-1 transition-transform"
                  style={{
                    transform: `rotate(${((settings.pluckSpeedBpm - 20) / 70) * 300 - 150}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                />
                <span className={`text-[10px] font-bold font-mono ${isLight ? 'text-stone-800' : 'text-stone-200'}`}>
                  {settings.pluckSpeedBpm}
                </span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleKnob2(-2)}
                  className={`w-5 h-5 rounded text-[10px] font-mono cursor-pointer ${
                    isLight ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200' : 'bg-[#222228] hover:bg-[#2f2f38] text-stone-300'
                  }`}
                >
                  -
                </button>
                <button 
                  onClick={() => handleKnob2(2)}
                  className={`w-5 h-5 rounded text-[10px] font-mono cursor-pointer ${
                    isLight ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200' : 'bg-[#222228] hover:bg-[#2f2f38] text-stone-300'
                  }`}
                >
                  +
                </button>
              </div>
              <span className={`text-[8px] font-mono mt-1 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>PLUCK BPM</span>
            </div>

            {/* KNOB 3: JAVARI BUZZ */}
            <div className="flex flex-col items-center">
              <span className={`text-[9px] font-mono font-bold uppercase ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                KNOB 3
              </span>
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 shadow-sm my-1.5 flex items-center justify-center relative ${
                isLight 
                  ? 'bg-gradient-to-b from-white to-stone-100 border-stone-300/90' 
                  : 'bg-gradient-to-b from-[#2e2e36] to-[#16161a] border-[#3e3e4a]'
              }`}>
                <div 
                  className="w-1 h-3.5 bg-amber-500 rounded-full absolute top-1 transition-transform"
                  style={{
                    transform: `rotate(${(settings.javariBuzzAmount) * 300 - 150}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                />
                <span className={`text-[10px] font-bold font-mono ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                  {Math.round(settings.javariBuzzAmount * 100)}%
                </span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleKnob3(-0.05)}
                  className={`w-5 h-5 rounded text-[10px] font-mono cursor-pointer ${
                    isLight ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200' : 'bg-[#222228] hover:bg-[#2f2f38] text-stone-300'
                  }`}
                >
                  -
                </button>
                <button 
                  onClick={() => handleKnob3(0.05)}
                  className={`w-5 h-5 rounded text-[10px] font-mono cursor-pointer ${
                    isLight ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200' : 'bg-[#222228] hover:bg-[#2f2f38] text-stone-300'
                  }`}
                >
                  +
                </button>
              </div>
              <span className={`text-[8px] font-mono mt-1 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>JAVARI BUZZ</span>
            </div>

            {/* KNOB 4: MIX (TANPURA / SHRUTI) */}
            <div className="flex flex-col items-center">
              <span className={`text-[9px] font-mono font-bold uppercase ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                KNOB 4
              </span>
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 shadow-sm my-1.5 flex items-center justify-center relative ${
                isLight 
                  ? 'bg-gradient-to-b from-white to-stone-100 border-stone-300/90' 
                  : 'bg-gradient-to-b from-[#2e2e36] to-[#16161a] border-[#3e3e4a]'
              }`}>
                <div 
                  className="w-1 h-3.5 bg-cyan-500 rounded-full absolute top-1 transition-transform"
                  style={{
                    transform: `rotate(${(settings.tanpuraVolume) * 300 - 150}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                />
                <span className={`text-[10px] font-bold font-mono ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                  {Math.round(settings.tanpuraVolume * 100)}%
                </span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleKnob4(-0.05)}
                  className={`w-5 h-5 rounded text-[10px] font-mono cursor-pointer ${
                    isLight ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200' : 'bg-[#222228] hover:bg-[#2f2f38] text-stone-300'
                  }`}
                >
                  -
                </button>
                <button 
                  onClick={() => handleKnob4(0.05)}
                  className={`w-5 h-5 rounded text-[10px] font-mono cursor-pointer ${
                    isLight ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200' : 'bg-[#222228] hover:bg-[#2f2f38] text-stone-300'
                  }`}
                >
                  +
                </button>
              </div>
              <span className={`text-[8px] font-mono mt-1 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>TANPURA MIX</span>
            </div>

          </div>
        </div>

        {/* FUNCTION BUTTONS: Authentic 14 Silicone Squircle Buttons with Backlit LEDs */}
        <div className="mb-5">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
            
            {/* 1. HOME BUTTON */}
            <button
              onClick={() => setActiveMenuPage('HOME')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
                activeMenuPage === 'HOME'
                  ? isLight 
                    ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-xs' 
                    : 'bg-[#2b2b34] text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                  : isLight
                    ? 'bg-white text-stone-700 border-stone-200/90 hover:bg-stone-50 shadow-2xs'
                    : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:text-stone-200'
              }`}
            >
              <span>HOME</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeMenuPage === 'HOME' ? 'bg-amber-500' : isLight ? 'bg-stone-300' : 'bg-stone-700'}`} />
            </button>

            {/* 2. EDIT BUTTON (Waveguide / FM Operators) */}
            <button
              onClick={() => setActiveMenuPage('EDIT')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
                activeMenuPage === 'EDIT'
                  ? isLight 
                    ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-xs' 
                    : 'bg-[#2b2b34] text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                  : isLight
                    ? 'bg-white text-stone-700 border-stone-200/90 hover:bg-stone-50 shadow-2xs'
                    : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:text-stone-200'
              }`}
            >
              <span>EDIT</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeMenuPage === 'EDIT' ? 'bg-amber-500' : isLight ? 'bg-stone-300' : 'bg-stone-700'}`} />
            </button>

            {/* 3. ENV BUTTON (Bellows / Attack-Release) */}
            <button
              onClick={() => setActiveMenuPage('ENV')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
                activeMenuPage === 'ENV'
                  ? isLight 
                    ? 'bg-cyan-100 text-cyan-950 border-cyan-400 shadow-xs' 
                    : 'bg-[#2b2b34] text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                  : isLight
                    ? 'bg-white text-stone-700 border-stone-200/90 hover:bg-stone-50 shadow-2xs'
                    : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:text-stone-200'
              }`}
            >
              <span>ENV</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeMenuPage === 'ENV' ? 'bg-cyan-500' : isLight ? 'bg-stone-300' : 'bg-stone-700'}`} />
            </button>

            {/* 4. LFO BUTTON (Javari Shimmer & Vibrato) */}
            <button
              onClick={() => setActiveMenuPage('LFO')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
                activeMenuPage === 'LFO'
                  ? isLight 
                    ? 'bg-purple-100 text-purple-950 border-purple-400 shadow-xs' 
                    : 'bg-[#2b2b34] text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                  : isLight
                    ? 'bg-white text-stone-700 border-stone-200/90 hover:bg-stone-50 shadow-2xs'
                    : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:text-stone-200'
              }`}
            >
              <span>LFO</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeMenuPage === 'LFO' ? 'bg-purple-500' : isLight ? 'bg-stone-300' : 'bg-stone-700'}`} />
            </button>

            {/* 5. FX BUTTON (Reverb, Filter, Saturation) */}
            <button
              onClick={() => setActiveMenuPage('FX')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
                activeMenuPage === 'FX'
                  ? isLight 
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-400 shadow-xs' 
                    : 'bg-[#2b2b34] text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                  : isLight
                    ? 'bg-white text-stone-700 border-stone-200/90 hover:bg-stone-50 shadow-2xs'
                    : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:text-stone-200'
              }`}
            >
              <span>FX</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeMenuPage === 'FX' ? 'bg-emerald-500' : isLight ? 'bg-stone-300' : 'bg-stone-700'}`} />
            </button>

            {/* 6. GLO BUTTON (Global 22-Shruti / Just Intonation) */}
            <button
              onClick={() => setActiveMenuPage('GLO')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
                activeMenuPage === 'GLO'
                  ? isLight 
                    ? 'bg-rose-100 text-rose-950 border-rose-400 shadow-xs' 
                    : 'bg-[#2b2b34] text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                  : isLight
                    ? 'bg-white text-stone-700 border-stone-200/90 hover:bg-stone-50 shadow-2xs'
                    : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:text-stone-200'
              }`}
            >
              <span>GLO</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeMenuPage === 'GLO' ? 'bg-rose-500' : isLight ? 'bg-stone-300' : 'bg-stone-700'}`} />
            </button>

            {/* 7. SAVE BUTTON */}
            <button
              onClick={handleSavePreset}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
                savedNotification
                  ? 'bg-amber-500 text-stone-950 border-amber-300 animate-pulse'
                  : isLight
                    ? 'bg-white text-stone-700 border-stone-200/90 hover:bg-stone-50 shadow-2xs'
                    : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:text-stone-200'
              }`}
              title="Save current preset to memory"
            >
              <span>{savedNotification ? 'SAVED' : 'SAVE'}</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${savedNotification ? 'bg-stone-950' : isLight ? 'bg-stone-300' : 'bg-stone-700'}`} />
            </button>

          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            
            {/* 8. ARP BUTTON (Manual Pluck String) */}
            <button
              onClick={() => {
                ensureAudioStarted();
                const next = (activeStringIndex + 1) % 4;
                shrutiAudio.pluckTanpuraString(next);
              }}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold cursor-pointer ${
                isLight ? 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200 shadow-2xs' : 'border-[#28282f] bg-[#18181c] hover:bg-[#24242c] text-stone-300'
              }`}
            >
              <span>ARP</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isLight ? 'bg-amber-500' : 'bg-amber-500/50'}`} />
            </button>

            {/* 9. SEQ BUTTON (Tanpura Sequencer) */}
            <button
              onClick={() => updateSettings({ tanpuraEnabled: !settings.tanpuraEnabled })}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
                settings.tanpuraEnabled
                  ? isLight
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold'
                    : 'bg-[#2b2b34] text-emerald-400 border-emerald-500/50'
                  : isLight
                    ? 'bg-white text-stone-700 border-stone-200/90 hover:bg-stone-50'
                    : 'bg-[#18181c] text-stone-400 border-[#28282f]'
              }`}
            >
              <span>SEQ</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${settings.tanpuraEnabled ? 'bg-emerald-500' : isLight ? 'bg-stone-300' : 'bg-stone-700'}`} />
            </button>

            {/* 10. PLAY/STOP BUTTON */}
            <button
              onClick={handlePlayToggle}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                  : isLight
                    ? 'bg-white text-stone-700 border-stone-200/90 hover:bg-stone-50'
                    : 'bg-[#18181c] text-stone-400 border-[#28282f] hover:bg-[#24242c]'
              }`}
            >
              <span>{isPlaying ? 'PLAY' : 'STOP'}</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isPlaying ? 'bg-white' : isLight ? 'bg-stone-300' : 'bg-stone-700'}`} />
            </button>

            {/* 11. REC BUTTON (Manual Air Bellows Pump) */}
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
                  : isLight
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                    : 'bg-[#18181c] text-amber-400 border-[#28282f] hover:bg-[#24242c]'
              }`}
              title="Press and hold to pump air bellows"
            >
              <span>REC</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isPumping ? 'bg-rose-600' : 'bg-rose-500/60'}`} />
            </button>

            {/* 12. OCT- BUTTON */}
            <button
              onClick={() => handleOctave(-1)}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold cursor-pointer ${
                isLight ? 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200 shadow-2xs' : 'border-[#28282f] bg-[#18181c] hover:bg-[#24242c] text-stone-300'
              }`}
            >
              <span>OCT-</span>
              <span className={`text-[8px] mt-0.5 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>{settings.octave}</span>
            </button>

            {/* 13. OCT+ BUTTON */}
            <button
              onClick={() => handleOctave(1)}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold cursor-pointer ${
                isLight ? 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200 shadow-2xs' : 'border-[#28282f] bg-[#18181c] hover:bg-[#24242c] text-stone-300'
              }`}
            >
              <span>OCT+</span>
              <span className={`text-[8px] mt-0.5 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>{settings.octave}</span>
            </button>

            {/* 14. SHIFT BUTTON */}
            <button
              onClick={() => {
                // Toggle between HOME and EDIT page as secondary shift
                setActiveMenuPage(p => p === 'HOME' ? 'EDIT' : 'HOME');
              }}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border font-mono text-[9px] font-bold cursor-pointer ${
                activeMenuPage === 'EDIT'
                  ? 'bg-amber-500 text-stone-950 border-amber-300 font-black shadow-xs'
                  : isLight
                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200'
                    : 'bg-[#222228] hover:bg-[#2c2c34] text-stone-300 border-[#33333d]'
              }`}
              title="Shift: Toggle Primary / Secondary Functions"
            >
              <span>SHIFT</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeMenuPage === 'EDIT' ? 'bg-stone-950' : isLight ? 'bg-stone-400' : 'bg-stone-600'}`} />
            </button>

          </div>
        </div>

        {/* BOTTOM SECTION: 27-KEY SILICONE KEYBOARD (Authentic FM-1 2-Octave Piano Layout) */}
        <div className={`rounded-2xl p-3 border shadow-inner transition-all ${
          isLight ? 'bg-[#eae6df] border-stone-300/80' : 'bg-[#0e0e11] border-[#222228]'
        }`}>
          <div className="flex items-center justify-between mb-2 px-1 text-[10px] font-mono">
            <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-stone-800' : 'text-stone-300'}`}>
              <span>27-KEY SILICONE KEYBOARD</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200/60 text-amber-900 border border-amber-300/80">C2 - D4</span>
            </span>
            <span className={isLight ? 'text-stone-500' : 'text-stone-400'}>
              Individual LED Illumination • Tap to tune Dayan Sa instantly
            </span>
          </div>

          <div className="relative h-24 sm:h-28 flex items-stretch w-full justify-between gap-1 overflow-x-auto pb-1">
            {keys27.map((k, idx) => {
              const isSelected = settings.rootKey === k.note;
              const isPushed = activeKeyIndex === idx;

              // Secondary legends matching genuine FM-1 hardware (OP1-OP6, PIT, GLO, MONO, POLY, etc.)
              const secondaryLabels: Record<number, string> = {
                0: 'OP1',
                2: 'OP2',
                4: 'OP3',
                5: 'OP4',
                7: 'OP5',
                9: 'OP6',
                11: 'PIT',
                12: 'GLO',
                14: 'MONO',
                16: 'POLY',
                17: 'DELAY',
                19: 'JAVARI',
                21: 'DAMP',
                23: 'PLUCK',
                24: 'HARM',
                26: 'REVERB'
              };
              const subLabel = secondaryLabels[idx] || '';

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
                        ? isLight
                          ? 'bg-stone-900 border-2 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                          : 'bg-[#2b2b32] border border-amber-500/60 text-amber-300'
                        : isLight
                          ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-900'
                          : 'bg-[#18181c] hover:bg-[#222228] text-stone-400 border border-[#2e2e36]'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' : isLight ? 'bg-stone-500' : 'bg-stone-700'}`} />
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-mono font-bold leading-none">{k.note}</span>
                      {subLabel && <span className="text-[6px] font-mono opacity-60 leading-none mt-0.5">{subLabel}</span>}
                    </div>
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
                      ? isLight
                        ? 'bg-amber-50 text-stone-950 border-amber-500 ring-2 ring-amber-400/60 font-black'
                        : 'bg-[#e2e8f0] text-stone-950 border-amber-500 ring-1 ring-amber-500/40'
                      : isLight
                        ? 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300 shadow-2xs'
                        : 'bg-[#cbd5e1] hover:bg-[#e2e8f0] text-stone-800 border-[#94a3b8]'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-amber-500 shadow-[0_0_6px_#fbbf24]' : isLight ? 'bg-stone-300' : 'bg-stone-400'}`} />
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono font-black">{k.note}</span>
                    {subLabel && <span className="text-[6.5px] font-mono font-bold text-amber-800/80 leading-none mt-0.5">{subLabel}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* DSP ARCHITECTURE & FUMI-1 EXPLANATION MODAL */}
      {showDspExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">
                    Physical Modeling vs FuMi-1 FM Synthesis
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Acoustic physics of the Tanpura Javari Bridge & FuMi-1 (cartesive.github.io/fumi-1)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDspExplanation(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-700 leading-relaxed font-sans">
              
              {/* Card 1: How FuMi-1 actually does it */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <h4 className="font-bold text-amber-950 text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono text-[10px]">RESEARCH</span>
                  How FuMi-1 (cartesive.github.io/fumi-1) Produces String & Bridge Tones
                </h4>
                <p className="mb-2">
                  In <strong>cartesive/fumi-1</strong> (custom firmware for M-VAVE FM-1 on the JieLi AC791N SoC), sound synthesis is implemented using <strong>Felucca's C port of msfa (Dexed)</strong> — which is a <strong>6-Operator Frequency Modulation (FM) engine</strong>, NOT a digital waveguide!
                </p>
                <p className="mb-2">
                  <strong>Why does FuMi-1 sound so convincingly like a physical string with a buzzing bridge?</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
                  <li><strong>Rapid Modulation Index Decay:</strong> High initial modulation index on stacked modulators that collapses exponentially in under 30ms, perfectly mimicking the sharp metallic snap of the plectrum/fingertip ("tsume").</li>
                  <li><strong>Operator Feedback (OP6 self-modulation):</strong> Injects deterministic pseudo-noise excitation into the carrier frequency at the onset of the pluck.</li>
                  <li><strong>Dual Detuned Carriers & "余韻" (Ring-time):</strong> Two carriers tuned a few cents apart with slow phase beating, recreating the undulating shimmer that musicians associate with the silk cotton thread (jiva) resting against the curved bridge.</li>
                </ul>
              </div>

              {/* Card 2: The Physical Modeling Model */}
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80">
                <h4 className="font-bold text-sky-950 text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-sky-200 text-sky-900 font-mono text-[10px]">MATHEMATICAL MODEL</span>
                  Digital Waveguide + Non-Linear Javari Bridge (Karplus-Strong)
                </h4>
                <p className="mb-2">
                  The computational physical model provided in your formula is implemented as <strong>Algorithm 01 (WAVEGUIDE)</strong>:
                </p>
                <div className="p-2.5 rounded-xl bg-stone-900 text-cyan-300 font-mono text-[10.5px] overflow-x-auto my-2">
                  Excitação (Ruído) ──&gt; ( + ) ───&gt; [ Linha de Atraso (N) ] ───&gt; [ Ponte Não-Linear (Javari) ] ───&gt; Saída<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▲&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└───────────────── [ Filtro LPF ] &lt;───────────────┘
                </div>
                <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
                  <li><strong>Delay Line Length (N):</strong> Defined as <code className="font-mono bg-sky-100 px-1 py-0.5 rounded text-sky-900">N = fs / f0</code> with linear fractional delay interpolation for microtonal 22-Shruti precision.</li>
                  <li><strong>Loop Filter (LPF Damping):</strong> Single-pole low-pass filter <code className="font-mono bg-sky-100 px-1 py-0.5 rounded text-sky-900">y[n] = (1 - d)*x[n] + d*y[n-1]</code> directly controlling sustain time.</li>
                  <li><strong>Non-Linear Javari Bridge:</strong> Asymmetric soft-saturation transfer function: when the string displacement exceeds the clearance threshold of the curved wooden bridge and cotton thread, high-order harmonic cascading occurs dynamically.</li>
                </ul>
              </div>

              {/* Card 3: Instant Audition */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <h4 className="font-bold text-stone-900 text-sm mb-2">
                  Compare the Algorithms Live:
                </h4>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <button
                    onClick={() => {
                      shrutiAudio.setAlgorithm(1);
                      updateSettings({ synthesisEngine: 'PHYSICAL_MODELING', algorithmNumber: 1 });
                      shrutiAudio.pluckTanpuraString(0);
                    }}
                    className="p-2.5 rounded-xl border border-sky-300 bg-sky-50 text-sky-900 hover:bg-sky-100 text-left cursor-pointer"
                  >
                    <div className="font-bold">▶ Algo 01: Waveguide</div>
                    <div className="text-[9px] text-sky-700">Digital Waveguide + Javari Bridge</div>
                  </button>

                  <button
                    onClick={() => {
                      shrutiAudio.setAlgorithm(2);
                      updateSettings({ synthesisEngine: 'FM_SYNTHESIS', algorithmNumber: 2 });
                      shrutiAudio.pluckTanpuraString(0);
                    }}
                    className="p-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-left cursor-pointer"
                  >
                    <div className="font-bold">▶ Algo 02: FuMi-1 FM</div>
                    <div className="text-[9px] text-amber-700">Dexed msfa 6-Op FM Tone</div>
                  </button>

                  <button
                    onClick={() => {
                      shrutiAudio.setAlgorithm(3);
                      updateSettings({ synthesisEngine: 'SAMPLES_PCM', algorithmNumber: 3 });
                      shrutiAudio.pluckTanpuraString(0);
                    }}
                    className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 text-left cursor-pointer"
                  >
                    <div className="font-bold">▶ Algo 03: PureTones PCM</div>
                    <div className="text-[9px] text-emerald-700">32-Harmonic Acoustic Wavetable</div>
                  </button>

                  <button
                    onClick={() => {
                      shrutiAudio.setAlgorithm(4);
                      updateSettings({ synthesisEngine: 'MATH_DSP', algorithmNumber: 4 });
                      shrutiAudio.pluckTanpuraString(0);
                    }}
                    className="p-2.5 rounded-xl border border-purple-300 bg-purple-50 text-purple-900 hover:bg-purple-100 text-left cursor-pointer"
                  >
                    <div className="font-bold">▶ Algo 04: Math DSP</div>
                    <div className="text-[9px] text-purple-700">Fourier Partial Series (MCU)</div>
                  </button>
                </div>
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setShowDspExplanation(false)}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold cursor-pointer transition-colors"
              >
                Close & Return to Hardware Faceplate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
