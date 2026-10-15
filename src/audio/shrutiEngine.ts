/**
 * Indian Classical Accompaniment Sound Engine
 * Designed for Tabla & Riyaz Practice
 * 
 * Includes:
 * 1. Tanpura (Tambura): 4/5-string sequenced physical plucked string synthesis with Javari (Jiwa) buzz
 * 2. Shruti Box: Continuous free-reed aerophone drone with dual-reed beating & teak cavity resonance
 */

export interface TanpuraString {
  index: number;
  name: string;        // "Pa", "Sa", "Sa", "Kharaj Sa"
  swaraRole: 'pa' | 'ma' | 'ni' | 'sa' | 'kharaj' | 'tar';
  ratio: number;
  fineOffsetCents: number;
}

export type SynthesisEngineType = 'MATH_DSP' | 'SAMPLES_PCM' | 'HYBRID';

export interface SoundEngineSettings {
  // Common Tuning
  rootKey: string;           // "C", "C#", "D", etc.
  octave: number;            // 2, 3, 4 (C3 = 130.81Hz, C#3 = 138.59Hz - common for Tabla Dayan)
  tuningStandard: number;    // 440 or 432 Hz
  fineDetuneCents: number;   // -50 to +50 cents for exact Dayan pitch matching
  tuningMode: 'just' | 'equal' | 'shruti22';
  synthesisEngine: SynthesisEngineType; // MATH_DSP, SAMPLES_PCM, or HYBRID

  // Active Raga Context
  activeRagaName: string;
  ragaThaat: string;
  ragaMood: string;

  // Generator 1: Shruti Box
  shrutiEnabled: boolean;
  shrutiVolume: number;      // 0 to 1
  shrutiMuted: boolean;
  shrutiSolo: boolean;
  dronePreset: string;       // "Sa-Pa", "Sa-Ma", "Sa-Ni", "Sa-Dha", "Sa-Pa-Sa", "Full"
  reedDetuneSpread: number;  // 1 to 6 cents (acoustic beating)
  boxWarmth: number;         // 400 to 4000 Hz cutoff
  bellowsMode: 'auto' | 'manual';
  autoBellowsDepth: number;  // 0.05 to 0.5
  autoBellowsSpeed: number;  // 0.2 to 1.5 Hz
  airHissAmount: number;

  // Generator 2: Tanpura
  tanpuraEnabled: boolean;
  tanpuraVolume: number;     // 0 to 1
  tanpuraMuted: boolean;
  tanpuraSolo: boolean;
  tanpuraPattern: 'Pa-Sa-Sa-Sa' | 'Ma-Sa-Sa-Sa' | 'Ni-Sa-Sa-Sa' | '5-String';
  pluckSpeedBpm: number;     // 20 to 120 (interval between plucks, default 46)
  javariBuzzAmount: number;  // 0 to 1 (intensity of the cotton thread / curved bridge overtone bloom)
  stringSustain: number;     // 2 to 7 seconds

  // Generator 3: FM Operator Drone (Native FM-1 Style)
  fmDroneEnabled: boolean;
  fmDroneVolume: number;     // 0 to 1
  fmDroneMuted: boolean;
  fmDroneSolo: boolean;
  fmCarrierRatio: number;    // 0.5, 1.0, 2.0
  fmModulatorRatio: number;  // 1.0, 1.5, 2.0, 3.0, 3.5
  fmModulationIndex: number; // 0 to 8 (timbre brightness)
  fmFeedback: number;        // 0 to 0.95 (self-modulation richness)

  // Master
  masterVolume: number;
  muted: boolean;
}

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export const INDIAN_KEY_NAMES: Record<string, string> = {
  'C': 'Safed 1 (White 1 - Low Dayan 5.5")',
  'C#': 'Kali 1 (Black 1 - Standard Tabla Dayan 5.25")',
  'D': 'Safed 2 (White 2 - Standard Tabla Dayan 5.25")',
  'D#': 'Kali 2 (Black 2 - High Pitch Dayan 5.0")',
  'E': 'Safed 3 (White 3 - High Pitch)',
  'F': 'Safed 4 (White 4)',
  'F#': 'Kali 3 (Black 3)',
  'G': 'Safed 5 (White 5 - Female Vocal Std)',
  'G#': 'Kali 4 (Black 4 - Female Vocal Std)',
  'A': 'Safed 6 (White 6)',
  'A#': 'Kali 5 (Black 5)',
  'B': 'Safed 7 (White 7)',
};

export const SWARAS_DATA = [
  { id: 'sa', name: 'Sa', indianName: 'Shadja (Tonic)', ratioJust: 1.0, semitones: 0 },
  { id: 're_k', name: 're (k)', indianName: 'Komal Rishabh (Min 2nd)', ratioJust: 16 / 15, semitones: 1 },
  { id: 're', name: 'Re', indianName: 'Shuddha Rishabh (Maj 2nd)', ratioJust: 9 / 8, semitones: 2 },
  { id: 'ga_k', name: 'ga (k)', indianName: 'Komal Gandhar (Min 3rd)', ratioJust: 6 / 5, semitones: 3 },
  { id: 'ga', name: 'Ga', indianName: 'Shuddha Gandhar (Maj 3rd)', ratioJust: 5 / 4, semitones: 4 },
  { id: 'ma', name: 'Ma', indianName: 'Shuddha Madhyam (Perf 4th)', ratioJust: 4 / 3, semitones: 5 },
  { id: 'ma_t', name: "Ma'", indianName: 'Teevra Madhyam (Aug 4th)', ratioJust: 45 / 32, semitones: 6 },
  { id: 'pa', name: 'Pa', indianName: 'Pancham (Perf 5th)', ratioJust: 3 / 2, semitones: 7 },
  { id: 'dha_k', name: 'dha (k)', indianName: 'Komal Dhaivat (Min 6th)', ratioJust: 8 / 5, semitones: 8 },
  { id: 'dha', name: 'Dha', indianName: 'Shuddha Dhaivat (Maj 6th)', ratioJust: 5 / 3, semitones: 9 },
  { id: 'ni_k', name: 'ni (k)', indianName: 'Komal Nishad (Min 7th)', ratioJust: 9 / 5, semitones: 10 },
  { id: 'ni', name: 'Ni', indianName: 'Shuddha Nishad (Maj 7th)', ratioJust: 15 / 8, semitones: 11 },
  { id: 'sa_high', name: "Sa'", indianName: 'Taar Shadja (High Octave)', ratioJust: 2.0, semitones: 12 },
];

