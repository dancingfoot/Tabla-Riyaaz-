import React from 'react';
import { Music, Sparkles } from 'lucide-react';
import { shrutiAudio, SoundEngineSettings } from '../audio/shrutiEngine';

export interface TablaRagaPreset {
  id: string;
  name: string;
  dayanSize: string;
  rootKey: string;
  octave: number;
  expectedHz: number;
  pattern: 'Pa-Sa-Sa-Sa' | 'Ma-Sa-Sa-Sa' | 'Ni-Sa-Sa-Sa' | '5-String';
  dronePreset: string;
  pluckBpm: number;
  javari: number;
  description: string;
  idealFor: string;
}

export const TABLA_PRESETS: TablaRagaPreset[] = [
  {
    id: 'dayan_csharp_male',
    name: 'Dayan C# (Kali 1) - Standard Solo & Vocal',
    dayanSize: '5.25" - 5.35"',
    rootKey: 'C#',
    octave: 3,
    expectedHz: 138.59,
    pattern: 'Pa-Sa-Sa-Sa',
    dronePreset: 'Sa-Pa-Sa',
    pluckBpm: 46,
    javari: 0.78,
    description: 'The definitive universal standard for Indian classical tabla riyaz and male Khyal accompaniment.',
    idealFor: 'Teental solo, Peshkar, Kaida, Raga Yaman, Bhupali',
  },
  {
    id: 'dayan_d_sitar',
    name: 'Dayan D (Safed 2) - Sitar & Bansuri Match',
    dayanSize: '5.25"',
    rootKey: 'D',
    octave: 3,
    expectedHz: 146.83,
    pattern: 'Pa-Sa-Sa-Sa',
    dronePreset: 'Sa-Pa-Sa',
    pluckBpm: 48,
    javari: 0.75,
    description: 'Bright and resonant pitch favored by sitarists (Vilayat Khan style) and bansuri flute players.',
    idealFor: 'Instrumental Jhala, Gat accompaniment, Roopak Taal',
  },
  {
    id: 'dayan_c_bari',
    name: 'Dayan C (Safed 1) - Deep Heavy Boli',
    dayanSize: '5.5" - 5.75"',
    rootKey: 'C',
    octave: 3,
    expectedHz: 130.81,
    pattern: 'Pa-Sa-Sa-Sa',
    dronePreset: 'Sa-Pa',
    pluckBpm: 38,
    javari: 0.82,
    description: 'Larger, heavy timber Dayan producing a deep, solemn, resonant tone with long sustain.',
    idealFor: 'Vilambit Ektaal, Dhrupad / Pakhawaj cross-rhythms, Chayanat',
  },
  {
    id: 'dayan_dsharp_high',
    name: 'Dayan D# (Kali 2) - High Tension Solo',
    dayanSize: '5.0" - 5.15"',
    rootKey: 'D#',
    octave: 3,
    expectedHz: 155.56,
    pattern: 'Pa-Sa-Sa-Sa',
    dronePreset: 'Sa-Pa',
    pluckBpm: 52,
    javari: 0.70,
    description: 'Crisp, articulate syahi ring with fast rebound. Excels for rapid rela and drut tihais.',
    idealFor: 'Fast Rela, Tukda, Chakradar, Drut Teental',
  },
  {
    id: 'malkauns_ma_lead',
    name: 'Raga Malkauns / Chandrakauns (Ma Lead)',
    dayanSize: '5.25" (D# / C#)',
    rootKey: 'D#',
    octave: 3,
    expectedHz: 155.56,
    pattern: 'Ma-Sa-Sa-Sa',
    dronePreset: 'Sa-Ma',
    pluckBpm: 42,
    javari: 0.80,
    description: 'Crucial for ragas omitting Pa (Pancham). First string is tuned to Shuddha Madhyam (Ma).',
    idealFor: 'Malkauns, Bageshree, Chandrakauns',
  },
  {
    id: 'marwa_ni_lead',
    name: 'Raga Marwa / Puriya (Ni Lead)',
    dayanSize: '5.25" (C#)',
    rootKey: 'C#',
    octave: 3,
    expectedHz: 138.59,
    pattern: 'Ni-Sa-Sa-Sa',
    dronePreset: 'Sa-Ni',
    pluckBpm: 40,
    javari: 0.85,
    description: 'Dusk/evening ragas where the lead string must be Shuddha Nishad (Ni) to outline the severe mood.',
    idealFor: 'Raga Marwa, Puriya, Sohini, Lalit',
  },
  {
    id: 'female_vocal_gsharp',
    name: 'Female Vocal Accompaniment (G# / Kali 4)',
    dayanSize: 'Small Dayan / Tuned High',
    rootKey: 'G#',
    octave: 3,
    expectedHz: 207.65,
    pattern: 'Pa-Sa-Sa-Sa',
    dronePreset: 'Sa-Pa',
    pluckBpm: 46,
    javari: 0.75,
    description: 'Standard pitch for accompanying female classical vocalists.',
    idealFor: 'Female Thumri, Dadra, Khayal',
  },
];

interface RagaPresetsProps {
  currentKey: string;
  currentPattern: string;
  onApplyPreset: (preset: TablaRagaPreset) => void;
}

export const RagaPresets: React.FC<RagaPresetsProps> = ({ currentKey, currentPattern, onApplyPreset }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-6 bg-stone-900/60 rounded-2xl p-5 border border-stone-800">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-stone-800/80 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-stone-200 text-sm tracking-wide">
            Tabla Riyaz & Dayan Accompaniment Configurations
          </h3>
        </div>
        <span className="text-[11px] font-mono text-stone-400">
          Match your Dayan drum head size and practice context
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {TABLA_PRESETS.map((preset) => {
          const isActive = currentKey === preset.rootKey && currentPattern === preset.pattern;
          return (
            <div
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-amber-950/40 border-amber-500/60 shadow-md shadow-amber-950/30 ring-1 ring-amber-500/30'
                  : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">
                    Dayan: {preset.dayanSize}
                  </span>
                  <span className="text-xs font-mono font-black text-stone-200">
                    {preset.rootKey} • {preset.expectedHz.toFixed(1)}Hz
                  </span>
                </div>
                
                <h4 className="font-bold text-stone-100 text-xs mb-1">
                  {preset.name}
                </h4>

                <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-stone-800/60">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-amber-400 font-semibold">Lead: {preset.pattern}</span>
                  <span className="text-stone-400">{preset.pluckBpm} BPM</span>
                </div>
                <div className="text-[10px] text-stone-400 truncate">
                  <span className="text-stone-400">Ragas/Taal:</span> {preset.idealFor}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
