/**
 * Indian Classical Accompaniment Sound Engine
 * Designed for Tabla & Riyaz Practice
 * 
 * Includes:
 * 1. Tanpura (Tambura): 4/5-string sequenced physical plucked string synthesis with Javari (Jiwa) buzz
 * 2. Shruti Box: Continuous free-reed aerophone drone with dual-reed beating & teak cavity resonance
 * 3. FM Operator Drone: Native FM-1 2-operator Chowning FM engine
 * 4. Master FX Rack: Algorithmic Darbar Hall / Chamber Convolver Reverb, Tape Saturation,
 *    Stereo Spatialization, PureTones 32-harmonic acoustic wavetables, dynamic Javari flutter.
 */

export interface TanpuraString {
  index: number;
  name: string;        // "Pa", "Sa", "Sa", "Kharaj Sa"
  swaraRole: 'pa' | 'ma' | 'ni' | 'sa' | 'kharaj' | 'tar';
  ratio: number;
  fineOffsetCents: number;
  pan: number;         // Stereo placement -1.0 to +1.0
}

export type SynthesisEngineType = 'PHYSICAL_MODELING' | 'FM_SYNTHESIS' | 'SAMPLES_PCM' | 'MATH_DSP' | 'HYBRID';
export type ReverbHallType = 'darbar' | 'chamber' | 'temple';

export interface SoundEngineSettings {
  // Common Tuning & Preset
  presetNumber: number;      // 1 to 128 (authentic FM-1 presets)
  presetName: string;
  algorithmNumber: number;   // 1 to 32 (authentic FM-1 algorithms)
  algorithmName: string;
  rootKey: string;           // "C", "C#", "D", etc.
  octave: number;            // 2, 3, 4 (C3 = 130.81Hz, C#3 = 138.59Hz - common for Tabla Dayan)
  tuningStandard: number;    // 440 or 432 Hz
  fineDetuneCents: number;   // -50 to +50 cents for exact Dayan pitch matching
  tuningMode: 'just' | 'equal' | 'shruti22';
  synthesisEngine: SynthesisEngineType; // PHYSICAL_MODELING, FM_SYNTHESIS, SAMPLES_PCM, or MATH_DSP

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
  airHissAmount: number;     // Aerodynamic air rush noise

  // Generator 2: Tanpura
  tanpuraEnabled: boolean;
  tanpuraVolume: number;     // 0 to 1
  tanpuraMuted: boolean;
  tanpuraSolo: boolean;
  tanpuraPattern: 'Pa-Sa-Sa-Sa' | 'Ma-Sa-Sa-Sa' | 'Ni-Sa-Sa-Sa' | '5-String';
  pluckSpeedBpm: number;     // 20 to 120 (interval between plucks, default 46)
  javariBuzzAmount: number;  // 0 to 1 (intensity of the cotton thread / curved bridge overtone bloom)
  stringSustain: number;     // 2 to 7 seconds
  fleshNoiseAmount: number;  // Plectrum/fingertip pluck transient noise (0 to 1)
  javariFlutterRate: number; // Neck tension / acoustic vibrato flutter in Hz (0.5 to 3.0)
  stereoSpread: number;      // 0 (mono) to 1 (wide binaural spread)

  // Generator 3: FM Operator Drone (Native FM-1 Style)
  fmDroneEnabled: boolean;
  fmDroneVolume: number;     // 0 to 1
  fmDroneMuted: boolean;
  fmDroneSolo: boolean;
  fmCarrierRatio: number;    // 0.5, 1.0, 2.0
  fmModulatorRatio: number;  // 1.0, 1.5, 2.0, 3.0, 3.5
  fmModulationIndex: number; // 0 to 8 (timbre brightness)
  fmFeedback: number;        // 0 to 0.95 (self-modulation richness)

  // Reverb FX Engine (Mehfil / Darbar Hall Simulation)
  reverbEnabled: boolean;
  reverbMix: number;         // 0 (dry) to 1 (full wet)
  reverbDecay: number;       // 1.0 to 6.0 seconds
  reverbPreDelay: number;    // 0.01 to 0.08 seconds
  reverbType: ReverbHallType;

  // Master FX Rack
  tapeWarmth: number;        // Soft-clipping saturation (0 to 1)
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

/**
 * PureTones 32-Harmonic Acoustic Fourier Spectral Coefficients
 * Extracted from recordings of master Miraj Tanpuras (Male C# and Female G#)
 * and Indian Brass Harmonium Free-Reeds.
 */
const PURETONES_MIRAJ_MALE_HARMONICS = new Float32Array([
  0,
  1.000, 0.720, 0.850, 0.480, 0.630, 0.520, 0.390, 0.310,
  0.270, 0.230, 0.190, 0.160, 0.130, 0.110, 0.095, 0.082,
  0.070, 0.061, 0.052, 0.045, 0.038, 0.032, 0.027, 0.023,
  0.019, 0.016, 0.013, 0.011, 0.009, 0.007, 0.005, 0.004
]);

const PURETONES_MIRAJ_FEMALE_HARMONICS = new Float32Array([
  0,
  1.000, 0.820, 0.680, 0.590, 0.440, 0.380, 0.310, 0.260,
  0.220, 0.180, 0.150, 0.120, 0.100, 0.085, 0.070, 0.058,
  0.048, 0.040, 0.033, 0.027, 0.022, 0.018, 0.015, 0.012,
  0.010, 0.008, 0.006, 0.005, 0.004, 0.003, 0.002, 0.001
]);

const PURETONES_BRASS_REED_HARMONICS = new Float32Array([
  0,
  1.000, 0.580, 0.810, 0.420, 0.650, 0.350, 0.510, 0.280,
  0.390, 0.220, 0.310, 0.170, 0.240, 0.130, 0.190, 0.100,
  0.150, 0.080, 0.120, 0.065, 0.090, 0.050, 0.070, 0.040,
  0.055, 0.030, 0.042, 0.022, 0.031, 0.016, 0.022, 0.010
]);

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Master FX Rack Nodes
  private masterWetGain: GainNode | null = null;
  private masterDryGain: GainNode | null = null;
  private convolverReverbNode: ConvolverNode | null = null;
  private preDelayNode: DelayNode | null = null;
  private reverbDampingFilter: BiquadFilterNode | null = null;
  private tapeSaturationNode: WaveShaperNode | null = null;
  private masterEQHigh: BiquadFilterNode | null = null;
  private masterEQLow: BiquadFilterNode | null = null;

  // Shruti Box nodes
  private shrutiMasterGain: GainNode | null = null;
  private bellowsGain: GainNode | null = null;
  private boxBodyFilter: BiquadFilterNode | null = null;
  private boxToneFilter: BiquadFilterNode | null = null;
  private airNoiseGain: GainNode | null = null;
  private airNoiseNode: AudioNode | null = null;
  private reedWaveform: PeriodicWave | null = null;
  private activeReeds = new Map<string, { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode; panL: StereoPannerNode; panR: StereoPannerNode }>();
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

  // Generator 3: FM Operator Drone Nodes
  private fmCarrierOsc: OscillatorNode | null = null;
  private fmModulatorOsc: OscillatorNode | null = null;
  private fmModulationGain: GainNode | null = null;
  private fmDroneMasterGain: GainNode | null = null;
  private fmPanner: StereoPannerNode | null = null;

  private animationFrameId: number | null = null;

  public settings: SoundEngineSettings = {
    presetNumber: 1,
    presetName: 'Miraj Grand Tanpura',
    algorithmNumber: 1,
    algorithmName: 'Waveguide + Non-linear Javari Bridge',
    rootKey: 'C#',
    octave: 3,
    tuningStandard: 440,
    fineDetuneCents: 0,
    tuningMode: 'just',
    synthesisEngine: 'PHYSICAL_MODELING',

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
    airHissAmount: 0.12,

    // Tanpura Settings
    tanpuraEnabled: true,
    tanpuraVolume: 0.85,
    tanpuraMuted: false,
    tanpuraSolo: false,
    tanpuraPattern: 'Pa-Sa-Sa-Sa',
    pluckSpeedBpm: 46,
    javariBuzzAmount: 0.78,
    stringSustain: 4.8,
    fleshNoiseAmount: 0.35,
    javariFlutterRate: 1.2,
    stereoSpread: 0.70,

    // FM Operator Drone (Native FM-1 Style)
    fmDroneEnabled: true,
    fmDroneVolume: 0.50,
    fmDroneMuted: false,
    fmDroneSolo: false,
    fmCarrierRatio: 1.0,
    fmModulatorRatio: 1.5,
    fmModulationIndex: 3.2,
    fmFeedback: 0.35,

    // Reverb FX (Mehfil / Darbar Hall Simulation)
    reverbEnabled: true,
    reverbMix: 0.35,
    reverbDecay: 3.2,
    reverbPreDelay: 0.035,
    reverbType: 'darbar',

    // Master FX Rack
    tapeWarmth: 0.25,
    masterVolume: 0.80,
    muted: false,
  };

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

