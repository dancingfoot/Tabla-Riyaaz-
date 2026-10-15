import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Music, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Wind,
  Layers,
  Clock,
  Radio,
  Compass,
  Music2,
  Github
} from 'lucide-react';
import { FM1Hardware } from './components/FM1Hardware';
import { RagaPresets, TablaRagaPreset } from './components/RagaPresets';
import { FirmwareGuide } from './components/FirmwareGuide';
import { TablaReference } from './components/TablaReference';
import { IndianMusicHistory } from './components/IndianMusicHistory';
import { SoundMixer } from './components/SoundMixer';
import { shrutiAudio, SynthesisEngineType } from './audio/shrutiEngine';
import tanpuraShrutiImage from './assets/images/tanpura_shruti_box_1792053990978.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'tabla' | 'history' | 'presets' | 'code'>('simulator');
  const [isMuted, setIsMuted] = useState(false);
  const [masterVol, setMasterVol] = useState(0.75);
  const [currentEngine, setCurrentEngine] = useState<SynthesisEngineType>(shrutiAudio.settings.synthesisEngine);

  // Rhythmic Loop Progress State (The loop progress bar)
  const [loopProgress, setLoopProgress] = useState<number>(0);
  const [activeBeat, setActiveBeat] = useState<number>(0);
  const [totalBeats, setTotalBeats] = useState<number>(4);

  // Subscribe to SoundEngine loop progress callback
  useEffect(() => {
    shrutiAudio.setLoopProgressListener((progress, curString, total) => {
      setLoopProgress(progress);
      setActiveBeat(curString);
      setTotalBeats(total);
    });
  }, []);

  const handleApplyPreset = (preset: TablaRagaPreset) => {
    shrutiAudio.settings.rootKey = preset.rootKey;
    shrutiAudio.settings.octave = preset.octave;
    shrutiAudio.settings.tanpuraPattern = preset.pattern;
    shrutiAudio.settings.dronePreset = preset.dronePreset;
    shrutiAudio.settings.pluckSpeedBpm = preset.pluckBpm;
    shrutiAudio.settings.javariBuzzAmount = preset.javari;
    shrutiAudio.settings.activeRagaName = preset.name.split(' - ')[0];
    shrutiAudio.applyShrutiPreset(preset.dronePreset);
    shrutiAudio.syncReeds();
    shrutiAudio.syncFMDrone();
    setActiveTab('simulator');
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    shrutiAudio.settings.muted = nextMuted;
    shrutiAudio.updateVolume();
  };

  const handleVolumeChange = (newVal: number) => {
    setMasterVol(newVal);
    shrutiAudio.settings.masterVolume = newVal;
    shrutiAudio.updateVolume();
  };

  const handleEngineChange = (engine: SynthesisEngineType) => {
    setCurrentEngine(engine);
    shrutiAudio.settings.synthesisEngine = engine;
  };

  // Calculate loop time remaining in seconds
  const stringIntervalSec = 60 / Math.max(15, shrutiAudio.settings.pluckSpeedBpm);
  const totalLoopSec = stringIntervalSec * totalBeats;
  const elapsedSec = (loopProgress * totalLoopSec).toFixed(1);

  return (
    <div className="min-h-screen bg-[#faf8f4] text-stone-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Top Clean Light Navigation Bar */}
      <header className="border-b border-stone-200 bg-white/95 backdrop-blur sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-black tracking-wide text-stone-900 text-base sm:text-lg">
                  SHRUTI-1
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  FM-1 TABLA RIYAZ
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Indian Classical Tanpura (Javari) • Shruti Box • FM Operator Drone
              </p>
            </div>
          </div>

          {/* Master Volume & Navigation Tabs */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            <div className="hidden lg:flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 text-xs">
              <button 
                onClick={handleToggleMute}
                className="text-stone-600 hover:text-stone-900 cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : masterVol}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-medium overflow-x-auto">
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'simulator'
                    ? 'bg-white text-stone-900 font-bold shadow-xs border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>FM-1 Synthesizer</span>
              </button>

              <button
                onClick={() => setActiveTab('tabla')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'tabla'
                    ? 'bg-white text-stone-900 font-bold shadow-xs border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Music2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Tabla Riyaz & Taals</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'bg-white text-stone-900 font-bold shadow-xs border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-600" />
                <span>History & 22 Shrutis</span>
              </button>

              <button
                onClick={() => setActiveTab('presets')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'presets'
                    ? 'bg-white text-stone-900 font-bold shadow-xs border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Music className="w-3.5 h-3.5 text-amber-600" />
                <span>Dayan Presets</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'code'
                    ? 'bg-white text-stone-900 font-bold shadow-xs border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-amber-600" />
                <span>C Firmware & GitHub</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 flex flex-col items-center">
        
        {/* TOP HERO CARD: INSTRUMENT PICTURE + ACTIVE RAGA + LOOP PROGRESS BAR */}
        <div className="w-full max-w-4xl bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-sm mb-5">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 pb-4 border-b border-stone-100">
            
            {/* Small picture of the instrument */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-200/80 shadow-md bg-amber-50/50 flex items-center justify-center p-1">
                <img 
                  src={tanpuraShrutiImage} 
                  alt="Miraj Tanpura & Wooden Shruti Box" 
                  className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-amber-600 text-white font-mono text-[9px] font-bold shadow-xs">
                3-GEN
              </span>
            </div>

            {/* Instrument & Raga Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  SHRUTI • TANPURA • FM DRONE
                </span>
                <span className="text-xs font-mono font-bold text-stone-400">
                  DAYAN: <span className="text-amber-700 font-extrabold">{shrutiAudio.settings.rootKey}{shrutiAudio.settings.octave}</span> ({shrutiAudio.getDayanFrequency().toFixed(1)} Hz)
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-serif font-black text-stone-900 tracking-tight">
                {shrutiAudio.settings.activeRagaName}
              </h2>

              <p className="text-xs text-stone-600 mt-0.5">
                {shrutiAudio.settings.ragaThaat} • {shrutiAudio.settings.ragaMood}
              </p>

              {/* Real-time Synthesis Engine Selector */}
              <div className="mt-3 flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-stone-400 mr-1 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-600" /> ENGINE:
                </span>

                <button
                  onClick={() => handleEngineChange('HYBRID')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    currentEngine === 'HYBRID'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                  title="Karplus-Strong physical string + Non-linear curved bridge clipping"
                >
                  HYBRID PHYSICAL
                </button>

                <button
                  onClick={() => handleEngineChange('SAMPLES_PCM')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    currentEngine === 'SAMPLES_PCM'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                  title="Real multi-harmonic acoustic wavetables from real instrument recordings"
                >
                  ACOUSTIC SAMPLES
                </button>

                <button
                  onClick={() => handleEngineChange('MATH_DSP')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    currentEngine === 'MATH_DSP'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                  title="Pure algorithmic Fourier mathematical series (zero memory, ideal for low-flash MCU)"
                >
                  PURE MATH DSP
                </button>
              </div>

            </div>

          </div>

          {/* RHYTHMIC PROGRESS BAR (Until the end of the loop) */}
          <div className="mt-4 pt-1">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="font-bold text-stone-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Tanpura Plucking Cycle Loop
              </span>
              <span className="text-stone-500 text-[11px]">
                {elapsedSec}s / {totalLoopSec.toFixed(1)}s • <span className="font-bold text-amber-700">{Math.round(loopProgress * 100)}%</span> to next loop
              </span>
            </div>

            {/* The Animated Progress Track */}
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200 relative shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-full transition-all duration-75 relative shadow-xs"
                style={{ width: `${Math.max(2, loopProgress * 100)}%` }}
              >
                {/* Glowing playhead */}
                <div className="w-2 h-2 rounded-full bg-white absolute right-0.5 top-0 bottom-0 m-auto shadow-sm" />
              </div>
            </div>

            {/* 4 Beat Markers across the loop */}
            <div className="grid grid-cols-4 gap-1 mt-2 text-[10px] font-mono text-center">
              {[
                { name: '1: Lead (Pa/Ma/Ni)', ratio: 'Lead String' },
                { name: '2: Sa (Jodi 1)', ratio: 'Middle' },
                { name: '3: Sa (Jodi 2)', ratio: 'Chorused' },
                { name: '4: Kharaj Sa', ratio: 'Bass 0.5x' },
              ].map((b, idx) => {
                const isCurrent = activeBeat === idx;
                return (
                  <div 
                    key={idx}
                    className={`py-1 px-1 rounded-md border transition-all ${
                      isCurrent 
                        ? 'bg-amber-100/80 border-amber-400 text-amber-900 font-bold shadow-xs' 
                        : 'bg-stone-50/80 border-stone-200/60 text-stone-500'
                    }`}
                  >
                    <div>{b.name}</div>
                    <div className="text-[8px] opacity-75">{b.ratio}</div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Tab 1: Interactive FM-1 Synthesizer & Sound Mixer */}
        {activeTab === 'simulator' && (
          <div className="w-full flex flex-col items-center">
            {/* 3-Generator Sound Mixer */}
            <SoundMixer />

            {/* M-VAVE FM-1 Hardware Faceplate */}
            <FM1Hardware />
          </div>
        )}

        {/* Tab 2: Dedicated Tabla Riyaz & Taal Reference Library */}
        {activeTab === 'tabla' && (
          <div className="w-full">
            <TablaReference />
          </div>
        )}

        {/* Tab 3: Indian Music History & 22 Shrutis */}
        {activeTab === 'history' && (
          <div className="w-full">
            <IndianMusicHistory />
          </div>
        )}

        {/* Tab 4: Dayan Presets */}
        {activeTab === 'presets' && (
          <div className="w-full">
            <RagaPresets 
              currentKey={shrutiAudio.settings.rootKey}
              currentPattern={shrutiAudio.settings.tanpuraPattern}
              onApplyPreset={handleApplyPreset}
            />
          </div>
        )}

        {/* Tab 5: C Firmware & GitHub Pages Guide */}
        {activeTab === 'code' && (
          <div className="w-full">
            <FirmwareGuide />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-4 px-4 text-center text-xs text-stone-500 font-mono bg-white">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <p>
            Shruti-1 • Built for M-VAVE FM-1 (JieLi AC791N) • Compatible with <span className="text-amber-700 font-bold">cartesive/fumi-1</span>
          </p>
          <span className="text-stone-300">•</span>
          <span className="flex items-center gap-1 text-stone-600">
            <Github className="w-3.5 h-3.5" /> Ready for GitHub Pages deployment
          </span>
        </div>
      </footer>

    </div>
  );
}
