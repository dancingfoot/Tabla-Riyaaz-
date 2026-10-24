import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Wind, 
  Music, 
  Radio, 
  Sliders, 
  Sparkles,
  Waves,
  Disc,
  Compass,
  Zap
} from 'lucide-react';
import { shrutiAudio, ReverbHallType, SynthesisEngineType } from '../audio/shrutiEngine';

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

  const handleReverbTypeChange = (type: ReverbHallType) => {
    s.reverbType = type;
    shrutiAudio.updateReverbImpulse();
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
              3-Generator Sound Mixer & Master FX Rack
            </h3>
            <p className="text-[11px] text-stone-500">
              Shruti • Tanpura • FM Drone • Darbar Hall Reverb • Tape Saturation • Binaural Stereo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-stone-400">Master Level:</span>
          <span className="font-bold text-amber-800">{Math.round(s.masterVolume * 100)}%</span>
        </div>
      </div>

      {/* 3 Channel Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        
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

            <div>
              <div className="flex justify-between text-[10px] font-mono text-stone-500 mb-1">
                <span>Air Rush / Turbulence:</span>
                <span>{Math.round(s.airHissAmount * 100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="0.4"
                step="0.02"
                value={s.airHissAmount}
                onChange={(e) => {
                  s.airHissAmount = parseFloat(e.target.value);
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

          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
              <span className="text-stone-500 font-semibold">Synthesis Engine:</span>
              <span className="font-bold text-amber-700">
                {s.synthesisEngine === 'PHYSICAL_MODELING'
                  ? 'Digital Waveguide (Javari)'
                  : s.synthesisEngine === 'FM_SYNTHESIS'
                  ? 'Koto-Tanpura 6-Op FM'
                  : s.synthesisEngine === 'SAMPLES_PCM'
                  ? 'PureTones Wavetable'
                  : 'Fourier Math DSP'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
              <button
                onClick={() => {
                  s.synthesisEngine = 'PHYSICAL_MODELING';
                  s.algorithmNumber = 1;
                  s.algorithmName = 'Waveguide + Non-linear Javari Bridge';
                  triggerUpdate();
                }}
                className={`px-1.5 py-1 rounded text-left border transition-all cursor-pointer ${
                  s.synthesisEngine === 'PHYSICAL_MODELING'
                    ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-2xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                }`}
                title="Karplus-Strong Digital Waveguide + Non-linear Curved Bridge Contact"
              >
                1. Waveguide KS (Javari)
              </button>
              <button
                onClick={() => {
                  s.synthesisEngine = 'FM_SYNTHESIS';
                  s.algorithmNumber = 2;
                  s.algorithmName = 'FuMi-1 Koto-to-Tanpura 6-Op FM';
                  triggerUpdate();
                }}
                className={`px-1.5 py-1 rounded text-left border transition-all cursor-pointer ${
                  s.synthesisEngine === 'FM_SYNTHESIS'
                    ? 'bg-cyan-100 text-cyan-900 border-cyan-400 font-bold shadow-2xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                }`}
                title="6-Operator FM Synthesis (FuMi-1 / DX7 #22 Koto architecture with Tanpura Javari bloom plateau & Jodi beating)"
              >
                2. Koto-Tanpura 6-Op FM
              </button>
              <button
                onClick={() => {
                  s.synthesisEngine = 'SAMPLES_PCM';
                  s.algorithmNumber = 3;
                  s.algorithmName = 'PureTones 32-Harmonic Wavetables';
                  triggerUpdate();
                }}
                className={`px-1.5 py-1 rounded text-left border transition-all cursor-pointer ${
                  s.synthesisEngine === 'SAMPLES_PCM'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold shadow-2xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                }`}
                title="PureTones 32-Harmonic Acoustic Wavetables"
              >
                3. PureTones Waves
              </button>
              <button
                onClick={() => {
                  s.synthesisEngine = 'MATH_DSP';
                  s.algorithmNumber = 4;
                  s.algorithmName = 'Fourier Additive Math DSP';
                  triggerUpdate();
                }}
                className={`px-1.5 py-1 rounded text-left border transition-all cursor-pointer ${
                  s.synthesisEngine === 'MATH_DSP'
                    ? 'bg-purple-100 text-purple-900 border-purple-400 font-bold shadow-2xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                }`}
                title="Fourier Additive Sine Resynthesis"
              >
                4. Fourier Math DSP
              </button>
            </div>
          </div>

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
                <span>Javari (Cotton Buzz):</span>
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

            <div>
              <div className="flex justify-between text-[10px] font-mono text-stone-500 mb-1">
                <span>Pluck Flesh Click:</span>
                <span>{Math.round(s.fleshNoiseAmount * 100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={s.fleshNoiseAmount}
                onChange={(e) => {
                  s.fleshNoiseAmount = parseFloat(e.target.value);
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

      {/* MASTER FX RACK: REVERB (DARBAR HALL) + TAPE SATURATION + BINAURAL STEREO */}
      <div className="bg-[#faf8f4] p-4 rounded-2xl border border-stone-200/80">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200/60">
          <span className="text-xs font-mono font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-amber-600" />
            Concert Master FX Rack (Darbar Hall Acoustics)
          </span>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs font-mono text-stone-700 cursor-pointer">
              <input 
                type="checkbox"
                checked={s.reverbEnabled}
                onChange={(e) => {
                  s.reverbEnabled = e.target.checked;
                  shrutiAudio.updateReverbMix();
                  triggerUpdate();
                }}
                className="accent-amber-600 cursor-pointer"
              />
              <span className="font-bold">Reverb FX Active</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Reverb Space & Wet Mix */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-stone-600">
              <span>Acoustic Space:</span>
              <span className="font-bold uppercase text-amber-800">{s.reverbType}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(['darbar', 'chamber', 'temple'] as ReverbHallType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleReverbTypeChange(type)}
                  className={`py-1 rounded-lg text-[10px] font-mono font-bold capitalize transition-all cursor-pointer ${
                    s.reverbType === type
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <div className="flex justify-between text-[11px] font-mono text-stone-600 mb-1">
                <span>Reverb Wet Mix:</span>
                <span className="font-bold">{Math.round(s.reverbMix * 100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="0.8"
                step="0.02"
                value={s.reverbMix}
                onChange={(e) => {
                  s.reverbMix = parseFloat(e.target.value);
                  shrutiAudio.updateReverbMix();
                  triggerUpdate();
                }}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Reverb Decay Time */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-mono text-stone-600">
              <span>Reverb Decay (RT60):</span>
              <span className="font-bold">{s.reverbDecay.toFixed(1)}s</span>
            </div>
            <input 
              type="range"
              min="1.0"
              max="5.5"
              step="0.2"
              value={s.reverbDecay}
              onChange={(e) => {
                s.reverbDecay = parseFloat(e.target.value);
                shrutiAudio.updateReverbImpulse();
                triggerUpdate();
              }}
              className="w-full accent-amber-600 cursor-pointer mt-1"
            />

            <div className="pt-2">
              <div className="flex justify-between text-[11px] font-mono text-stone-600 mb-1">
                <span>Stereo Width (Binaural):</span>
                <span className="font-bold">{Math.round(s.stereoSpread * 100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={s.stereoSpread}
                onChange={(e) => {
                  s.stereoSpread = parseFloat(e.target.value);
                  triggerUpdate();
                }}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Analog Tape Warmth & Flutter */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-mono text-stone-600">
              <span>Analog Tape Saturation:</span>
              <span className="font-bold">{Math.round(s.tapeWarmth * 100)}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={s.tapeWarmth}
              onChange={(e) => {
                s.tapeWarmth = parseFloat(e.target.value);
                triggerUpdate();
              }}
              className="w-full accent-amber-600 cursor-pointer mt-1"
            />

            <div className="pt-2">
              <div className="flex justify-between text-[11px] font-mono text-stone-600 mb-1">
                <span>Javari Neck Flutter:</span>
                <span className="font-bold">{s.javariFlutterRate.toFixed(1)} Hz</span>
              </div>
              <input 
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={s.javariFlutterRate}
                onChange={(e) => {
                  s.javariFlutterRate = parseFloat(e.target.value);
                  triggerUpdate();
                }}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
