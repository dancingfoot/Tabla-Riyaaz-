import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Volume2, 
  Layers, 
  Compass, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { SHRUTI_22_DATA, Shruti22Item, shrutiAudio } from '../audio/shrutiEngine';

export const IndianMusicHistory: React.FC = () => {
  const [selectedShruti, setSelectedShruti] = useState<Shruti22Item | null>(null);
  const [activeHistoryEra, setActiveHistoryEra] = useState<'vedic' | 'bharata' | 'sarangadeva' | 'modern'>('bharata');

  const handleAuditionShruti = (item: Shruti22Item) => {
    setSelectedShruti(item);
    shrutiAudio.playShruti22Note(item);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm text-stone-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-black text-lg sm:text-xl text-stone-900 tracking-tight">
              Indian Classical Music Theory & History
            </h2>
            <p className="text-xs text-stone-500">
              Vedic Sama Gana • Bharata's 22 Shrutis • Sadharani PureTones Consonance Research
            </p>
          </div>
        </div>

        <a 
          href="https://puretones.sadharani.com/learn/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-xs border border-stone-200 transition-colors"
        >
          <span>Sadharani PureTones</span>
          <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
        </a>
      </div>

      {/* Historical Evolution Timeline Tabs */}
      <div className="bg-[#faf8f4] p-4 rounded-2xl border border-stone-200/80 mb-6">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-200/60">
          <span className="text-xs font-mono font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Historical Evolution of Scales & Shrutis
          </span>
          <span className="text-[11px] font-mono text-stone-500">
            3000 Years of Acoustic Lineage
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => setActiveHistoryEra('vedic')}
            className={`py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
              activeHistoryEra === 'vedic'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            1. Vedic Sama Gana (~1500 BCE)
          </button>

          <button
            onClick={() => setActiveHistoryEra('bharata')}
            className={`py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
              activeHistoryEra === 'bharata'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            2. Bharata Muni (200 BCE)
          </button>

          <button
            onClick={() => setActiveHistoryEra('sarangadeva')}
            className={`py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
              activeHistoryEra === 'sarangadeva'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            3. Sangita Ratnakara (1200 CE)
          </button>

          <button
            onClick={() => setActiveHistoryEra('modern')}
            className={`py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
              activeHistoryEra === 'modern'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            4. Bhatkhande Thaats (Modern)
          </button>
        </div>

        {/* Era Description Content */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed">
          {activeHistoryEra === 'vedic' && (
            <div>
              <h4 className="font-serif font-bold text-amber-900 text-sm mb-1.5">
                Vedic Chant & The Sama Gana Scale (~1500–1000 BCE)
              </h4>
              <p className="mb-2">
                Indian classical music finds its oldest written roots in the <em>Sama Veda</em>. The hymns were chanted in a descending melodic contour using seven tones called <strong>Svara</strong>: <em>Krushta, Prathama, Dvitiya, Tritiya, Chaturtha, Mandra,</em> and <em>Atisvarya</em>.
              </p>
              <p>
                Unlike Western scales that ascended from root to octave, Vedic chanting emphasized natural vocal descent, establishing the principle that pure musical consonances are derived from string length fractions rather than arbitrary equal temperament.
              </p>
            </div>
          )}

          {activeHistoryEra === 'bharata' && (
            <div>
              <h4 className="font-serif font-bold text-amber-900 text-sm mb-1.5">
                Bharata Muni's Natya Shastra & The Sarana Chatushtayi Experiment (~200 BCE–200 CE)
              </h4>
              <p className="mb-2">
                Bharata formulated the foundational Grama system (<em>Shadja Grama</em> and <em>Madhyama Grama</em>) and proved the existence of <strong>22 Shrutis</strong> through his famous <strong>Sarana Chatushtayi (Four-Fold Shifting)</strong> acoustic experiment.
              </p>
              <p>
                He took two identical 22-string harps (<em>Achala Vina</em> and <em>Chala Vina</em>). In the first shift, he lowered the Chala Vina by the smallest audible acoustic difference—isolating the <strong>Pramana Comma</strong> (ratio 81:80, or ~21.51 cents). Over 4 successive shift cycles, all 22 distinct microtonal shruti points across the octave were demonstrated empirically.
              </p>
            </div>
          )}

          {activeHistoryEra === 'sarangadeva' && (
            <div>
              <h4 className="font-serif font-bold text-amber-900 text-sm mb-1.5">
                Sarangadeva's Sangita Ratnakara (13th Century CE)
              </h4>
              <p className="mb-2">
                In this monumental medieval treatise, Sarangadeva categorized all 22 Shrutis by name and psychological mood into <strong>Five Jatis</strong>:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-stone-600 mb-2">
                <li><strong>Dipta (Brilliant / Radiant)</strong>: Intense, ascending overtones (e.g. Teevra Ma, Shuddha Re).</li>
                <li><strong>Ayata (Broad / Expanded)</strong>: Open, yearning expressions (e.g. Komal Re, Shuddha Dha).</li>
                <li><strong>Karuna (Compassionate / Tender)</strong>: Pathos and devotion (e.g. Komal Ga, Komal Ni).</li>
                <li><strong>Mridu (Soft / Gentle)</strong>: Delicate, subtle microtones.</li>
                <li><strong>Madhya (Central / Balanced)</strong>: Pure consonances like fundamental Sa and Pancham Pa (3:2).</li>
              </ul>
            </div>
          )}

          {activeHistoryEra === 'modern' && (
            <div>
              <h4 className="font-serif font-bold text-amber-900 text-sm mb-1.5">
                The 10 Thaats & 72 Melakartas (17th–20th Century)
              </h4>
              <p className="mb-2">
                In Carnatic music, Venkatamakhin published the mathematical <strong>72 Melakarta</strong> scheme in the <em>Chaturdandi Prakasika</em> (1660 CE), generating all permutations of 12 chromatic swaras.
              </p>
              <p>
                In North India, Pandit Vishnu Narayan Bhatkhande synthesized thousands of classical bandishes into the <strong>10 Fundamental Thaats</strong> (Bilawal, Kalyan, Khamaj, Kafi, Asavari, Bhairav, Bhairavi, Todi, Poorvi, Marwa), which form the backbone of modern classical performance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive 22-Shruti Microtonal Chart */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-1">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
              The 22 Shrutis Microtonal Explorer (Click any row to hear pitch)
            </h3>
            <p className="text-[11px] text-stone-500">
              Acoustic mathematical fractions, exact cents, and classical harmonic consonance
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Samvadi (Consonant)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Anuvadi (Assonant)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Vivadi (Dissonant)
            </span>
          </div>
        </div>

        {/* Scrollable Shruti Table */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200 max-h-96">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#faf8f4] text-stone-600 border-b border-stone-200 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Sanskrit Name</th>
                <th className="py-2.5 px-3">Swara</th>
                <th className="py-2.5 px-3">Pure Fraction</th>
                <th className="py-2.5 px-3">Cents</th>
                <th className="py-2.5 px-3">Consonance</th>
                <th className="py-2.5 px-3">Jati</th>
                <th className="py-2.5 px-3 text-right">Audition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {SHRUTI_22_DATA.map((item) => {
                const isSelected = selectedShruti?.number === item.number;
                return (
                  <tr 
                    key={item.number}
                    onClick={() => handleAuditionShruti(item)}
                    className={`transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-100/70 font-bold text-amber-950' 
                        : 'hover:bg-amber-50/50 text-stone-800'
                    }`}
                  >
                    <td className="py-2 px-3 font-bold text-stone-400">{item.number}</td>
                    <td className="py-2 px-3 font-serif font-bold text-stone-900">{item.name}</td>
                    <td className="py-2 px-3 text-amber-800 font-bold">{item.swara}</td>
                    <td className="py-2 px-3 font-semibold">{item.fractionStr}</td>
                    <td className="py-2 px-3 text-stone-600">{item.cents.toFixed(1)}¢</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        item.consonanceRole === 'Samvadi' ? 'bg-emerald-100 text-emerald-800' :
                        item.consonanceRole === 'Vadi' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        item.consonanceRole === 'Anuvadi' ? 'bg-stone-100 text-stone-700' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {item.consonanceRole}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-stone-500 text-[11px]">{item.jati}</td>
                    <td className="py-2 px-3 text-right">
                      <button className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-amber-200 text-stone-800 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer">
                        <Volume2 className="w-3 h-3 text-amber-700" /> Play
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedShruti && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono text-amber-900 flex items-center justify-between">
            <span>
              Auditioning Shruti #{selectedShruti.number}: <strong>{selectedShruti.name}</strong> ({selectedShruti.swara}) • Ratio: {selectedShruti.fractionStr} ({selectedShruti.cents}¢)
            </span>
            <span className="text-[11px] text-amber-700 font-bold">
              {selectedShruti.intervalName}
            </span>
          </div>
        )}

      </div>

    </div>
  );
};