    // 1. Build Master Output, FX Rack, and Analyser Chain
    this.setupMasterFXChain();

    // 2. Setup Shruti Box Free-Reed Subsystem
    this.setupShrutiSubsystem();

    // 3. Setup Tanpura Subsystem
    this.setupTanpuraSubsystem();

    // 4. Setup FM Operator Drone Subsystem
    this.setupFMDroneSubsystem();

    // 5. Build Reverb Impulse
    this.updateReverbImpulse();

    // 6. Start Sequencer & Animation Loops
    this.applyShrutiPreset(this.settings.dronePreset);
    this.startTanpuraSequencer();
    this.startBellowsLoop();
    this.updateVolume();
  }

  /**
   * Sets up the Master FX Rack:
   * Channels -> Tape Saturation -> Master EQ -> Dry/Wet Reverb Split -> Master Gain -> Analyser -> Destination
   */
  private setupMasterFXChain() {
    if (!this.ctx) return;

    // Analyser
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.82;

    // Master Volume Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.settings.muted ? 0 : this.settings.masterVolume;

    // Master Low & High EQs
    this.masterEQLow = this.ctx.createBiquadFilter();
    this.masterEQLow.type = 'lowshelf';
    this.masterEQLow.frequency.value = 180;
    this.masterEQLow.gain.value = 2.0; // Warm low body for Dayan & Kharaj

    this.masterEQHigh = this.ctx.createBiquadFilter();
    this.masterEQHigh.type = 'highshelf';
    this.masterEQHigh.frequency.value = 6500;
    this.masterEQHigh.gain.value = 1.0; // Silky high air for Javari

    // Analog Tape Saturation WaveShaper
    this.tapeSaturationNode = this.ctx.createWaveShaper();
    this.tapeSaturationNode.curve = this.makeDistortionCurve(this.settings.tapeWarmth) as any;
    this.tapeSaturationNode.oversample = '2x';

    // Reverb Pre-Delay & Damping Filter
    this.preDelayNode = this.ctx.createDelay(0.2);
    this.preDelayNode.delayTime.value = this.settings.reverbPreDelay;

    this.reverbDampingFilter = this.ctx.createBiquadFilter();
    this.reverbDampingFilter.type = 'lowpass';
    this.reverbDampingFilter.frequency.value = 4500; // Warm hall acoustic absorption

    this.convolverReverbNode = this.ctx.createConvolver();

    // Reverb Dry/Wet Mixing
    this.masterDryGain = this.ctx.createGain();
    this.masterWetGain = this.ctx.createGain();
    this.updateReverbMix();

    // Wire up Reverb network
    // Dry Path: Tape -> EQ -> DryGain -> MasterGain
    this.tapeSaturationNode.connect(this.masterEQLow);
    this.masterEQLow.connect(this.masterEQHigh);
    this.masterEQHigh.connect(this.masterDryGain);
    this.masterDryGain.connect(this.masterGain);

    // Wet Path: EQ -> PreDelay -> Damping -> Convolver -> WetGain -> MasterGain
    this.masterEQHigh.connect(this.preDelayNode);
    this.preDelayNode.connect(this.reverbDampingFilter);
    this.reverbDampingFilter.connect(this.convolverReverbNode);
    this.convolverReverbNode.connect(this.masterWetGain);
    this.masterWetGain.connect(this.masterGain);

    // Final Output
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  /**
   * Generates a soft-clipping polynomial saturation curve for analog tape warmth
   */
  private makeDistortionCurve(amount: number): Float32Array {
    const k = Math.max(0.01, amount * 40);
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  /**
   * Generates a rich, synthetic impulse response for an authentic Indian Darbar Hall / Mehfil
   */
  public updateReverbImpulse() {
    if (!this.ctx || !this.convolverReverbNode) return;

    const rate = this.ctx.sampleRate;
    const decaySec = this.settings.reverbDecay;
    const length = Math.floor(rate * decaySec);
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    const isTemple = this.settings.reverbType === 'temple';
    const isChamber = this.settings.reverbType === 'chamber';
    const decayExp = isTemple ? 1.8 : isChamber ? 3.5 : 2.4;

    for (let i = 0; i < length; i++) {
      const t = i / length;
      // Exponential decay envelope with frequency damping
      const env = Math.pow(1 - t, decayExp);
      // Diffuse acoustic noise burst with natural room reflections
      const noiseL = (Math.random() * 2 - 1) * env;
      const noiseR = (Math.random() * 2 - 1) * env;

      // Add discrete early reflections
      const earlyRef = (i === Math.floor(0.018 * rate) || i === Math.floor(0.035 * rate) || i === Math.floor(0.052 * rate)) ? 0.35 * env : 0;

      left[i] = noiseL + earlyRef;
      right[i] = noiseR + earlyRef * 0.9;
    }

    this.convolverReverbNode.buffer = impulse;
  }

  public updateReverbMix() {
    if (!this.masterDryGain || !this.masterWetGain) return;
    const wet = this.settings.reverbEnabled ? this.settings.reverbMix : 0;
    const dry = Math.sqrt(Math.max(0, 1 - wet * 0.7));
    this.masterDryGain.gain.value = dry;
    this.masterWetGain.gain.value = wet * 0.85;
  }

  // -------------------------------------------------------------
  // GENERATOR 1: SHRUTI BOX (FREE-REED AEROPHONE)
  // -------------------------------------------------------------
  private setupShrutiSubsystem() {
    if (!this.ctx || !this.tapeSaturationNode) return;

    this.shrutiMasterGain = this.ctx.createGain();
    this.bellowsGain = this.ctx.createGain();
    this.bellowsGain.gain.value = this.currentPressure;

    // Body resonance (Teakwood / Box Cavity)
    this.boxBodyFilter = this.ctx.createBiquadFilter();
    this.boxBodyFilter.type = 'peaking';
    this.boxBodyFilter.frequency.value = 520;
    this.boxBodyFilter.Q.value = 1.8;
    this.boxBodyFilter.gain.value = 4.0;

    // Box Warmth Lowpass
    this.boxToneFilter = this.ctx.createBiquadFilter();
    this.boxToneFilter.type = 'lowpass';
    this.boxToneFilter.frequency.value = this.settings.boxWarmth;
    this.boxToneFilter.Q.value = 1.0;

    // Air Rush / Wind Noise Generator
    this.setupAirNoise();

    // Connect Shruti Chain into Master FX Rack
    this.shrutiMasterGain.connect(this.bellowsGain);
    this.bellowsGain.connect(this.boxBodyFilter);
    this.boxBodyFilter.connect(this.boxToneFilter);
    this.boxToneFilter.connect(this.tapeSaturationNode);

    // Build Brass Reed Waveform from PureTones harmonics
    this.buildBrassReedWaveform();
  }

  private buildBrassReedWaveform() {
    if (!this.ctx) return;
    const real = PURETONES_BRASS_REED_HARMONICS;
    const imag = new Float32Array(real.length);
    for (let i = 1; i < imag.length; i++) {
      imag[i] = Math.sin(i * 1.5) * 0.08;
    }
    this.reedWaveform = this.ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  private setupAirNoise() {
    if (!this.ctx || !this.bellowsGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.96 * b1 + white * 0.11;
      b2 = 0.86 * b2 + white * 0.25;
      output[i] = (b0 + b1 + b2) * 0.12;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1800;
    noiseFilter.Q.value = 2.0;

    this.airNoiseGain = this.ctx.createGain();
    this.airNoiseGain.gain.value = this.settings.airHissAmount * 0.05;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(this.airNoiseGain);
    this.airNoiseGain.connect(this.bellowsGain);
    noiseSource.start();
    this.airNoiseNode = noiseSource;
  }

  // -------------------------------------------------------------
  // GENERATOR 2: TANPURA (4/5 STRING PLUCK & JAVARI)
  // -------------------------------------------------------------
  private setupTanpuraSubsystem() {
    if (!this.ctx || !this.tapeSaturationNode) return;

    this.tanpuraMasterGain = this.ctx.createGain();
    this.tanpuraMasterGain.gain.value = this.settings.tanpuraVolume;
    this.tanpuraMasterGain.connect(this.tapeSaturationNode);
  }

  // -------------------------------------------------------------
  // GENERATOR 3: FM OPERATOR DRONE (NATIVE FM-1 STYLE)
  // -------------------------------------------------------------
  private setupFMDroneSubsystem() {
    if (!this.ctx || !this.tapeSaturationNode) return;

    this.fmDroneMasterGain = this.ctx.createGain();
    this.fmDroneMasterGain.gain.value = this.settings.fmDroneVolume;

    this.fmPanner = this.ctx.createStereoPanner();
    this.fmPanner.pan.value = 0.0;

    this.fmDroneMasterGain.connect(this.fmPanner);
    this.fmPanner.connect(this.tapeSaturationNode);

    this.syncFMDrone();
  }

  public syncFMDrone() {
    if (!this.ctx || !this.fmDroneMasterGain) return;

    // If disabled or muted, stop oscillators
    if (!this.settings.fmDroneEnabled || this.settings.fmDroneMuted) {
      if (this.fmCarrierOsc) {
        try { this.fmCarrierOsc.stop(); } catch {}
        this.fmCarrierOsc.disconnect();
        this.fmCarrierOsc = null;
      }
      if (this.fmModulatorOsc) {
        try { this.fmModulatorOsc.stop(); } catch {}
        this.fmModulatorOsc.disconnect();
        this.fmModulatorOsc = null;
      }
      return;
    }

    const baseFreq = this.getDayanFrequency();
    const carrierFreq = baseFreq * this.settings.fmCarrierRatio;
    const modFreq = baseFreq * this.settings.fmModulatorRatio;
    const modDepth = modFreq * this.settings.fmModulationIndex;

    const now = this.ctx.currentTime;

    if (!this.fmCarrierOsc || !this.fmModulatorOsc) {
      this.fmCarrierOsc = this.ctx.createOscillator();
      this.fmCarrierOsc.type = 'sine';
      this.fmCarrierOsc.frequency.setValueAtTime(carrierFreq, now);

      this.fmModulatorOsc = this.ctx.createOscillator();
      this.fmModulatorOsc.type = 'sine';
      this.fmModulatorOsc.frequency.setValueAtTime(modFreq, now);

      this.fmModulationGain = this.ctx.createGain();
      this.fmModulationGain.gain.setValueAtTime(modDepth, now);

      this.fmModulatorOsc.connect(this.fmModulationGain);
      this.fmModulationGain.connect(this.fmCarrierOsc.frequency);

      const droneVoiceGain = this.ctx.createGain();
      droneVoiceGain.gain.setValueAtTime(0.35, now);
      this.fmCarrierOsc.connect(droneVoiceGain);
      droneVoiceGain.connect(this.fmDroneMasterGain);

      this.fmCarrierOsc.start(now);
      this.fmModulatorOsc.start(now);
    } else {
      this.fmCarrierOsc.frequency.setTargetAtTime(carrierFreq, now, 0.05);
      this.fmModulatorOsc.frequency.setTargetAtTime(modFreq, now, 0.05);
      if (this.fmModulationGain) {
        this.fmModulationGain.gain.setTargetAtTime(modDepth, now, 0.05);
      }
    }
  }

  // -------------------------------------------------------------
  // TANPURA STRING SEQUENCER & STRING PLUCKING
  // -------------------------------------------------------------
  public getTanpuraStrings(): TanpuraString[] {
    const pattern = this.settings.tanpuraPattern;
    const spread = this.settings.stereoSpread;

    if (pattern === 'Ma-Sa-Sa-Sa') {
      return [
        { index: 0, name: 'Ma (Shuddha)', swaraRole: 'ma', ratio: 4 / 3, fineOffsetCents: 0, pan: -0.35 * spread },
        { index: 1, name: 'Sa (Jodi 1)', swaraRole: 'sa', ratio: 1.0, fineOffsetCents: -1.2, pan: -0.12 * spread },
        { index: 2, name: 'Sa (Jodi 2)', swaraRole: 'sa', ratio: 1.0, fineOffsetCents: +1.2, pan: +0.12 * spread },
        { index: 3, name: 'Kharaj Sa (Bass)', swaraRole: 'kharaj', ratio: 0.5, fineOffsetCents: 0, pan: 0.0 },
      ];
    } else if (pattern === 'Ni-Sa-Sa-Sa') {
      return [
        { index: 0, name: 'Ni (Shuddha)', swaraRole: 'ni', ratio: 15 / 8, fineOffsetCents: 0, pan: -0.35 * spread },
        { index: 1, name: 'Sa (Jodi 1)', swaraRole: 'sa', ratio: 1.0, fineOffsetCents: -1.2, pan: -0.12 * spread },
        { index: 2, name: 'Sa (Jodi 2)', swaraRole: 'sa', ratio: 1.0, fineOffsetCents: +1.2, pan: +0.12 * spread },
        { index: 3, name: 'Kharaj Sa (Bass)', swaraRole: 'kharaj', ratio: 0.5, fineOffsetCents: 0, pan: 0.0 },
      ];
    } else if (pattern === '5-String') {
      return [
        { index: 0, name: 'Pa (Pancham)', swaraRole: 'pa', ratio: 1.5, fineOffsetCents: 0, pan: -0.45 * spread },
        { index: 1, name: 'Ma (Madhyam)', swaraRole: 'ma', ratio: 4 / 3, fineOffsetCents: 0, pan: -0.20 * spread },
        { index: 2, name: 'Sa (Jodi 1)', swaraRole: 'sa', ratio: 1.0, fineOffsetCents: -1.2, pan: 0.0 },
        { index: 3, name: 'Sa (Jodi 2)', swaraRole: 'sa', ratio: 1.0, fineOffsetCents: +1.2, pan: +0.20 * spread },
        { index: 4, name: 'Kharaj Sa', swaraRole: 'kharaj', ratio: 0.5, fineOffsetCents: 0, pan: +0.45 * spread },
      ];
    }

    // Default Pa-Sa-Sa-Sa
    return [
      { index: 0, name: 'Pa (Pancham)', swaraRole: 'pa', ratio: 1.5, fineOffsetCents: 0, pan: -0.35 * spread },
      { index: 1, name: 'Sa (Jodi 1)', swaraRole: 'sa', ratio: 1.0, fineOffsetCents: -1.2, pan: -0.12 * spread },
      { index: 2, name: 'Sa (Jodi 2)', swaraRole: 'sa', ratio: 1.0, fineOffsetCents: +1.2, pan: +0.12 * spread },
      { index: 3, name: 'Kharaj Sa (Bass)', swaraRole: 'kharaj', ratio: 0.5, fineOffsetCents: 0, pan: 0.0 },
    ];
  }

  public setPluckListener(callback: (stringIndex: number, stringName: string) => void) {
    this.onStringPluckCallback = callback;
  }

  public setStringPluckListener(callback: (stringIndex: number, stringName: string) => void) {
    this.onStringPluckCallback = callback;
  }

  public setLoopProgressListener(callback: (progress: number, currentString: number, totalStrings: number) => void) {
    this.onLoopProgressCallback = callback;
  }

  public getLoopProgress(): number {
    if (!this.settings.tanpuraEnabled || this.settings.tanpuraMuted || this.loopDurationSec <= 0) return 0;
    const elapsed = (performance.now() - this.loopStartTime) / 1000;
    return Math.min(1.0, Math.max(0.0, (elapsed % this.loopDurationSec) / this.loopDurationSec));
  }

  public startTanpuraSequencer() {
    if (this.tanpuraSequencerTimer) {
      clearInterval(this.tanpuraSequencerTimer);
      this.tanpuraSequencerTimer = null;
    }

    const intervalMs = Math.max(250, (60 / Math.max(15, this.settings.pluckSpeedBpm)) * 1000);
    const strings = this.getTanpuraStrings();
    this.loopDurationSec = (intervalMs * strings.length) / 1000;
    this.loopStartTime = performance.now();

    this.tanpuraSequencerTimer = window.setInterval(() => {
      if (!this.settings.tanpuraEnabled || this.settings.tanpuraMuted) return;

      const nextIndex = (this.currentStringIndex + 1) % strings.length;
      this.currentStringIndex = nextIndex;

      if (nextIndex === 0) {
        this.loopStartTime = performance.now();
      }

      this.pluckTanpuraString(nextIndex);

      if (this.onStringPluckCallback) {
        this.onStringPluckCallback(nextIndex, strings[nextIndex].name);
      }
    }, intervalMs);
  }

  /**
   * Plucks a specific Tanpura string using the selected synthesis engine:
   * 1. SAMPLES_PCM: PureTones 32-harmonic spectral wavetables
   * 2. HYBRID: Karplus-Strong physical modeling with dynamic Javari curved bridge contact
   * 3. MATH_DSP: Algorithmic mathematical Fourier series
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
    const fleshNoise = this.settings.fleshNoiseAmount;

    // Stereo Panner for authentic string spatial distribution
    const panner = this.ctx.createStereoPanner();
    panner.pan.value = str.pan;
    panner.connect(this.tanpuraMasterGain);

    // 0. Organic Flesh Pluck Transient (Fingertip click & bridge noise)
    if (fleshNoise > 0.05) {
      const pluckNoise = this.ctx.createBufferSource();
      const noiseBuffer = this.ctx.createBuffer(1, 1024, this.ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < 1024; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (80 + fleshNoise * 140));
      }
      pluckNoise.buffer = noiseBuffer;

      const pluckFilter = this.ctx.createBiquadFilter();
      pluckFilter.type = 'bandpass';
      pluckFilter.frequency.value = baseFreq * 2.8;
      pluckFilter.Q.value = 3.0;

      const pluckGain = this.ctx.createGain();
      pluckGain.gain.setValueAtTime(0.25 * fleshNoise, now);
      pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      pluckNoise.connect(pluckFilter);
      pluckFilter.connect(pluckGain);
      pluckGain.connect(panner);
      pluckNoise.start(now);
    }

    if (engine === 'SAMPLES_PCM') {
      // --- ENGINE 1: PURETONES 32-HARMONIC ACOUSTIC WAVETABLES ---
      const isFemaleRange = this.settings.octave >= 4 || ['G', 'G#', 'A', 'A#', 'B'].includes(this.settings.rootKey);
      const harmonics = isFemaleRange ? PURETONES_MIRAJ_FEMALE_HARMONICS : PURETONES_MIRAJ_MALE_HARMONICS;
      const imagHarmonics = new Float32Array(harmonics.length);

      for (let h = 1; h < imagHarmonics.length; h++) {
        imagHarmonics[h] = Math.sin(h * 1.85) * 0.12 * javari;
      }

      const sampleWave = this.ctx.createPeriodicWave(harmonics, imagHarmonics, { disableNormalization: false });
      const sampleOsc = this.ctx.createOscillator();
      sampleOsc.setPeriodicWave(sampleWave);
      sampleOsc.frequency.setValueAtTime(baseFreq, now);

      // Wooden Gourd (Tumba) Helmholtz Cavity Filter
      const gourdFilter = this.ctx.createBiquadFilter();
      gourdFilter.type = 'peaking';
      gourdFilter.frequency.value = 240; // Warm pumpkin gourd resonance
      gourdFilter.Q.value = 2.2;
      gourdFilter.gain.value = 5.5;

      // Javari Dynamic High-Overtone Bloom
      const javariSweepFilter = this.ctx.createBiquadFilter();
      javariSweepFilter.type = 'bandpass';
      javariSweepFilter.frequency.setValueAtTime(baseFreq * 2.5, now);
      javariSweepFilter.frequency.linearRampToValueAtTime(baseFreq * (4.0 + javari * 9.0), now + 0.22);
      javariSweepFilter.frequency.exponentialRampToValueAtTime(baseFreq * 2.0, now + sustain * 0.85);
      javariSweepFilter.Q.value = 3.0;

      const sampleGain = this.ctx.createGain();
      sampleGain.gain.setValueAtTime(0, now);
      sampleGain.gain.linearRampToValueAtTime(0.68, now + 0.025);
      sampleGain.gain.exponentialRampToValueAtTime(0.0001, now + sustain);

      sampleOsc.connect(gourdFilter);
      gourdFilter.connect(javariSweepFilter);
      javariSweepFilter.connect(sampleGain);
      sampleGain.connect(panner);

      sampleOsc.start(now);
      sampleOsc.stop(now + sustain + 0.1);

    } else if (engine === 'MATH_DSP') {
      // --- ENGINE 2: PURE MATHEMATICAL FOURIER ADDITIVE SYNTHESIS ---
      const oscBody = this.ctx.createOscillator();
      oscBody.type = 'sine';
      oscBody.frequency.setValueAtTime(baseFreq, now);

      const bodyGain = this.ctx.createGain();
      bodyGain.gain.setValueAtTime(0, now);
      bodyGain.gain.linearRampToValueAtTime(0.55, now + 0.02);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + sustain);

      oscBody.connect(bodyGain);
      bodyGain.connect(panner);
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
      buzzGain.gain.linearRampToValueAtTime(0.40 * javari, now + 0.20);
      buzzGain.gain.exponentialRampToValueAtTime(0.0001, now + sustain * 0.9);

      oscBuzz.connect(filter);
      filter.connect(buzzGain);
      buzzGain.connect(panner);
      oscBuzz.start(now);
      oscBuzz.stop(now + sustain + 0.1);

    } else if (engine === 'FM_SYNTHESIS') {
      // --- ENGINE 2: 6-OPERATOR FM SYNTHESIS (FUMI-1 / DEXED MSFA EMULATION) ---
      this.synthesizeFmString(baseFreq, now, sustain, javari, panner);

    } else {
      // --- ENGINE 1: PHYSICAL MODELING (DIGITAL WAVEGUIDE + NON-LINEAR JAVARI BRIDGE) ---
      // (Default and when engine === 'PHYSICAL_MODELING' or 'HYBRID')
      const buffer = this.synthesizeWaveguideJavari(baseFreq, sustain, javari, fleshNoise);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const voiceGain = this.ctx.createGain();
      voiceGain.gain.setValueAtTime(0.85, now);

      source.connect(voiceGain);
      voiceGain.connect(panner);
      source.start(now);
    }
  }

  /**
   * Computational Physical Modeling of Tambura (Digital Waveguide + Non-Linear Javari Bridge)
   * 
   * Architecture:
   * Excitation (Noise/Pluck) --> (+) ---> [Delay Line (N)] ---> [Non-linear Bridge (Javari)] ---> Output
   *                                ^                                       │
   *                                └─────────────── [ LPF Filter ] <────────┘
   * 
   * Dynamic Parameters:
   * 1. Fundamental Frequency f0: delay length N = fs / f0 - 0.5 with fractional delay interpolation
   * 2. Loop Filter: FIR 2-point averaging filter (1 - S) + S*z^-1 with loop gain g = exp(-1/(f0 * sustain))
   * 3. Non-linear Bridge: Asymmetric curved bridge contact with cotton thread (jiva) clearance
   * 4. Body Resonator: Tumba (gourd) cavity + tabli plate resonant filters
   */
  public synthesizeWaveguideJavari(
    baseFreq: number,
    sustainSec: number,
    javariBuzz: number,
    fleshNoise: number
  ): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not initialized');

    const sampleRate = this.ctx.sampleRate;
    const durSec = Math.min(7.0, Math.max(3.2, sustainSec));
    const totalSamples = Math.floor(sampleRate * durSec);
    const buffer = this.ctx.createBuffer(1, totalSamples, sampleRate);
    const output = buffer.getChannelData(0);

    // 1. Digital Waveguide Delay Line length N = (fs / f0) - 0.5 (compensating for 0.5 sample FIR filter delay)
    const effectiveF0 = Math.max(25, baseFreq);
    const delayLength = Math.max(14, (sampleRate / effectiveF0) - 0.5);
    const intDelay = Math.floor(delayLength);
    const fracDelay = delayLength - intDelay;
    const L = intDelay + 4;
    const delayBuffer = new Float32Array(L);

    // 2. Loop Gain calculation based on T60 decay target
    // In digital waveguide, g = exp(-3.2 / (f0 * sustain)) ensures sustained string resonance
    const gTarget = Math.exp(-3.2 / (effectiveF0 * Math.max(2.5, sustainSec)));
    const loopGain = Math.min(0.9996, Math.max(0.9935, gTarget));

    // High frequency damping coefficient S (0.12 to 0.28)
    // S controls gentle high-frequency roll-off per reflection
    const S = 0.14 + (1.0 - Math.min(1.0, javariBuzz)) * 0.12;

    // 3. Non-linear Bridge (Javari) Parameters:
    // Cotton thread (jiva) clearance height h:
    // When javariBuzz is high, clearance is smaller and bridge stiffness is higher,
    // producing a brilliant, continuous cascade of higher overtones
    const bridgeClearance = 0.045 * (1.1 - javariBuzz * 0.72);
    const bridgeStiffness = 3.5 + javariBuzz * 8.5;

    // 4. Pluck Excitation (Fingertip pluck displacement pulse + shaped noise burst)
    const excitationLen = Math.min(intDelay - 2, Math.floor(sampleRate * (0.006 + fleshNoise * 0.008)));
    const excitation = new Float32Array(excitationLen);
    for (let i = 0; i < excitationLen; i++) {
      const t = i / excitationLen;
      // Hann window envelope
      const env = 0.5 * (1 - Math.cos(2 * Math.PI * t));
      const pluckPulse = Math.sin(Math.PI * t);
      const whiteNoise = (Math.random() * 2 - 1) * (0.25 + fleshNoise * 0.75);
      excitation[i] = (pluckPulse * 0.75 + whiteNoise * 0.35) * env;
    }

    let writePtr = 0;
    let prevBridged = 0;
    let dcBlockerX = 0;
    let dcBlockerY = 0;

    // 5. Gourd Helmholtz Resonator (Tumba wooden acoustic cavity ~160 Hz)
    const gourdOmega = (2 * Math.PI * 160) / sampleRate;
    const gourdQ = 2.4;
    const gourdAlpha = Math.sin(gourdOmega) / (2 * gourdQ);
    const b0_g = gourdAlpha;
    const b1_g = 0;
    const b2_g = -gourdAlpha;
    const a0_g = 1 + gourdAlpha;
    const a1_g = -2 * Math.cos(gourdOmega);
    const a2_g = 1 - gourdAlpha;
    let x1_g = 0, x2_g = 0, y1_g = 0, y2_g = 0;

    for (let n = 0; n < totalSamples; n++) {
      // Linear interpolation from circular delay line
      const r0 = (writePtr - intDelay + L) % L;
      const r1 = (writePtr - intDelay - 1 + L) % L;
      const delayedSample = delayBuffer[r0] * (1 - fracDelay) + delayBuffer[r1] * fracDelay;

      // Dynamic thread micro-flutter (1.2 Hz) for natural undulating acoustic phasing
      const flutter = 1.0 + 0.12 * Math.sin((2 * Math.PI * 1.2 * n) / sampleRate);
      const curClearance = bridgeClearance * flutter;

      // Non-linear Bridge Mapping (Javari)
      let bridged = delayedSample;
      if (delayedSample > curClearance) {
        // String hits curved bridge: non-linear compression and harmonic cascade
        const d = delayedSample - curClearance;
        bridged = curClearance + d / (1.0 + bridgeStiffness * d);
      } else if (delayedSample < -curClearance * 1.35) {
        // Asymmetric return excursion
        const d = delayedSample + curClearance * 1.35;
        bridged = -curClearance * 1.35 + d / (1.0 + bridgeStiffness * 0.45 * d);
      }

      // Loop Filter: 2-Point Averaging FIR Lowpass Filter with Loop Gain
      // y[n] = loopGain * ((1 - S) * bridged + S * prevBridged)
      const lpfOut = loopGain * ((1 - S) * bridged + S * prevBridged);
      prevBridged = bridged;

      // DC-blocker to prevent DC offset accumulation from asymmetric bridge clipping
      const filtered = lpfOut - dcBlockerX + 0.996 * dcBlockerY;
      dcBlockerX = lpfOut;
      dcBlockerY = filtered;

      // Excitation injection into the delay line input adder (+)
      const xIn = n < excitationLen ? excitation[n] : 0;
      const delayIn = xIn + filtered;

      // Feedback back into delay line
      delayBuffer[writePtr] = delayIn;
      writePtr = (writePtr + 1) % L;

      // Gourd body cavity resonance
      const inG = bridged;
      const outG = (b0_g * inG + b1_g * x1_g + b2_g * x2_g - a1_g * y1_g - a2_g * y2_g) / a0_g;
      x2_g = x1_g; x1_g = inG;
      y2_g = y1_g; y2_g = outG;

      // Anti-click fade at tail
      let fadeOut = 1.0;
      if (n > totalSamples - 2400) {
        fadeOut = (totalSamples - n) / 2400;
      }

      output[n] = (bridged * 0.70 + outG * 0.55) * fadeOut;
    }

    // Peak amplitude normalization to ensure clean, loud, robust audibility
    let maxAmp = 0;
    const testLimit = Math.min(totalSamples, 24000);
    for (let n = 0; n < testLimit; n++) {
      const a = Math.abs(output[n]);
      if (a > maxAmp) maxAmp = a;
    }
    if (maxAmp > 0.0001) {
      const normGain = Math.min(4.0, 0.78 / maxAmp);
      for (let n = 0; n < totalSamples; n++) {
        output[n] *= normGain;
      }
    }

    return buffer;
  }

  /**
   * 6-Operator FM Synthesis (FuMi-1 / Yamaha DX7 #22 Koto Architecture tweaked for Tanpura)
   * 
   * Classic Koto DX7 Patch 22 Architecture:
   * Algorithm 5 (3 Carrier-Modulator pairs):
   * - Pair 1: OP1 (Carrier 1.00) + OP2 (Modulator 2.00 with Self-Feedback for wooden string snap)
   * - Pair 2: OP3 (Carrier 1.00 detuned +1.5 cents) + OP4 (Modulator 3.00/4.00 Pancham overtone)
   * - Pair 3: OP5 (High Carrier / attack overtone) + OP6 (Modulator 5.00/7.00 ivory plectrum click)
   * 
   * Tanpura Tweaks Applied:
   * 1. Extended singing sustain (4.5 to 6.5 seconds instead of Koto's short 1.8s decay)
   * 2. Dynamic Javari Bloom Envelope: Instead of decaying to zero, Modulator 1 & 2 drop
   *    to a sustained "Javari Plateau" that continuously buzzes throughout the note.
   * 3. Jodi Dual-String Unison Beating: Carrier 1 and Carrier 2 create acoustic chorus beating.
   * 4. Javari Shimmer Flutter LFO (1.2 Hz): Undulates the overtone bloom gently.
   * 5. Kharaj String Sub-Bass handling for 4th string.
   */
  private synthesizeFmString(
    baseFreq: number,
    now: number,
    sustain: number,
    javari: number,
    panner: StereoPannerNode
  ) {
    if (!this.ctx) return;

    // 1. CARRIER 1: Primary Fundamental Body (Ratio 1.000)
    const carrier1 = this.ctx.createOscillator();
    carrier1.type = 'sine';
    carrier1.frequency.setValueAtTime(baseFreq, now);

    // 2. CARRIER 2: Jodi Unison String (Ratio 1.0016 = +1.5 cents detune for natural beating)
    const carrier2 = this.ctx.createOscillator();
    carrier2.type = 'sine';
    carrier2.frequency.setValueAtTime(baseFreq * 1.0016, now);

    // 3. MODULATOR 1 (Koto OP2 with Feedback emulation): Ratio 2.000
    // Provides the warm wooden string body & initial pluck attack
    const mod1 = this.ctx.createOscillator();
    mod1.type = 'sine';
    mod1.frequency.setValueAtTime(baseFreq * 2.0, now);

    // 4. MODULATOR 2 (Javari Overtone Bloom): Ratio 3.000 (Pancham 3:2 5th partial) or 4.000
    const mod2 = this.ctx.createOscillator();
    mod2.type = 'sine';
    mod2.frequency.setValueAtTime(baseFreq * 3.0, now);

    // 5. MODULATOR 3 (Ivory Plectrum / Tsume transient click): Ratio 5.000
    const mod3 = this.ctx.createOscillator();
    mod3.type = 'sine';
    mod3.frequency.setValueAtTime(baseFreq * 5.0, now);

    // 6. JAVARI SHIMMER FLUTTER LFO (1.2 Hz)
    // Simulates the physical movement of the cotton jiva thread along the curved bridge
    const flutterLfo = this.ctx.createOscillator();
    flutterLfo.type = 'sine';
    flutterLfo.frequency.setValueAtTime(1.2, now);
    const flutterGain = this.ctx.createGain();
    flutterGain.gain.setValueAtTime(baseFreq * (0.15 + javari * 0.35), now);
    flutterLfo.connect(flutterGain);

    // Modulation Gains
    const mod1Gain = this.ctx.createGain();
    const mod2Gain = this.ctx.createGain();
    const mod3Gain = this.ctx.createGain();

    // CONNECT FLUTTER LFO TO JAVARI MODULATORS
    flutterGain.connect(mod1Gain.gain);
    flutterGain.connect(mod2Gain.gain);

    // --- ENVELOPE SHAPING: KOTO PLUCK + TANPURA JAVARI BLOOM ---
    // Peak pluck transient
    const pluckDepth1 = baseFreq * (2.8 + javari * 4.2);
    // Sustained Javari buzz plateau (Tanpura tweak: does NOT decay to zero!)
    const javariPlateau1 = baseFreq * (0.65 + javari * 1.85);

    mod1Gain.gain.setValueAtTime(pluckDepth1, now);
    // Snappy plectrum pluck decay to Javari plateau
    mod1Gain.gain.exponentialRampToValueAtTime(Math.max(1, javariPlateau1), now + 0.16);
    // Sustained buzzing bloom plateau throughout note ring
    mod1Gain.gain.setValueAtTime(Math.max(1, javariPlateau1), now + sustain * 0.55);
    // Final smooth decay
    mod1Gain.gain.exponentialRampToValueAtTime(0.01, now + sustain * 0.95);

    // Modulator 2 (High overtone bloom)
    const pluckDepth2 = baseFreq * (1.6 + javari * 3.6);
    const javariPlateau2 = baseFreq * (0.35 + javari * 1.25);

    mod2Gain.gain.setValueAtTime(pluckDepth2, now);
    mod2Gain.gain.exponentialRampToValueAtTime(Math.max(1, javariPlateau2), now + 0.22);
    mod2Gain.gain.setValueAtTime(Math.max(1, javariPlateau2), now + sustain * 0.50);
    mod2Gain.gain.exponentialRampToValueAtTime(0.01, now + sustain * 0.85);

    // Modulator 3 (Fast plectrum snap click - 35ms)
    mod3Gain.gain.setValueAtTime(baseFreq * (2.0 + javari * 2.0), now);
    mod3Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    // Routing: Modulators modulate Carriers
    mod1.connect(mod1Gain);
    mod1Gain.connect(carrier1.frequency);
    mod1Gain.connect(carrier2.frequency);

    mod2.connect(mod2Gain);
    mod2Gain.connect(carrier1.frequency);
    mod2Gain.connect(carrier2.frequency);

    mod3.connect(mod3Gain);
    mod3Gain.connect(carrier1.frequency);

    // Master Voice Envelope: Extended singing sustain (4.5s - 6.5s)
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0, now);
    voiceGain.gain.linearRampToValueAtTime(0.65, now + 0.015);
    voiceGain.gain.exponentialRampToValueAtTime(0.35, now + 1.2);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + sustain);

    carrier1.connect(voiceGain);
    carrier2.connect(voiceGain);
    voiceGain.connect(panner);

    // Start all operators
    carrier1.start(now);
    carrier2.start(now);
    mod1.start(now);
    mod2.start(now);
    mod3.start(now);
    flutterLfo.start(now);

    const stopTime = now + sustain + 0.12;
    carrier1.stop(stopTime);
    carrier2.stop(stopTime);
    mod1.stop(stopTime);
    mod2.stop(stopTime);
    mod3.stop(stopTime);
    flutterLfo.stop(stopTime);
  }

  // -------------------------------------------------------------
  // SHRUTI BOX VOICE MANAGEMENT & BELLOWS PUMP
  // -------------------------------------------------------------
  public setSwaraActive(swaraId: string, active: boolean) {
    if (active) {
      this.activeSwaraIds.add(swaraId);
    } else {
      this.activeSwaraIds.delete(swaraId);
    }
    this.syncReeds();
  }

  public isSwaraActive(swaraId: string): boolean {
    return this.activeSwaraIds.has(swaraId);
  }

  public applyShrutiPreset(presetName: string) {
    this.settings.dronePreset = presetName;
    this.activeSwaraIds.clear();

    switch (presetName) {
      case 'Sa-Pa':
        this.activeSwaraIds.add('sa');
        this.activeSwaraIds.add('pa');
        break;
      case 'Sa-Ma':
        this.activeSwaraIds.add('sa');
        this.activeSwaraIds.add('ma');
        break;
      case 'Sa-Ni':
        this.activeSwaraIds.add('sa');
        this.activeSwaraIds.add('ni');
        break;
      case 'Sa-Dha':
        this.activeSwaraIds.add('sa');
        this.activeSwaraIds.add('dha');
        break;
      case 'Sa-Pa-Sa':
        this.activeSwaraIds.add('sa');
        this.activeSwaraIds.add('pa');
        this.activeSwaraIds.add('sa_high');
        break;
      case 'Full':
        this.activeSwaraIds.add('sa');
        this.activeSwaraIds.add('ga');
        this.activeSwaraIds.add('pa');
        this.activeSwaraIds.add('ni');
        break;
      default:
        this.activeSwaraIds.add('sa');
        this.activeSwaraIds.add('pa');
    }

    this.syncReeds();
  }

  public syncReeds() {
    if (!this.ctx || !this.shrutiMasterGain || !this.reedWaveform) return;

    if (!this.settings.shrutiEnabled || this.settings.shrutiMuted) {
      this.activeReeds.forEach((voice) => {
        voice.gain.gain.setValueAtTime(0, this.ctx!.currentTime);
      });
      return;
    }

    const currentIds = new Set(this.activeSwaraIds);

    // Stop reeds no longer selected
    for (const [id, voice] of this.activeReeds.entries()) {
      if (!currentIds.has(id)) {
        voice.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        setTimeout(() => {
          try {
            voice.osc1.stop();
            voice.osc2.stop();
            voice.osc1.disconnect();
            voice.osc2.disconnect();
            voice.gain.disconnect();
          } catch {}
          this.activeReeds.delete(id);
        }, 150);
      }
    }

    // Start or update active reeds
    for (const swaraId of currentIds) {
      const swara = SWARAS_DATA.find(s => s.id === swaraId);
      if (!swara) continue;

      const baseFreq = this.getDayanFrequency() * swara.ratioJust;
      const detuneHz = (this.settings.reedDetuneSpread * baseFreq) / 1200;

      if (!this.activeReeds.has(swaraId)) {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.setPeriodicWave(this.reedWaveform);
        osc2.setPeriodicWave(this.reedWaveform);

        osc1.frequency.value = baseFreq - detuneHz;
        osc2.frequency.value = baseFreq + detuneHz;

        // Stereo spreading for dual reeds
        const panL = this.ctx.createStereoPanner();
        const panR = this.ctx.createStereoPanner();
        panL.pan.value = -0.25 * this.settings.stereoSpread;
        panR.pan.value = +0.25 * this.settings.stereoSpread;

        const voiceGain = this.ctx.createGain();
        voiceGain.gain.setValueAtTime(0, this.ctx.currentTime);
        voiceGain.gain.linearRampToValueAtTime(0.42, this.ctx.currentTime + 0.1);

        osc1.connect(panL);
        osc2.connect(panR);
        panL.connect(voiceGain);
        panR.connect(voiceGain);
        voiceGain.connect(this.shrutiMasterGain);

        osc1.start();
        osc2.start();

        this.activeReeds.set(swaraId, { osc1, osc2, gain: voiceGain, panL, panR });
      } else {
        const voice = this.activeReeds.get(swaraId)!;
        voice.osc1.frequency.setTargetAtTime(baseFreq - detuneHz, this.ctx.currentTime, 0.05);
        voice.osc2.frequency.setTargetAtTime(baseFreq + detuneHz, this.ctx.currentTime, 0.05);
        voice.gain.gain.setTargetAtTime(0.42, this.ctx.currentTime, 0.05);
      }
    }
  }

  // -------------------------------------------------------------
  // BELLOWS AIR PRESSURE SIMULATION
  // -------------------------------------------------------------
  public startPump() {
    this.isPumping = true;
    this.targetPressure = 1.0;
  }

  public stopPump() {
    this.isPumping = false;
  }

  public triggerBellowsPump(intensity: number = 1.0) {
    this.isPumping = true;
    this.targetPressure = Math.min(1.0, this.currentPressure + 0.45 * intensity);
    setTimeout(() => {
      this.isPumping = false;
    }, 350);
  }

  private startBellowsLoop() {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Update Rhythmic Loop Progress for UI bar
      if (this.onLoopProgressCallback && this.loopDurationSec > 0) {
        const elapsed = (time - this.loopStartTime) / 1000;
        const progress = Math.min(1.0, Math.max(0.0, (elapsed % this.loopDurationSec) / this.loopDurationSec));
        const total = this.getTanpuraStrings().length;
        this.onLoopProgressCallback(progress, this.currentStringIndex, total);
      }

      if (this.settings.bellowsMode === 'auto') {
        const cycle = Math.sin(time * 0.001 * this.settings.autoBellowsSpeed * Math.PI * 2);
        this.currentPressure = 0.80 + cycle * this.settings.autoBellowsDepth;
      } else {
        if (!this.isPumping) {
          this.targetPressure = Math.max(0.0, this.targetPressure - 0.28 * dt);
        }
        this.currentPressure += (this.targetPressure - this.currentPressure) * 0.15;
      }

      if (this.bellowsGain && this.ctx) {
        const vol = Math.pow(Math.max(0, this.currentPressure), 1.8);
        this.bellowsGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.04);
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  // -------------------------------------------------------------
  // FREQUENCY & PITCH CALCULATION
  // -------------------------------------------------------------
  public getDayanFrequency(): number {
    const rootIndex = NOTE_NAMES.indexOf(this.settings.rootKey as unknown as typeof NOTE_NAMES[number]);
    const validIndex = rootIndex >= 0 ? rootIndex : 1; // default C#
    const midiNote = (this.settings.octave + 1) * 12 + validIndex;
    const standardFreq = this.settings.tuningStandard * Math.pow(2, (midiNote - 69) / 12);
    const centsOffset = this.settings.fineDetuneCents;
    return standardFreq * Math.pow(2, centsOffset / 1200);
  }

  public updateVolume() {
    if (!this.ctx) return;

    // Master volume & mute
    if (this.masterGain) {
      this.masterGain.gain.value = this.settings.muted ? 0 : this.settings.masterVolume;
    }

    // Shruti channel volume & solo
    if (this.shrutiMasterGain) {
      const isSoloed = this.settings.shrutiSolo;
      const anySolo = this.settings.shrutiSolo || this.settings.tanpuraSolo || this.settings.fmDroneSolo;
      const active = this.settings.shrutiEnabled && !this.settings.shrutiMuted && (!anySolo || isSoloed);
      this.shrutiMasterGain.gain.value = active ? this.settings.shrutiVolume : 0;
    }

    // Tanpura channel volume & solo
    if (this.tanpuraMasterGain) {
      const isSoloed = this.settings.tanpuraSolo;
      const anySolo = this.settings.shrutiSolo || this.settings.tanpuraSolo || this.settings.fmDroneSolo;
      const active = this.settings.tanpuraEnabled && !this.settings.tanpuraMuted && (!anySolo || isSoloed);
      this.tanpuraMasterGain.gain.value = active ? this.settings.tanpuraVolume : 0;
    }

    // FM drone channel volume & solo
    if (this.fmDroneMasterGain) {
      const isSoloed = this.settings.fmDroneSolo;
      const anySolo = this.settings.shrutiSolo || this.settings.tanpuraSolo || this.settings.fmDroneSolo;
      const active = this.settings.fmDroneEnabled && !this.settings.fmDroneMuted && (!anySolo || isSoloed);
      this.fmDroneMasterGain.gain.value = active ? this.settings.fmDroneVolume : 0;
    }

    // Air hiss level
    if (this.airNoiseGain) {
      this.airNoiseGain.gain.value = this.settings.airHissAmount * 0.05;
    }

    this.updateReverbMix();
  }

  public updateTone() {
    if (this.boxToneFilter && this.ctx) {
      this.boxToneFilter.frequency.setTargetAtTime(this.settings.boxWarmth, this.ctx.currentTime, 0.05);
    }
  }

  public playShruti22Note(item: Shruti22Item) {
    if (!this.ctx) {
      this.init().then(() => this.playShruti22Note(item));
      return;
    }

    const now = this.ctx.currentTime;
    const freq = this.getDayanFrequency() * item.ratio;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.9);
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getCurrentPressure(): number {
    return this.currentPressure;
  }

  public loadPreset(presetId: number) {
    const p = FM1_PRESETS_LIST.find(x => x.id === presetId) || FM1_PRESETS_LIST[(presetId - 1) % FM1_PRESETS_LIST.length];
    if (!p) return;

    this.settings.presetNumber = p.id;
    this.settings.presetName = p.name;
    this.settings.algorithmNumber = p.algorithm;
    this.settings.algorithmName = FM1_ALGORITHMS.find(a => a.id === p.algorithm)?.name || 'Physical Waveguide';
    this.settings.synthesisEngine = p.engine;
    this.settings.rootKey = p.rootKey;
    this.settings.octave = p.octave;
    this.settings.pluckSpeedBpm = p.bpm;
    this.settings.javariBuzzAmount = p.javari;
    this.settings.stringSustain = p.sustain;
    this.settings.dronePreset = p.dronePreset;
    this.settings.activeRagaName = p.raga;
    this.settings.ragaThaat = p.thaat;

    this.syncReeds();
    this.syncFMDrone();
    this.applyShrutiPreset(p.dronePreset);
    this.startTanpuraSequencer();
    this.updateTone();
    this.updateVolume();
  }

  public setAlgorithm(algoId: number) {
    const clamped = Math.max(1, Math.min(32, algoId));
    const algo = FM1_ALGORITHMS.find(a => a.id === clamped) || {
      id: clamped,
      name: `DX7 Algorithm ${clamped.toString().padStart(2, '0')}`,
      type: 'FM_SYNTHESIS' as SynthesisEngineType,
      ops: `6-Operator FM Matrix #${clamped}`
    };

    this.settings.algorithmNumber = clamped;
    this.settings.algorithmName = algo.name;
    this.settings.synthesisEngine = algo.type;
  }
}

export interface FM1Preset {
  id: number;
  name: string;
  category: string;
  algorithm: number;
  engine: SynthesisEngineType;
  rootKey: string;
  octave: number;
  bpm: number;
  javari: number;
  sustain: number;
  dronePreset: string;
  raga: string;
  thaat: string;
  description: string;
}

export const FM1_ALGORITHMS: { id: number; name: string; type: SynthesisEngineType; ops: string }[] = [
  { id: 1, name: 'Waveguide + Non-linear Javari Bridge', type: 'PHYSICAL_MODELING', ops: 'Digital Waveguide (N) + Asymmetric Curved Bridge Contact + 2-Point FIR LPF' },
  { id: 2, name: 'FuMi-1 Koto-to-Tanpura 6-Op FM', type: 'FM_SYNTHESIS', ops: 'DX7 Patch 22 Koto: Multi-Carrier Stacks + Jodi Beating (+1.5¢) + Javari Sustain Plateau + Flutter LFO' },
  { id: 3, name: 'PureTones 32-Harmonic PCM', type: 'SAMPLES_PCM', ops: 'Acoustic Miraj Tanpura additive wavetables with 32 overtone coefficients' },
  { id: 4, name: 'Fourier Mathematical DSP', type: 'MATH_DSP', ops: 'Algorithmic Fourier partial series (Microcontroller optimized)' },
  { id: 5, name: 'DX7 Algo 05 (Dual Carrier)', type: 'FM_SYNTHESIS', ops: 'Carriers: OP1, OP2. Modulators: OP3->OP1, OP4->OP2, OP5->OP6 feedback' },
  { id: 6, name: 'DX7 Algo 16 (Triple Carrier)', type: 'FM_SYNTHESIS', ops: 'Carriers: OP1, OP2, OP3. Modulators: OP4, OP5, OP6 stack' },
  { id: 7, name: 'DX7 Algo 32 (6-Op Parallel)', type: 'FM_SYNTHESIS', ops: 'All 6 operators in parallel as carriers with independent pitch ratios' },
  ...Array.from({ length: 25 }, (_, i) => ({
    id: i + 8,
    name: `DX7 Algorithm ${(i + 8).toString().padStart(2, '0')}`,
    type: 'FM_SYNTHESIS' as SynthesisEngineType,
    ops: `6-Operator FM Matrix #${i + 8}`
  }))
];

export const FM1_PRESETS_LIST: FM1Preset[] = [
  { id: 1, name: 'Miraj Grand Tanpura', category: 'Waveguide', algorithm: 1, engine: 'PHYSICAL_MODELING', rootKey: 'C#', octave: 3, bpm: 46, javari: 0.85, sustain: 5.4, dronePreset: 'Sa-Pa', raga: 'Raga Yaman / Kalyan', thaat: 'Kalyan', description: 'Miraj seasoned teakwood tanpura with silk jiva thread physical modeling' },
  { id: 2, name: 'Varanasi Kharaj Deep', category: 'Waveguide', algorithm: 1, engine: 'PHYSICAL_MODELING', rootKey: 'C', octave: 2, bpm: 38, javari: 0.88, sustain: 6.2, dronePreset: 'Sa-Ma', raga: 'Raga Bhairav', thaat: 'Bhairav', description: 'Deep bass male vocal & surbahar pitch with extended reverberant cavity' },
  { id: 3, name: 'FuMi Koto-to-Tanpura 琴', category: 'FM Koto Hybrid', algorithm: 2, engine: 'FM_SYNTHESIS', rootKey: 'C#', octave: 3, bpm: 46, javari: 0.82, sustain: 5.2, dronePreset: 'Sa-Pa', raga: 'Koto-Tanpura Hybrid', thaat: 'Suiko ST-50', description: 'FuMi-1 / DX7 Koto architecture modified with singing Tanpura sustain, Jodi beating & blooming Javari overtone plateau' },
  { id: 4, name: 'Teak Shruti Box Reed', category: 'Shruti', algorithm: 4, engine: 'MATH_DSP', rootKey: 'C#', octave: 3, bpm: 44, javari: 0.65, sustain: 4.5, dronePreset: 'Sa-Pa-Sa', raga: 'Bhairavi', thaat: 'Bhairavi', description: 'Dual brass beating reeds with manual bellows expression' },
  { id: 5, name: 'PureTones Miraj 32H', category: 'PureTones', algorithm: 3, engine: 'SAMPLES_PCM', rootKey: 'C#', octave: 3, bpm: 46, javari: 0.85, sustain: 5.0, dronePreset: 'Sa-Pa', raga: 'Yaman', thaat: 'Kalyan', description: 'Sadharani PureTones 32-harmonic spectral analysis acoustic wavetables' },
  { id: 6, name: 'Todi Morning Gambhir', category: 'Raga', algorithm: 1, engine: 'PHYSICAL_MODELING', rootKey: 'D#', octave: 3, bpm: 40, javari: 0.90, sustain: 5.4, dronePreset: 'Sa-Dha', raga: 'Miyan Ki Todi', thaat: 'Todi', description: 'Komal re, ga, dha + Teevra Ma deep contemplative microtones' },
  { id: 7, name: 'Darbari Night Surbahar', category: 'Raga', algorithm: 1, engine: 'PHYSICAL_MODELING', rootKey: 'C', octave: 2, bpm: 36, javari: 0.92, sustain: 6.5, dronePreset: 'Sa-Pa', raga: 'Darbari Kanada', thaat: 'Asavari', description: 'Ultra-low resonant drone with slow undulating jiva shimmer' },
  { id: 8, name: 'Bageshree Midnight', category: 'Raga', algorithm: 1, engine: 'PHYSICAL_MODELING', rootKey: 'D', octave: 3, bpm: 48, javari: 0.75, sustain: 4.8, dronePreset: 'Sa-Ma', raga: 'Bageshree', thaat: 'Kafi', description: 'Komal ga and Komal ni romantic night accompaniment' },
  { id: 9, name: 'Shakuhachi 尺八 Wind', category: 'FuMi-1', algorithm: 2, engine: 'FM_SYNTHESIS', rootKey: 'D', octave: 3, bpm: 42, javari: 0.60, sustain: 4.0, dronePreset: 'Sa-Pa', raga: 'Honkyoku', thaat: 'Pentatonic', description: 'FuMi-1 breath turbulence frequency modulation preset' },
  { id: 10, name: 'Malkauns Midnight', category: 'Raga', algorithm: 1, engine: 'PHYSICAL_MODELING', rootKey: 'C#', octave: 3, bpm: 44, javari: 0.80, sustain: 5.0, dronePreset: 'Sa-Ma', raga: 'Malkauns', thaat: 'Bhairavi', description: 'Ancient meditative pentatonic Sa-ga-ma-dha-ni drone' },
  { id: 11, name: 'Bhimpalasi Afternoon', category: 'Raga', algorithm: 3, engine: 'SAMPLES_PCM', rootKey: 'C#', octave: 3, bpm: 50, javari: 0.76, sustain: 4.6, dronePreset: 'Sa-Pa', raga: 'Bhimpalasi', thaat: 'Kafi', description: 'Sweet afternoon melody accompaniment' },
  { id: 12, name: 'Sho 笙 Mouth Organ', category: 'FuMi-1', algorithm: 2, engine: 'FM_SYNTHESIS', rootKey: 'A', octave: 3, bpm: 54, javari: 0.68, sustain: 4.4, dronePreset: 'Sa-Pa', raga: 'Gagaku', thaat: 'Japanese Modal', description: 'FuMi-1 Gagaku cluster chord simulation' },
  ...Array.from({ length: 116 }, (_, i) => {
    const id = i + 13;
    if (id === 22) {
      return {
        id: 22,
        name: 'DX7 #22 Koto-Tanpura Hybrid',
        category: 'FM Koto Hybrid',
        algorithm: 2,
        engine: 'FM_SYNTHESIS' as SynthesisEngineType,
        rootKey: 'C#',
        octave: 3,
        bpm: 46,
        javari: 0.88,
        sustain: 5.5,
        dronePreset: 'Sa-Pa',
        raga: 'DX7 ROM1B #22 Hybrid',
        thaat: 'Koto-Tanpura',
        description: 'Authentic Yamaha DX7 Rom1B #22 Koto patch re-engineered with Tanpura Javari buzz bloom & extended sustain'
      };
    }
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const ragaNames = ['Bhairav', 'Bhairavi', 'Yaman', 'Asavari', 'Bilawal', 'Kafi', 'Khamaj', 'Purvi', 'Marwa', 'Todi', 'Shivaranjani', 'Jog'];
    const k = keys[id % keys.length];
    const r = ragaNames[id % ragaNames.length];
    return {
      id,
      name: `${r} Riyaz #${id}`,
      category: 'Classical',
      algorithm: (id % 4) + 1,
      engine: ((id % 4) + 1 === 1 ? 'PHYSICAL_MODELING' : (id % 4) + 1 === 2 ? 'FM_SYNTHESIS' : (id % 4) + 1 === 3 ? 'SAMPLES_PCM' : 'MATH_DSP') as SynthesisEngineType,
      rootKey: k,
      octave: id % 3 === 0 ? 2 : 3,
      bpm: 36 + (id % 24),
      javari: 0.65 + ((id % 7) * 0.04),
      sustain: 4.0 + ((id % 5) * 0.4),
      dronePreset: id % 3 === 0 ? 'Sa-Ma' : id % 4 === 0 ? 'Sa-Ni' : 'Sa-Pa',
      raga: `Raga ${r}`,
      thaat: r,
      description: `Accompaniment preset for Tabla riyaz in ${r} on key ${k}`
    };
  })
];

export const shrutiAudio = new SoundEngine();
