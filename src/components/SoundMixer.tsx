import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Wind, 
  Music, 
  Radio, 
  Sliders, 
  Sparkles,
  Waves
} from 'lucide-react';
import { shrutiAudio, SoundEngineSettings } from '../audio/shrutiEngine';

interface SoundMixerProps {
  onSettingsChange?: () => void;
}

export const SoundMixer: React.FC<SoundMixerProps> = ({ onSettingsChange }) => {
  const [, setTick] = useState(0);
  const s = shrutiAudio.settings;

  const triggerUpdate = () => {
    shrutiAudio.updateVolume();
    shrutiAudio.syncFMDrone();
    setTick(t => t + 1);
    if (onSettingsChange) onSettingsChange();
  };

  const toggleMute = (gen: 'shruti' | 'tanpura' | 'fm') => {
    if (gen === 'shruti') s.shrutiMuted = !s.shrutiMuted;
    if (gen === 'tanpura') s.tanpuraMuted = !s.tanpuraMuted;
    if (gen === 'fm') s.fmDroneMuted = !s.fmDroneMuted;
    triggerUpdate();
  };

  const toggleSolo = (gen: 'shruti' | 'tanpura' | 'fm') => {
    if (gen === 'shruti') s.shrutiSolo = !s.shrutiSolo;
    if (gen === 'tanpura') s.tanpuraSolo = !s.tanpuraSolo;
    if (gen === 'fm') s.fmDroneSolo = !s.fmDroneSolo;
    triggerUpdate();
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-5 border border-stone-200/90 shadow-sm mb-6">
      
      {/* Mixer Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3.5 border-b border-stone-100 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
              3-Generator Sound Mixer (Shruti • Tanpura • FM Drone)
            </h3>
            <p className="text-[11px] text-stone-500">
              Independent Level, Mute, Solo, and Synthesis timbre sculpting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-stone-400">Master Level:</span>
          <span className="font-bold text-amber-800">{Math.round(s.masterVolume * 100)}%</span>
        </div>
      </div>

      {/* 3 Channel Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CHANNEL 1: SHRUTI BOX (FREE REED) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          s.shrutiMuted 
            ? 'bg-stone-50 border-stone-200 opacity-60' 
            : s.shrutiSolo 
            ? 'bg-amber-50/80 border-amber-400 shadow-xs' 
            : 'bg-white border-stone-200/90 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5 font-serif">
              <Wind className="w-3.5 h-3.5 text-amber-600" />
              1. Shruti Box
            </span>
            <div className="flex gap-1 font-mono text-[10px]">
              <button
                onClick={() => toggleMute('shruti')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  s.shrutiMuted ? 'bg-rose-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                M
              </button>
              <button
                onClick={() => toggleSolo('shruti')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  s.shrutiSolo ? 'bg-amber-500 text-stone-950' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                S
              </button>
            </div>
          </div>

          <p className="text-[10px] text-stone-500 mb-3">
            Dual brass beating reeds + teakwood air cavity
          </p>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[11px] font-mono text-stone-600 mb-1">
                <span>Volume:</span>
                <span className="font-bold">{Math.round(s.shrutiVolume * 100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={s.shrutiVolume}
                onChange={(e) => {
                  s.shrutiVolume = parseFloat(e.target.value);
                  triggerUpdate();
                }}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-stone-500 mb-1">
                <span>Box Warmth (Cutoff):</span>
                <span>{Math.round(s.boxWarmth)}Hz</span>
              </div>
              <input 
                type="range"
                min="400"
                max="3500"
                step="50"
                value={s.boxWarmth}
                onChange={(e) => {
                  s.boxWarmth = parseFloat(e.target.value);
                  shrutiAudio.updateTone();
                  triggerUpdate();
                }}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span>Drone: {s.dronePreset}</span>
              <span className="text-amber-700 font-bold">{s.reedDetuneSpread}¢ Beating</span>
            </div>
          </div>
        </div>

        {/* CHANNEL 2: TANPURA (JAVARI PLUCK) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          s.tanpuraMuted 
            ? 'bg-stone-50 border-stone-200 opacity-60' 
            : s.tanpuraSolo 
            ? 'bg-amber-50/80 border-amber-400 shadow-xs' 
            : 'bg-white border-stone-200/90 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5 font-serif">
              <Music className="w-3.5 h-3.5 text-amber-600" />
              2. Tanpura
            </span>
            <div className="flex gap-1 font-mono text-[10px]">
              <button
                onClick={() => toggleMute('tanpura')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  s.tanpuraMuted ? 'bg-rose-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                M
              </button>
              <button
                onClick={() => toggleSolo('tanpura')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  s.tanpuraSolo ? 'bg-amber-500 text-stone-950' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                S
              </button>
            </div>
          </div>

          <p className="text-[10px] text-stone-500 mb-3">
            4-string sequencer with cotton bridge Javari bloom
          </p>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[11px] font-mono text-stone-600 mb-1">
                <span>Volume:</span>
                <span className="font-bold">{Math.round(s.tanpuraVolume * 100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={s.tanpuraVolume}
                onChange={(e) => {
                  s.tanpuraVolume = parseFloat(e.target.value);
                  triggerUpdate();
                }}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-stone-500 mb-1">
                <span>Javari (Jiwa Buzz):</span>
                <span>{Math.round(s.javariBuzzAmount * 100)}%</span>
              </div>
              <input 
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={s.javariBuzzAmount}
                onChange={(e) => {
                  s.javariBuzzAmount = parseFloat(e.target.value);
                  triggerUpdate();
                }}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span>Pattern: {s.tanpuraPattern}</span>
              <span className="text-amber-700 font-bold">{s.pluckSpeedBpm} BPM</span>
            </div>
          </div>
        </div>

        {/* CHANNEL 3: FM OPERATOR DRONE (NATIVE FM-1 STYLE) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          s.fmDroneMuted 
            ? 'bg-stone-50 border-stone-200 opacity-60' 
            : s.fmDroneSolo 
            ? 'bg-amber-50/80 border-amber-400 shadow-xs' 
            : 'bg-white border-stone-200/90 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5 font-serif">
              <Radio className="w-3.5 h-3.5 text-cyan-600" />
              3. FM Operator Drone
            </span>
            <div className="flex gap-1 font-mono text-[10px]">
              <button
                onClick={() => toggleMute('fm')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  s.fmDroneMuted ? 'bg-rose-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                M
              </button>
              <button
                onClick={() => toggleSolo('fm')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  s.fmDroneSolo ? 'bg-cyan-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                S
              </button>
            </div>
          </div>

          <p className="text-[10px] text-stone-500 mb-3">
            Native FM-1 JieLi 2-Operator frequency modulation
          </p>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[11px] font-mono text-stone-600 mb-1">
                <span>Volume:</span>
                <span className="font-bold">{Math.round(s.fmDroneVolume * 100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={s.fmDroneVolume}
                onChange={(e) => {
                  s.fmDroneVolume = parseFloat(e.target.value);
                  triggerUpdate();
                }}
                className="w-full accent-cyan-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-stone-500 mb-1">
                <span>FM Mod Index (Brightness):</span>
                <span>{s.fmModulationIndex.toFixed(1)}</span>
              </div>
              <input 
                type="range"
                min="0"
                max="8"
                step="0.2"
                value={s.fmModulationIndex}
                onChange={(e) => {
                  s.fmModulationIndex = parseFloat(e.target.value);
                  triggerUpdate();
                }}
                className="w-full accent-cyan-600 cursor-pointer"
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span>Ratio: 1:{s.fmModulatorRatio}</span>
              <div className="flex gap-1">
                {[1.0, 1.5, 2.0, 3.0].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      s.fmModulatorRatio = r;
                      triggerUpdate();
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      s.fmModulatorRatio === r 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                    }`}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
