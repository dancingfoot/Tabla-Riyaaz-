import React, { useState } from 'react';
import { 
  Music2, 
  Clock, 
  BookOpen, 
  Zap, 
  Sparkles, 
  ChevronRight,
  Info,
  Check
} from 'lucide-react';
import { shrutiAudio } from '../audio/shrutiEngine';

export interface TaalData {
  id: string;
  name: string;
  matras: number;
  vibhags: string;
  clapsPattern: string; // "X (1), 2 (5), 0 (9), 3 (13)"
  thekaBols: string[];
  preferredBpms: {
    vilambit: number; // Slow
    madhyalaya: number; // Medium
    drut: number; // Fast
  };
  suitableFor: string;
  historyAndOrigin: string;
  gharanaStyles: string;
  commonVariations: string[];
}

export const TAAL_CATALOG: TaalData[] = [
  {
    id: 'teental',
    name: 'Teental (Trital)',
    matras: 16,
    vibhags: '4 + 4 + 4 + 4',
    clapsPattern: 'Sam: 1 (X) | Tali: 5 (2), 13 (3) | Khali: 9 (0)',
    thekaBols: ['Dha', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Tin', 'Tin', 'Ta', 'Ta', 'Dhin', 'Dhin', 'Dha'],
    preferredBpms: { vilambit: 42, madhyalaya: 72, drut: 132 },
    suitableFor: 'The King of Indian Rhythms. Used for classical solo performance, Peshkar, Kaida, Rela, Gat, and vocal Khyal.',
    historyAndOrigin: 'Evolved from the ancient 16-beat Chautal and Dhrupad tradition into modern classical Tabla through Ustad Sidhar Khan (founder of the Delhi Gharana) in the early 18th century. Its 4x4 symmetrical structure represents rhythmic perfection.',
    gharanaStyles: 'Delhi (intricate finger-tip syahi work: Dha Tit, Dha Ge), Benares (heavy resonant open banyan boli: Dha Dha Din), Punjab (lightning-fast Pakhawaj-influenced relas: Dha Gena Dha Tit).',
    commonVariations: [
      'Peshkar: Dha - Dhit - / Dha Dha Tit / Dha Ge Na Tin / Ta - Tit -',
      'Delhi Kaida: Dhati Dhage Tina Kina / Tati Tage Tina Kina',
      'Drut Rela: Dhere Dhere Kite Taka / Tere Kete Taka Tire Kite'
    ]
  },
  {
    id: 'jhaptal',
    name: 'Jhaptal',
    matras: 10,
    vibhags: '2 + 3 + 2 + 3',
    clapsPattern: 'Sam: 1 (X) | Tali: 3 (2), 8 (3) | Khali: 6 (0)',
    thekaBols: ['Dhi', 'Na', 'Dhi', 'Dhi', 'Na', 'Ti', 'Na', 'Dhi', 'Dhi', 'Na'],
    preferredBpms: { vilambit: 38, madhyalaya: 64, drut: 116 },
    suitableFor: 'Solemn and majestic vocal Khayal compositions, Sadra (Dhrupad-style in Jhaptal), sitar and sarod gats.',
    historyAndOrigin: 'Derived from the Pakhawaj rhythm Jhampa Taal. Characterized by its asymmetric division (2-3-2-3), which creates a sophisticated rhythmic lilt.',
    gharanaStyles: 'Farrukhabad and Lucknow gharanas excel in Jhaptal compositions with flowing meend on the Bayan drum.',
    commonVariations: [
      'Jhaptal Kaida: Dhati Ge Na / Dhati Dhati Ge Na / Tati Ke Na / Dhati Dhati Ge Na',
      'Bedam Tihai: Dha Dha Tit Dha (x3)'
    ]
  },
  {
    id: 'rupak',
    name: 'Rupak Taal',
    matras: 7,
    vibhags: '3 + 2 + 2',
    clapsPattern: 'Sam starts on Khali: 1 (0) | Tali: 4 (1), 6 (2)',
    thekaBols: ['Tin', 'Tin', 'Na', 'Dhi', 'Na', 'Dhi', 'Na'],
    preferredBpms: { vilambit: 40, madhyalaya: 68, drut: 120 },
    suitableFor: 'Vocal Khayal, Ghazal, light classical Thumri, instrumental Vilambit & Drut gats.',
    historyAndOrigin: 'Unique in Indian music because the first beat (Sam) is traditionally played as Khali (unaccented open stroke "Tin"), creating an unforgettable floating gravity.',
    gharanaStyles: 'Ajrada and Delhi gharanas emphasize precise left-hand wrist modulation (Ghe-Ghe) on beats 4 and 6.',
    commonVariations: [
      'Ghazal Keherwa-style lilt on beats 4-7',
      'Rupak Tukda: Dha Traka Dhikit Dha (played from beat 4 to land on Sam)'
    ]
  },
  {
    id: 'ektaal',
    name: 'Ektaal',
    matras: 12,
    vibhags: '2 + 2 + 2 + 2 + 2 + 2',
    clapsPattern: 'Sam: 1 (X) | Tali: 5 (2), 9 (3), 11 (4) | Khali: 3 (0), 7 (0)',
    thekaBols: ['Dhin', 'Dhin', 'DhaGe', 'Tirakita', 'Tu', 'Na', 'Kat', 'Ta', 'DhaGe', 'Tirakita', 'Dhi', 'Na'],
    preferredBpms: { vilambit: 28, madhyalaya: 58, drut: 140 },
    suitableFor: 'Bada Khyal (Deep, slow vocal improvisation) and fast Drut bandishes. Very popular for tabla accompaniment.',
    historyAndOrigin: 'Directly adapted from Pakhawaj Chautal. In ultra-slow Ati-Vilambit (15-30 BPM), each beat carries extensive vocal ornamentation.',
    gharanaStyles: 'Kirana and Gwalior vocalists rely on Ektaal for their highest artistic expressions with deep Dayan tuning.',
    commonVariations: [
      'Vilambit Theka with open Bayan slides (Ghe Ghe)',
      'Drut Ektaal with rolling Tirakita'
    ]
  },
  {
    id: 'keherwa',
    name: 'Keherwa (Kaharwa)',
    matras: 8,
    vibhags: '4 + 4',
    clapsPattern: 'Sam: 1 (X) | Khali: 5 (0)',
    thekaBols: ['Dha', 'Ge', 'Na', 'Ti', 'Na', 'Ka', 'Dhi', 'Na'],
    preferredBpms: { vilambit: 55, madhyalaya: 95, drut: 160 },
    suitableFor: 'Folk music, Bhajans, Qawwali, Ghazals, Bollywood, and semi-classical fusion.',
    historyAndOrigin: 'Roots in ancient rural boatman songs and devotional folk traditions across North India and Punjab.',
    gharanaStyles: 'Punjab Gharana (rich syncopated accents like "Dha - Dha Tit Ta")',
    commonVariations: [
      'Bhajani Theka: Dha Dhin - Dha / Tin Tin - Ta',
      'Laggi: Fast dynamic division into 16ths (Dha-Ge-Na-Ti-Na-Ka-Dhi-Na)'
    ]
  },
  {
    id: 'dadra',
    name: 'Dadra Taal',
    matras: 6,
    vibhags: '3 + 3',
    clapsPattern: 'Sam: 1 (X) | Khali: 4 (0)',
    thekaBols: ['Dha', 'Dhi', 'Na', 'Dha', 'Tu', 'Na'],
    preferredBpms: { vilambit: 60, madhyalaya: 105, drut: 175 },
    suitableFor: 'Light classical Thumri, Dadra, Hori, Kajri, and Chaiti songs.',
    historyAndOrigin: 'Born in the royal courts of Lucknow and Varanasi as a seductive, swaying 6-beat cycle.',
    gharanaStyles: 'Benares and Lucknow gharanas feature lyrical Bayan modulations and expressive Thumri aesthetics.',
    commonVariations: [
      'Swinging Dadra: Dha - Dha Tin / Ta - Dha Dhin',
      'Fast 6/8 Chaiti groove'
    ]
  },
  {
    id: 'deepchandi',
    name: 'Deepchandi (Chachar)',
    matras: 14,
    vibhags: '3 + 4 + 3 + 4',
    clapsPattern: 'Sam: 1 (X) | Tali: 4 (2), 11 (3) | Khali: 8 (0)',
    thekaBols: ['Dha', 'Dhin', '-', 'Dha', 'Dha', 'Tin', '-', 'Ta', 'Tin', '-', 'Dha', 'Dha', 'Dhin', '-'],
    preferredBpms: { vilambit: 48, madhyalaya: 75, drut: 110 },
    suitableFor: 'Traditional romantic and festival Thumri, Holi songs, and light vocal suites.',
    historyAndOrigin: 'Characterized by the resonant pause (Khali space "-") on the 3rd, 7th, 10th, and 14th beats.',
    gharanaStyles: 'Purab Ang (Lucknow/Benares) tradition.',
    commonVariations: [
      'Chachar with delicate Syahi touches on beats 4 and 11'
    ]
  },
  {
    id: 'bhajani',
    name: 'Bhajani Taal',
    matras: 8,
    vibhags: '4 + 4',
    clapsPattern: 'Sam: 1 (X) | Khali: 5 (0)',
    thekaBols: ['Dha', 'Dhin', '-', 'Na', 'Tin', 'Tin', '-', 'Na'],
    preferredBpms: { vilambit: 65, madhyalaya: 100, drut: 150 },
    suitableFor: 'Devotional kirtans, Sufi music, and temple riyaz accompaniment.',
    historyAndOrigin: 'Direct spiritual accompaniment rhythm developed in Maharashtra and Mathura temples.',
    gharanaStyles: 'Played universally across all gharanas for devotional settings.',
    commonVariations: [
      'Khemta tempo: Fast swinging 8-beat kirtan syncopation'
    ]
  },
  {
    id: 'tilwada',
    name: 'Tilwada Taal',
    matras: 16,
    vibhags: '4 + 4 + 4 + 4',
    clapsPattern: 'Sam: 1 (X) | Tali: 5 (2), 13 (3) | Khali: 9 (0)',
    thekaBols: ['Dha', 'Tirakita', 'Dhin', 'Dha', 'Dha', 'Dha', 'Tin', 'Ta', 'Ta', 'Tirakita', 'Dhin', 'Dha', 'Dha', 'Dha', 'Dhin', 'Dha'],
    preferredBpms: { vilambit: 32, madhyalaya: 56, drut: 88 },
    suitableFor: 'Majestic Vilambit Khyal vocal accompaniment and meditative classical performance.',
    historyAndOrigin: 'Originated alongside Teental as a grand, stately variant specifically crafted for meditative slow khyal singing. The characteristic rolls of Tirakita provide rhythmic weight and dignity.',
    gharanaStyles: 'Kirana, Agra, and Gwalior vocalists frequently choose Tilwada for deeply introspective vilambit khyal.',
    commonVariations: [
      'Vilambit Tirakita rolls with subtle left-hand bayan pressure'
    ]
  }
];

export const TablaReference: React.FC = () => {
  const [selectedTaalId, setSelectedTaalId] = useState<string>('teental');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [appliedBpm, setAppliedBpm] = useState<number | null>(null);

  const currentTaal = TAAL_CATALOG.find(t => t.id === selectedTaalId) || TAAL_CATALOG[0];

  const handleApplyBpm = (bpm: number) => {
    shrutiAudio.settings.pluckSpeedBpm = bpm;
    setAppliedBpm(bpm);
    setTimeout(() => setAppliedBpm(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm text-stone-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shadow-xs">
            <Music2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-black text-lg sm:text-xl text-stone-900 tracking-tight">
              Tabla Riyaz & Taal Reference Library
            </h2>
            <p className="text-xs text-stone-500">
              Interactive Thekas, Bols, Preferred BPMs, and Historical Origins for Musicians
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHistoryModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-serif font-bold text-xs border border-amber-200/80 transition-colors cursor-pointer shadow-xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
          <span>Historical Context & Gharanas</span>
        </button>
      </div>

      {/* Taal Selection Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {TAAL_CATALOG.map((taal) => (
          <button
            key={taal.id}
            onClick={() => setSelectedTaalId(taal.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedTaalId === taal.id
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            {taal.name} ({taal.matras})
          </button>
        ))}
      </div>

      {/* Selected Taal Spotlight Card */}
      <div className="bg-[#faf8f4] rounded-2xl p-5 sm:p-6 border border-stone-200/80 mb-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-200/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {currentTaal.matras} MATRAS
              </span>
              <span className="text-xs font-mono text-stone-500">
                Vibhag: {currentTaal.vibhags}
              </span>
            </div>
            <h3 className="font-serif font-black text-xl text-stone-900">
              {currentTaal.name}
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              {currentTaal.suitableFor}
            </p>
          </div>

          {/* Preferred BPM Buttons */}
          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs flex flex-col gap-1.5 shrink-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" /> Preferred Riyaz BPM:
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleApplyBpm(currentTaal.preferredBpms.vilambit)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-800 text-[11px] font-mono font-bold transition-colors cursor-pointer"
                title="Slow tempo for detail and Syahi clarity"
              >
                Vilambit: {currentTaal.preferredBpms.vilambit}
              </button>
              <button
                onClick={() => handleApplyBpm(currentTaal.preferredBpms.madhyalaya)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-800 text-[11px] font-mono font-bold transition-colors cursor-pointer"
                title="Medium tempo for flowing Kaidas"
              >
                Madhya: {currentTaal.preferredBpms.madhyalaya}
              </button>
              <button
                onClick={() => handleApplyBpm(currentTaal.preferredBpms.drut)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-800 text-[11px] font-mono font-bold transition-colors cursor-pointer"
                title="Fast tempo for Relas and Tihais"
              >
                Drut: {currentTaal.preferredBpms.drut}
              </button>
            </div>
            {appliedBpm && (
              <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 animate-pulse">
                <Check className="w-3 h-3" /> Set Tanpura Pluck to {appliedBpm} BPM!
              </span>
            )}
          </div>
        </div>

        {/* Theka Bols Display Matrix */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500 mb-2">
            <span>THEKA STRUCTURE (CLAPS & BOLS):</span>
            <span className="text-[11px]">{currentTaal.clapsPattern}</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {currentTaal.thekaBols.map((bol, idx) => {
              const matraNum = idx + 1;
              const isSam = matraNum === 1;
              return (
                <div 
                  key={idx}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSam 
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs' 
                      : 'bg-white border-stone-200 text-stone-900'
                  }`}
                >
                  <div className={`text-[9px] font-mono font-bold ${isSam ? 'text-amber-200' : 'text-stone-400'}`}>
                    Matra {matraNum} {isSam ? '(Sam X)' : ''}
                  </div>
                  <div className="text-base font-serif font-black mt-1">
                    {bol}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice Variations & Kaidas */}
        <div>
          <span className="text-xs font-mono font-bold text-stone-700 block mb-2">
            COMMON PRACTICE VARIATIONS & THEMES:
          </span>
          <div className="space-y-1.5">
            {currentTaal.commonVariations.map((v, i) => (
              <div key={i} className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-mono text-stone-800 flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Historical Context & Gharana Styles Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-black text-lg text-stone-900">
                  Historical Roots & Gharana Lineage
                </h3>
              </div>

              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <h4 className="font-bold text-amber-900 font-serif text-sm mb-1">
                  History of {currentTaal.name}
                </h4>
                <p>{currentTaal.historyAndOrigin}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <h4 className="font-bold text-stone-900 font-serif text-sm mb-1">
                  Gharana Stylistic Treatments
                </h4>
                <p>{currentTaal.gharanaStyles}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <h4 className="font-bold text-stone-900 font-serif text-sm mb-1">
                  The Six Historic Tabla Gharanas
                </h4>
                <ul className="space-y-1 text-stone-600 list-disc pl-4 mt-1">
                  <li><strong>Delhi</strong>: The mother of all gharanas, founded by Ustad Sidhar Khan. Known for two-finger technique (*Bandh Baaj*) on the Syahi.</li>
                  <li><strong>Ajrada</strong>: Founded by Miru and Kallu Khan. Famous for complex 3-beat cross-rhythms (*Tisra Jati*) and rolling left-hand Bayan movements.</li>
                  <li><strong>Farrukhabad</strong>: Founded by Ustad Haji Vilayat Ali Khan. Known for lyrical, ornate Gat compositions and the Chalan style.</li>
                  <li><strong>Lucknow</strong>: Evolved in the royal Kathak dance court of Nawab Wajid Ali Shah. Dramatic open hand gestures (*Khula Baaj*).</li>
                  <li><strong>Benares</strong>: Founded by Pandit Ram Sahai. Heavy, resonant Pakhawaj strokes with prominent Dha Dha Din phrasing.</li>
                  <li><strong>Punjab</strong>: Founded by Lala Bhawani Das. Celebrated for fierce speed, Pakhawaj bols, and cascading relas (popularized worldwide by Ustad Alla Rakha and Zakir Hussain).</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-stone-100 text-right">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-700 text-white font-serif font-bold text-xs cursor-pointer hover:bg-amber-800"
              >
                Close Reference
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