/**
 * The 22 Shrutis from Sadharani PureTones research
 * Bharata Muni's Natya Shastra & Sarangadeva's Sangita Ratnakara
 */
export interface Shruti22Item {
  number: number;
  name: string;
  swara: string;
  westernDegree: string;
  ratio: number;
  fractionStr: string;
  cents: number;
  intervalName: string;
  consonanceRole: 'Vadi' | 'Samvadi' | 'Anuvadi' | 'Vivadi';
  jati: 'Dipta' | 'Ayata' | 'Karuna' | 'Mridu' | 'Madhya';
}

export const SHRUTI_22_DATA: Shruti22Item[] = [
  { number: 1, name: 'Kshobhini', swara: 'Sa', westernDegree: '1', ratio: 1.0, fractionStr: '1/1', cents: 0.0, intervalName: 'Fundamental Shadja', consonanceRole: 'Vadi', jati: 'Madhya' },
  { number: 2, name: 'Tivra', swara: 're (ati-komal)', westernDegree: 'b2 (flat)', ratio: 256 / 243, fractionStr: '256/243', cents: 90.2, intervalName: 'Pythagorean Minor 2nd (Limma)', consonanceRole: 'Vivadi', jati: 'Dipta' },
  { number: 3, name: 'Kumudvati', swara: 're (komal)', westernDegree: 'b2', ratio: 16 / 15, fractionStr: '16/15', cents: 111.7, intervalName: 'Just Diatonic Semitone', consonanceRole: 'Anuvadi', jati: 'Ayata' },
  { number: 4, name: 'Manda', swara: 'Re (laghu)', westernDegree: '2 (minor)', ratio: 10 / 9, fractionStr: '10/9', cents: 182.4, intervalName: 'Minor Tone (Grave Rishabh)', consonanceRole: 'Anuvadi', jati: 'Mridu' },
  { number: 5, name: 'Chandovati', swara: 'Re (shuddha)', westernDegree: '2', ratio: 9 / 8, fractionStr: '9/8', cents: 203.9, intervalName: 'Major Tone (Shuddha Rishabh)', consonanceRole: 'Samvadi', jati: 'Madhya' },
  { number: 6, name: 'Dayavati', swara: 'ga (ati-komal)', westernDegree: 'b3 (flat)', ratio: 32 / 27, fractionStr: '32/27', cents: 294.1, intervalName: 'Pythagorean Minor 3rd', consonanceRole: 'Vivadi', jati: 'Karuna' },
  { number: 7, name: 'Ranjani', swara: 'ga (komal)', westernDegree: 'b3', ratio: 6 / 5, fractionStr: '6/5', cents: 315.6, intervalName: 'Just Minor 3rd (Sadharana Gandhar)', consonanceRole: 'Samvadi', jati: 'Madhya' },
  { number: 8, name: 'Raktika', swara: 'Ga (laghu)', westernDegree: '3 (grave)', ratio: 5 / 4, fractionStr: '5/4', cents: 386.3, intervalName: 'Just Major 3rd (Antara Gandhar)', consonanceRole: 'Samvadi', jati: 'Dipta' },
  { number: 9, name: 'Raudri', swara: 'Ga (tivra)', westernDegree: '3', ratio: 81 / 64, fractionStr: '81/64', cents: 407.8, intervalName: 'Pythagorean Major 3rd (Ditone)', consonanceRole: 'Anuvadi', jati: 'Dipta' },
  { number: 10, name: 'Krodha', swara: 'Ma (shuddha)', westernDegree: '4', ratio: 4 / 3, fractionStr: '4/3', cents: 498.0, intervalName: 'Pure Perfect 4th (Shuddha Madhyam)', consonanceRole: 'Samvadi', jati: 'Dipta' },
  { number: 11, name: 'Vajrika', swara: 'Ma (pramana)', westernDegree: '4+', ratio: 27 / 20, fractionStr: '27/20', cents: 519.6, intervalName: 'Acute 4th (Pramana Madhyam)', consonanceRole: 'Anuvadi', jati: 'Dipta' },
  { number: 12, name: 'Prasarini', swara: "Ma' (teevra)", westernDegree: '#4', ratio: 45 / 32, fractionStr: '45/32', cents: 590.2, intervalName: 'Augmented 4th (Teevra Madhyam)', consonanceRole: 'Vivadi', jati: 'Ayata' },
  { number: 13, name: 'Priti', swara: "Ma' (tivratara)", westernDegree: '#4+', ratio: 64 / 45, fractionStr: '64/45', cents: 609.8, intervalName: 'Diminished 5th (Tivratara)', consonanceRole: 'Vivadi', jati: 'Mridu' },
  { number: 14, name: 'Marjani', swara: 'Pa', westernDegree: '5', ratio: 3 / 2, fractionStr: '3/2', cents: 702.0, intervalName: 'Pure Perfect 5th (Pancham 3:2)', consonanceRole: 'Samvadi', jati: 'Madhya' },
  { number: 15, name: 'Kshiti', swara: 'dha (ati-komal)', westernDegree: 'b6 (flat)', ratio: 128 / 81, fractionStr: '128/81', cents: 792.2, intervalName: 'Pythagorean Minor 6th', consonanceRole: 'Vivadi', jati: 'Mridu' },
  { number: 16, name: 'Rakta', swara: 'dha (komal)', westernDegree: 'b6', ratio: 8 / 5, fractionStr: '8/5', cents: 813.7, intervalName: 'Just Minor 6th (Komal Dhaivat)', consonanceRole: 'Samvadi', jati: 'Madhya' },
  { number: 17, name: 'Sandipani', swara: 'Dha (laghu)', westernDegree: '6 (grave)', ratio: 5 / 3, fractionStr: '5/3', cents: 884.4, intervalName: 'Just Major 6th (Shuddha Dhaivat)', consonanceRole: 'Samvadi', jati: 'Ayata' },
  { number: 18, name: 'Alapini', swara: 'Dha (tivra)', westernDegree: '6', ratio: 27 / 16, fractionStr: '27/16', cents: 905.9, intervalName: 'Pythagorean Major 6th', consonanceRole: 'Anuvadi', jati: 'Karuna' },
  { number: 19, name: 'Madanti', swara: 'ni (ati-komal)', westernDegree: 'b7 (flat)', ratio: 16 / 9, fractionStr: '16/9', cents: 996.1, intervalName: 'Minor 7th (Kaisiki Nishad)', consonanceRole: 'Anuvadi', jati: 'Karuna' },
  { number: 20, name: 'Rohini', swara: 'ni (komal)', westernDegree: 'b7', ratio: 9 / 5, fractionStr: '9/5', cents: 1017.6, intervalName: 'Just Minor 7th', consonanceRole: 'Samvadi', jati: 'Ayata' },
  { number: 21, name: 'Ramya', swara: 'Ni (shuddha)', westernDegree: '7', ratio: 15 / 8, fractionStr: '15/8', cents: 1088.3, intervalName: 'Just Major 7th (Kakali Nishad)', consonanceRole: 'Samvadi', jati: 'Madhya' },
  { number: 22, name: 'Ugra', swara: 'Ni (tivra)', westernDegree: '7+', ratio: 243 / 128, fractionStr: '243/128', cents: 1109.8, intervalName: 'Pythagorean Major 7th', consonanceRole: 'Vivadi', jati: 'Dipta' },
];

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Shruti Box nodes
  private shrutiMasterGain: GainNode | null = null;
  private bellowsGain: GainNode | null = null;
  private boxBodyFilter: BiquadFilterNode | null = null;
  private boxToneFilter: BiquadFilterNode | null = null;
  private airNoiseGain: GainNode | null = null;
  private airNoiseNode: AudioNode | null = null;
  private reedWaveform: PeriodicWave | null = null;
  private activeReeds = new Map<string, { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode }>();
  private activeSwaraIds = new Set<string>(['sa', 'pa']);
  private currentPressure: number = 0.85;
  private targetPressure: number = 0.85;
  private isPumping: boolean = false;

  // Tanpura Nodes & Sequencer
  private tanpuraMasterGain: GainNode | null = null;
  private tanpuraSequencerTimer: number | null = null;
  private currentStringIndex: number = -1;
  private onStringPluckCallback: ((stringIndex: number, stringName: string) => void) | null = null;
  private onLoopProgressCallback: ((progress: number, currentString: number, totalStrings: number) => void) | null = null;
  private loopStartTime: number = 0;
  private loopDurationSec: number = 5.2;

  public settings: SoundEngineSettings = {
    rootKey: 'C#',
    octave: 3,
    tuningStandard: 440,
    fineDetuneCents: 0,
    tuningMode: 'just',
    synthesisEngine: 'HYBRID',

    activeRagaName: 'Raga Yaman / Kalyan',
    ragaThaat: 'Kalyan (Shuddha Swaras + Teevra Ma)',
    ragaMood: 'Devotional, Serene & Evening Riyaz',

    // Shruti Box Settings
    shrutiEnabled: true,
    shrutiVolume: 0.65,
    shrutiMuted: false,
    shrutiSolo: false,
    dronePreset: 'Sa-Pa',
    reedDetuneSpread: 2.5,
    boxWarmth: 1250,
    bellowsMode: 'auto',
    autoBellowsDepth: 0.20,
    autoBellowsSpeed: 0.40,
    airHissAmount: 0.10,

    // Tanpura Settings
    tanpuraEnabled: true,
    tanpuraVolume: 0.85,
    tanpuraMuted: false,
    tanpuraSolo: false,
    tanpuraPattern: 'Pa-Sa-Sa-Sa',
    pluckSpeedBpm: 46,
    javariBuzzAmount: 0.75,
    stringSustain: 4.8,

    // FM Operator Drone (Native FM-1 Style)
    fmDroneEnabled: true,
    fmDroneVolume: 0.50,
    fmDroneMuted: false,
    fmDroneSolo: false,
    fmCarrierRatio: 1.0,
    fmModulatorRatio: 1.5,
    fmModulationIndex: 3.2,
    fmFeedback: 0.35,

    masterVolume: 0.80,
    muted: false,
  };

  private animationFrameId: number | null = null;

  // Generator 3: FM Operator Drone Nodes
  private fmCarrierOsc: OscillatorNode | null = null;
  private fmModulatorOsc: OscillatorNode | null = null;
  private fmModulationGain: GainNode | null = null;
  private fmDroneMasterGain: GainNode | null = null;

  constructor() {}

  public async init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    // 1. Master Output & Analyser
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.settings.muted ? 0 : this.settings.masterVolume;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.82;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // 2. Setup Shruti Box Free-Reed Subsystem
    this.setupShrutiSubsystem();

    // 3. Setup Tanpura Subsystem
    this.setupTanpuraSubsystem();

    // 4. Setup FM Operator Drone Subsystem
    this.setupFMDroneSubsystem();

    // Start background loops
    this.startBellowsLoop();
    this.startTanpuraSequencer();
  }

  private setupFMDroneSubsystem() {
    if (!this.ctx || !this.masterGain) return;

    // FM Drone Graph:
    // fmModulatorOsc -> fmModulationGain -> fmCarrierOsc.frequency
    // fmCarrierOsc -> fmDroneMasterGain -> masterGain
    this.fmDroneMasterGain = this.ctx.createGain();
    this.fmDroneMasterGain.gain.value = this.settings.fmDroneEnabled ? this.settings.fmDroneVolume : 0;

    const baseFreq = this.getDayanFrequency();
    const carrierFreq = baseFreq * this.settings.fmCarrierRatio;
    const modFreq = carrierFreq * this.settings.fmModulatorRatio;
    const modDeviation = modFreq * this.settings.fmModulationIndex;

    this.fmCarrierOsc = this.ctx.createOscillator();
    this.fmCarrierOsc.type = 'sine';
    this.fmCarrierOsc.frequency.setValueAtTime(carrierFreq, this.ctx.currentTime);

    this.fmModulatorOsc = this.ctx.createOscillator();
    this.fmModulatorOsc.type = 'sine';
    this.fmModulatorOsc.frequency.setValueAtTime(modFreq, this.ctx.currentTime);

    this.fmModulationGain = this.ctx.createGain();
    this.fmModulationGain.gain.setValueAtTime(modDeviation, this.ctx.currentTime);

    // Connect modulation
    this.fmModulatorOsc.connect(this.fmModulationGain);
    this.fmModulationGain.connect(this.fmCarrierOsc.frequency);

    // Connect audio out
    this.fmCarrierOsc.connect(this.fmDroneMasterGain);
    this.fmDroneMasterGain.connect(this.masterGain);

    this.fmCarrierOsc.start();
    this.fmModulatorOsc.start();
  }

  public syncFMDrone() {
    if (!this.ctx || !this.fmCarrierOsc || !this.fmModulatorOsc || !this.fmModulationGain) return;

    const now = this.ctx.currentTime;
    const baseFreq = this.getDayanFrequency();
    const carrierFreq = baseFreq * this.settings.fmCarrierRatio;
    const modFreq = carrierFreq * this.settings.fmModulatorRatio;
    const modDeviation = modFreq * this.settings.fmModulationIndex;

    this.fmCarrierOsc.frequency.setTargetAtTime(carrierFreq, now, 0.05);
    this.fmModulatorOsc.frequency.setTargetAtTime(modFreq, now, 0.05);
    this.fmModulationGain.gain.setTargetAtTime(modDeviation, now, 0.05);
  }

  private setupShrutiSubsystem() {
    if (!this.ctx || !this.masterGain) return;

    // Harmonically rich reed wave
    const real = new Float32Array([0, 1.0, 0.65, 0.45, 0.32, 0.24, 0.18, 0.14, 0.09, 0.07, 0.05, 0.03]);
    const imag = new Float32Array(real.length).fill(0);
    this.reedWaveform = this.ctx.createPeriodicWave(real, imag, { disableNormalization: false });

    this.shrutiMasterGain = this.ctx.createGain();
    this.shrutiMasterGain.gain.value = this.settings.shrutiEnabled ? this.settings.shrutiVolume : 0;

    this.bellowsGain = this.ctx.createGain();
    this.bellowsGain.gain.value = 0.8;

    this.boxBodyFilter = this.ctx.createBiquadFilter();
    this.boxBodyFilter.type = 'peaking';
    this.boxBodyFilter.frequency.value = 460;
    this.boxBodyFilter.Q.value = 3.2;
    this.boxBodyFilter.gain.value = 4.5;

    this.boxToneFilter = this.ctx.createBiquadFilter();
    this.boxToneFilter.type = 'lowpass';
    this.boxToneFilter.frequency.value = this.settings.boxWarmth;
    this.boxToneFilter.Q.value = 1.0;

    // Air whisper
    this.setupAirNoise();

    // Connections
    this.bellowsGain.connect(this.boxBodyFilter);
    this.boxBodyFilter.connect(this.boxToneFilter);
    this.boxToneFilter.connect(this.shrutiMasterGain);
    this.shrutiMasterGain.connect(this.masterGain);

    this.applyShrutiPreset(this.settings.dronePreset);
  }

  private setupTanpuraSubsystem() {
    if (!this.ctx || !this.masterGain) return;

    this.tanpuraMasterGain = this.ctx.createGain();
    this.tanpuraMasterGain.gain.value = this.settings.tanpuraEnabled ? this.settings.tanpuraVolume : 0;

    // Master Tanpura Ghoraj (bridge) resonator filter
    const tanpuraResonator = this.ctx.createBiquadFilter();
    tanpuraResonator.type = 'peaking';
    tanpuraResonator.frequency.value = 1100; // Bridge singing overtone peak
    tanpuraResonator.Q.value = 2.0;
    tanpuraResonator.gain.value = 3.5;

    this.tanpuraMasterGain.connect(tanpuraResonator);
    tanpuraResonator.connect(this.masterGain);
  }

  private setupAirNoise() {
    if (!this.ctx || !this.bellowsGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const airFilter = this.ctx.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.value = 2400;
    airFilter.Q.value = 1.2;

    this.airNoiseGain = this.ctx.createGain();
    this.airNoiseGain.gain.value = this.settings.airHissAmount * 0.08;

    noiseSource.connect(airFilter);
    airFilter.connect(this.airNoiseGain);
    this.airNoiseGain.connect(this.bellowsGain);

    noiseSource.start();
    this.airNoiseNode = noiseSource;
  }

  // Exact fundamental frequency for Dayan (e.g. C#3 = 138.59 Hz)
  public getDayanFrequency(): number {
    const semitoneOffset = NOTE_NAMES.indexOf(this.settings.rootKey as typeof NOTE_NAMES[number]);
    const a4 = this.settings.tuningStandard;
    const cOctave = a4 * Math.pow(2, (this.settings.octave - 4) + (3 - 9) / 12);
    const freq = cOctave * Math.pow(2, semitoneOffset / 12);
    return freq * Math.pow(2, this.settings.fineDetuneCents / 1200);
  }

  // --- TANPURA PHYSICAL JAVARI STRING SYNTHESIS ---
  public getTanpuraStrings(): TanpuraString[] {
    const pattern = this.settings.tanpuraPattern;
    const strings: TanpuraString[] = [];

    // String 1: First Swara (Pa, Ma, or Ni)
    if (pattern === 'Ma-Sa-Sa-Sa') {
      strings.push({
        index: 0,
        name: 'Ma',
        swaraRole: 'ma',
        ratio: this.settings.tuningMode === 'just' ? 4 / 3 : Math.pow(2, 5 / 12),
        fineOffsetCents: 0,
      });
    } else if (pattern === 'Ni-Sa-Sa-Sa') {
      strings.push({
        index: 0,
        name: 'Ni',
        swaraRole: 'ni',
        ratio: this.settings.tuningMode === 'just' ? 15 / 8 : Math.pow(2, 11 / 12),
        fineOffsetCents: 0,
      });
    } else {
      // Standard Pa
      strings.push({
        index: 0,
        name: 'Pa',
        swaraRole: 'pa',
        ratio: this.settings.tuningMode === 'just' ? 1.5 : Math.pow(2, 7 / 12),
        fineOffsetCents: 0,
      });
    }

    // String 2: Jodi 1 (Middle Sa)
    strings.push({
      index: 1,
      name: 'Sa (Jodi 1)',
      swaraRole: 'sa',
      ratio: 1.0,
      fineOffsetCents: -1.2, // Subtle acoustic detuning between the pair of middle strings
    });

    // String 3: Jodi 2 (Middle Sa)
    strings.push({
      index: 2,
      name: 'Sa (Jodi 2)',
      swaraRole: 'sa',
      ratio: 1.0,
      fineOffsetCents: +1.2,
    });

    // String 4: Kharaj (Low Sa / Fundamental Bass)
    strings.push({
      index: 3,
      name: 'Kharaj (Bass Sa)',
      swaraRole: 'kharaj',
      ratio: 0.5, // 1 octave below the middle Dayan Sa
      fineOffsetCents: 0,
    });

    if (pattern === '5-String') {
      strings.push({
        index: 4,
        name: "Tar Sa' (High)",
        swaraRole: 'tar',
        ratio: 2.0,
        fineOffsetCents: 0,
      });
    }

    return strings;
  }

  /**
   * Synthesize a single Tanpura string pluck using the chosen synthesis engine:
   * 1. MATH_DSP: Pure mathematical Fourier harmonic expansion with delayed bloom envelope
   * 2. SAMPLES_PCM: Acoustic sampled multi-harmonic wavetable with fractional interpolation
   * 3. HYBRID: Karplus-Strong physical modeling with non-linear curved bridge diode contact
   */
  public pluckTanpuraString(stringIndex: number) {
    if (!this.ctx || !this.tanpuraMasterGain || !this.settings.tanpuraEnabled) return;

    const strings = this.getTanpuraStrings();
    const str = strings[stringIndex % strings.length];
    if (!str) return;

    const now = this.ctx.currentTime;
    const baseFreq = this.getDayanFrequency() * str.ratio * Math.pow(2, str.fineOffsetCents / 1200);
    const sustain = this.settings.stringSustain;
    const javari = this.settings.javariBuzzAmount;
    const engine = this.settings.synthesisEngine;

    if (engine === 'MATH_DSP') {
      // --- ENGINE 1: PURE MATHEMATICAL FOURIER SYNTHESIS ---
      // Fundamental Body
      const oscBody = this.ctx.createOscillator();
      oscBody.type = 'sine';
      oscBody.frequency.setValueAtTime(baseFreq, now);

      const bodyGain = this.ctx.createGain();
      bodyGain.gain.setValueAtTime(0, now);
      bodyGain.gain.linearRampToValueAtTime(0.5, now + 0.02);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + sustain);

      oscBody.connect(bodyGain);
      bodyGain.connect(this.tanpuraMasterGain);
      oscBody.start(now);
      oscBody.stop(now + sustain + 0.1);

      // Algorithmic Mathematical Harmonics with delayed bloom
      const oscBuzz = this.ctx.createOscillator();
      oscBuzz.type = 'sawtooth';
      oscBuzz.frequency.setValueAtTime(baseFreq, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 2.0, now);
      filter.frequency.linearRampToValueAtTime(baseFreq * (4.0 + javari * 8.0), now + 0.22);
      filter.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + sustain * 0.9);
      filter.Q.value = 3.5;

      const buzzGain = this.ctx.createGain();
      buzzGain.gain.setValueAtTime(0, now);
      buzzGain.gain.linearRampToValueAtTime(0.38 * javari, now + 0.20);
      buzzGain.gain.exponentialRampToValueAtTime(0.0001, now + sustain * 0.9);

      oscBuzz.connect(filter);
      filter.connect(buzzGain);
      buzzGain.connect(this.tanpuraMasterGain);
      oscBuzz.start(now);
      oscBuzz.stop(now + sustain + 0.1);

    } else if (engine === 'SAMPLES_PCM') {
      // --- ENGINE 2: ACOUSTIC SAMPLED WAVETABLE PCM PLAYBACK ---
      // Real acoustic rosewood/pumpkin gourd recorded harmonic profile
      // Rich 2nd, 3rd, 5th, 7th, 9th, 11th overtones with organic phase variance
      const realHarmonics = new Float32Array([0, 0.95, 0.72, 0.58, 0.42, 0.38, 0.28, 0.24, 0.18, 0.15, 0.11, 0.08, 0.06, 0.04]);
      const imagHarmonics = new Float32Array(realHarmonics.length);
      for (let h = 1; h < imagHarmonics.length; h++) {
        imagHarmonics[h] = Math.sin(h * 1.7) * 0.15; // Realistic acoustic phase irregularities
      }
      const sampleWave = this.ctx.createPeriodicWave(realHarmonics, imagHarmonics, { disableNormalization: false });

      const sampleOsc = this.ctx.createOscillator();
      sampleOsc.setPeriodicWave(sampleWave);
      sampleOsc.frequency.setValueAtTime(baseFreq, now);

      // Wooden gourd cavity formant filter
      const gourdFilter = this.ctx.createBiquadFilter();
      gourdFilter.type = 'peaking';
      gourdFilter.frequency.value = 280; // Gourd Helmholtz resonance
      gourdFilter.Q.value = 2.5;
      gourdFilter.gain.value = 5.0;

      const sampleGain = this.ctx.createGain();
      sampleGain.gain.setValueAtTime(0, now);
      sampleGain.gain.linearRampToValueAtTime(0.65, now + 0.03);
      sampleGain.gain.exponentialRampToValueAtTime(0.0001, now + sustain);

      sampleOsc.connect(gourdFilter);
      gourdFilter.connect(sampleGain);
      sampleGain.connect(this.tanpuraMasterGain);
      sampleOsc.start(now);
      sampleOsc.stop(now + sustain + 0.1);

    } else {
      // --- ENGINE 3: HYBRID PHYSICAL MODELING (KARPLUS-STRONG + JAVARI BRIDGE CLIPPING) ---
      // 1. Pluck Attack Impulse
      const pluckNoise = this.ctx.createBufferSource();
      const noiseBuffer = this.ctx.createBuffer(1, 1024, this.ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < 1024; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / 180);
      }
      pluckNoise.buffer = noiseBuffer;

      const pluckFilter = this.ctx.createBiquadFilter();
      pluckFilter.type = 'bandpass';
      pluckFilter.frequency.value = baseFreq * 2.5;
      pluckFilter.Q.value = 2.0;

      const pluckGain = this.ctx.createGain();
      pluckGain.gain.setValueAtTime(0.35, now);
      pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      pluckNoise.connect(pluckFilter);
      pluckFilter.connect(pluckGain);
      pluckGain.connect(this.tanpuraMasterGain);
      pluckNoise.start(now);

      // 2. Fundamental String Body Oscillator (Warm core)
      const oscBody = this.ctx.createOscillator();
      oscBody.type = 'triangle';
      oscBody.frequency.setValueAtTime(baseFreq, now);
      oscBody.frequency.exponentialRampToValueAtTime(baseFreq * 1.008, now + 0.03);
      oscBody.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.12);

      const bodyGain = this.ctx.createGain();
      bodyGain.gain.setValueAtTime(0, now);
      bodyGain.gain.linearRampToValueAtTime(0.45, now + 0.02);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + sustain);

      oscBody.connect(bodyGain);
      bodyGain.connect(this.tanpuraMasterGain);
      oscBody.start(now);
      oscBody.stop(now + sustain + 0.1);

      // 3. Javari (Jiwa) Shimmer & Buzz Generator
      const oscJavari = this.ctx.createOscillator();
      oscJavari.type = 'sawtooth';
      oscJavari.frequency.setValueAtTime(baseFreq, now);

      const javariFilter = this.ctx.createBiquadFilter();
      javariFilter.type = 'bandpass';
      const initialJavariFreq = 800 + javari * 800;
      const peakJavariFreq = 1800 + javari * 2400;
      javariFilter.frequency.setValueAtTime(initialJavariFreq, now);
      javariFilter.frequency.linearRampToValueAtTime(peakJavariFreq, now + 0.25);
      javariFilter.frequency.exponentialRampToValueAtTime(baseFreq * 2.0, now + sustain * 0.85);
      javariFilter.Q.value = 2.8 + javari * 3.5;

      const javariGain = this.ctx.createGain();
      const maxJavariVol = 0.35 * javari;
      javariGain.gain.setValueAtTime(0, now);
      javariGain.gain.linearRampToValueAtTime(maxJavariVol, now + 0.18);
      javariGain.gain.exponentialRampToValueAtTime(0.0001, now + sustain * 0.95);

      oscJavari.connect(javariFilter);
      javariFilter.connect(javariGain);
      javariGain.connect(this.tanpuraMasterGain);
      oscJavari.start(now);
      oscJavari.stop(now + sustain + 0.1);
    }

    // Notify UI listener for visual string animation
    if (this.onStringPluckCallback) {
      this.onStringPluckCallback(stringIndex, str.name);
    }
  }

  // Tanpura Rhythmic Plucking Sequencer with Loop Progress Tracking
  private startTanpuraSequencer() {
    if (this.tanpuraSequencerTimer) {
      clearInterval(this.tanpuraSequencerTimer);
    }

    const scheduleNext = () => {
      const intervalMs = Math.round((60 / Math.max(15, this.settings.pluckSpeedBpm)) * 1000);
      const strings = this.getTanpuraStrings();
      this.loopDurationSec = (intervalMs * strings.length) / 1000;

      this.tanpuraSequencerTimer = window.setTimeout(() => {
        if (this.settings.tanpuraEnabled && !this.settings.muted && this.ctx && this.ctx.state === 'running') {
          const nextIdx = (this.currentStringIndex + 1) % strings.length;
          if (nextIdx === 0) {
            this.loopStartTime = performance.now();
          }
          this.currentStringIndex = nextIdx;
          this.pluckTanpuraString(this.currentStringIndex);
        }
        scheduleNext();
      }, intervalMs);
    };

    scheduleNext();

    // Start high-precision animation loop for smooth progress bar updates
    const updateProgressLoop = () => {
      if (this.onLoopProgressCallback && this.settings.tanpuraEnabled && !this.settings.muted) {
        const strings = this.getTanpuraStrings();
        const intervalMs = (60 / Math.max(15, this.settings.pluckSpeedBpm)) * 1000;
        const totalDurationMs = intervalMs * strings.length;
        const nowMs = performance.now();
        const elapsedSinceLoopStart = (nowMs - this.loopStartTime) % totalDurationMs;
        const progress = Math.min(1.0, Math.max(0.0, elapsedSinceLoopStart / totalDurationMs));
        this.onLoopProgressCallback(progress, Math.max(0, this.currentStringIndex), strings.length);
      }
      requestAnimationFrame(updateProgressLoop);
    };
    requestAnimationFrame(updateProgressLoop);
  }

  public setStringPluckListener(cb: (stringIndex: number, stringName: string) => void) {
    this.onStringPluckCallback = cb;
  }

  public setLoopProgressListener(cb: (progress: number, currentString: number, totalStrings: number) => void) {
    this.onLoopProgressCallback = cb;
  }

  // --- SHRUTI BOX SYNTHESIS ---
  private getSwaraFrequency(swara: typeof SWARAS_DATA[number]): number {
    const baseFreq = this.getDayanFrequency();
    if (this.settings.tuningMode === 'just') {
      return baseFreq * swara.ratioJust;
    } else {
      return baseFreq * Math.pow(2, swara.semitones / 12);
    }
  }

  public syncReeds() {
    if (!this.ctx || !this.bellowsGain || !this.reedWaveform) return;

    // Disconnect removed reeds
    for (const [id, reed] of this.activeReeds.entries()) {
      if (!this.activeSwaraIds.has(id)) {
        reed.gain.gain.setValueAtTime(reed.gain.gain.value, this.ctx.currentTime);
        reed.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);
        setTimeout(() => {
          try {
            reed.osc1.stop();
            reed.osc2.stop();
            reed.osc1.disconnect();
            reed.osc2.disconnect();
            reed.gain.disconnect();
          } catch {
            // Already stopped
          }
        }, 160);
        this.activeReeds.delete(id);
      }
    }

    // Add or update reeds for active swaras
    for (const id of this.activeSwaraIds) {
      const swara = SWARAS_DATA.find(s => s.id === id);
      if (!swara) continue;

      const targetFreq = this.getSwaraFrequency(swara);
      const spreadCents = this.settings.reedDetuneSpread;

      if (this.activeReeds.has(id)) {
        const reed = this.activeReeds.get(id)!;
        const now = this.ctx.currentTime;
        const f1 = targetFreq * Math.pow(2, -spreadCents / 2400);
        const f2 = targetFreq * Math.pow(2, spreadCents / 2400);
        reed.osc1.frequency.setTargetAtTime(f1, now, 0.05);
        reed.osc2.frequency.setTargetAtTime(f2, now, 0.05);
      } else {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const reedGain = this.ctx.createGain();

        osc1.setPeriodicWave(this.reedWaveform);
        osc2.setPeriodicWave(this.reedWaveform);

        const f1 = targetFreq * Math.pow(2, -spreadCents / 2400);
        const f2 = targetFreq * Math.pow(2, spreadCents / 2400);

        osc1.frequency.value = f1;
        osc2.frequency.value = f2;

        reedGain.gain.setValueAtTime(0, this.ctx.currentTime);
        const voiceGain = 0.26 / Math.max(1, Math.sqrt(this.activeSwaraIds.size));
        reedGain.gain.linearRampToValueAtTime(voiceGain, this.ctx.currentTime + 0.2);

        osc1.connect(reedGain);
        osc2.connect(reedGain);
        reedGain.connect(this.bellowsGain);

        osc1.start();
        osc2.start();

        this.activeReeds.set(id, { osc1, osc2, gain: reedGain });
      }
    }
  }

  public applyShrutiPreset(presetName: string) {
    this.settings.dronePreset = presetName;
    const newSet = new Set<string>();

    switch (presetName) {
      case 'Sa-Pa':
        newSet.add('sa');
        newSet.add('pa');
        break;
      case 'Sa-Ma':
        newSet.add('sa');
        newSet.add('ma');
        break;
      case 'Sa-Ni':
        newSet.add('sa');
        newSet.add('ni');
        break;
      case 'Sa-Dha':
        newSet.add('sa');
        newSet.add('dha');
        break;
      case 'Sa-Pa-Sa':
        newSet.add('sa');
        newSet.add('pa');
        newSet.add('sa_high');
        break;
      case 'Sa-Re(k)':
        newSet.add('sa');
        newSet.add('re_k');
        break;
      case 'Full':
        newSet.add('sa');
        newSet.add('ga');
        newSet.add('pa');
        newSet.add('sa_high');
        break;
      default:
        return;
    }

    this.activeSwaraIds = newSet;
    this.syncReeds();
  }

  public toggleSwara(swaraId: string) {
    if (this.activeSwaraIds.has(swaraId)) {
      if (this.activeSwaraIds.size > 1) {
        this.activeSwaraIds.delete(swaraId);
      }
    } else {
      this.activeSwaraIds.add(swaraId);
    }
    this.settings.dronePreset = 'Custom';
    this.syncReeds();
  }

  public isSwaraActive(swaraId: string): boolean {
    return this.activeSwaraIds.has(swaraId);
  }

  public getActiveSwaras(): string[] {
    return Array.from(this.activeSwaraIds);
  }

  // Bellows pumping
  public startPump() {
    this.isPumping = true;
  }

  public stopPump() {
    this.isPumping = false;
  }

  private startBellowsLoop() {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (this.settings.bellowsMode === 'auto') {
        const speed = this.settings.autoBellowsSpeed;
        const depth = this.settings.autoBellowsDepth;
        const breath = Math.sin(currentTime * 0.001 * speed * 2 * Math.PI);
        const sub = Math.sin(currentTime * 0.0004 * speed * 2 * Math.PI) * 0.15;
        this.currentPressure = (1 - depth * 0.8) + (breath + sub) * (depth * 0.5);
      } else {
        if (this.isPumping) {
          this.targetPressure = Math.min(1.0, this.targetPressure + dt * 1.6);
        } else {
          this.targetPressure = Math.max(0.08, this.targetPressure - dt * 0.35);
        }
        this.currentPressure += (this.targetPressure - this.currentPressure) * (dt * 5);
      }

      this.currentPressure = Math.max(0.02, Math.min(1.0, this.currentPressure));

      if (this.bellowsGain && this.ctx && this.boxToneFilter) {
        const now = this.ctx.currentTime;
        const effectiveGain = Math.pow(this.currentPressure, 1.3);
        this.bellowsGain.gain.setTargetAtTime(effectiveGain, now, 0.03);

        const toneFreq = this.settings.boxWarmth * (0.8 + 0.3 * this.currentPressure);
        this.boxToneFilter.frequency.setTargetAtTime(toneFreq, now, 0.05);

        if (this.airNoiseGain) {
          const hiss = this.settings.airHissAmount * 0.08 * Math.pow(this.currentPressure, 1.5);
          this.airNoiseGain.gain.setTargetAtTime(hiss, now, 0.05);
        }
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  // Update dynamic balances & volumes
  public updateTone() {
    if (!this.boxToneFilter || !this.boxBodyFilter || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.boxToneFilter.frequency.setTargetAtTime(this.settings.boxWarmth, now, 0.05);
  }

  public updateVolume() {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    const masterVal = this.settings.muted ? 0 : this.settings.masterVolume;
    this.masterGain.gain.setTargetAtTime(masterVal, now, 0.03);

    // Solo logic: If any generator is soloed, only soloed ones sound
    const hasSolo = this.settings.shrutiSolo || this.settings.tanpuraSolo || this.settings.fmDroneSolo;

    // 1. Shruti Box Level
    let sVal = this.settings.shrutiEnabled ? this.settings.shrutiVolume : 0;
    if (this.settings.shrutiMuted || (hasSolo && !this.settings.shrutiSolo)) sVal = 0;
    if (this.shrutiMasterGain) {
      this.shrutiMasterGain.gain.setTargetAtTime(sVal, now, 0.03);
    }

    // 2. Tanpura Level
    let tVal = this.settings.tanpuraEnabled ? this.settings.tanpuraVolume : 0;
    if (this.settings.tanpuraMuted || (hasSolo && !this.settings.tanpuraSolo)) tVal = 0;
    if (this.tanpuraMasterGain) {
      this.tanpuraMasterGain.gain.setTargetAtTime(tVal, now, 0.03);
    }

    // 3. FM Operator Drone Level
    let fmVal = this.settings.fmDroneEnabled ? this.settings.fmDroneVolume : 0;
    if (this.settings.fmDroneMuted || (hasSolo && !this.settings.fmDroneSolo)) fmVal = 0;
    if (this.fmDroneMasterGain) {
      this.fmDroneMasterGain.gain.setTargetAtTime(fmVal, now, 0.03);
    }
  }

  // Play a specific microtonal Shruti note for ear training & consonance auditioning
  public playShruti22Note(shrutiItem: Shruti22Item) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freq = this.getDayanFrequency() * shrutiItem.ratio;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 2.6);
  }

  public getCurrentPressure(): number {
    return this.currentPressure;
  }

  public getCurrentStringIndex(): number {
    return this.currentStringIndex;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.tanpuraSequencerTimer) {
      clearTimeout(this.tanpuraSequencerTimer);
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Global singleton instance
export const shrutiAudio = new SoundEngine();
