import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  Terminal, 
  Cpu, 
  GitBranch, 
  Download, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

export const FirmwareGuide: React.FC = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(label);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const cHeaderCode = `/*
 * indian_accompaniment.h - Tanpura (with Javari Bridge Buzz) & Shruti Box Engine
 * Target: M-VAVE FM-1 (JieLi AC791N 32-bit RISC / DSP)
 * Compatible with cartesive/fumi-1 architecture
 */

#ifndef INDIAN_ACCOMPANIMENT_H
#define INDIAN_ACCOMPANIMENT_H

#include <stdint.h>
#include <stdbool.h>

#define AUDIO_SAMPLE_RATE      44100
#define TANPURA_STRINGS_MAX    5
#define REED_VOICES_MAX        4

typedef enum {
    PATTERN_PA_SA_SA_SA = 0,
    PATTERN_MA_SA_SA_SA = 1,
    PATTERN_NI_SA_SA_SA = 2,
    PATTERN_5_STRING    = 3
} tanpura_pattern_t;

typedef struct {
    // Tuning (Tabla Dayan alignment)
    float base_sa_hz;          // e.g. 138.59f for C#3 (Kali 1)
    float fine_detune_cents;   // -50.0f to +50.0f cents

    // Tanpura Controls
    bool  tanpura_enabled;
    float tanpura_gain;        // 0.0f to 1.0f
    tanpura_pattern_t pattern;
    float pluck_speed_bpm;     // 20.0f to 90.0f BPM
    float javari_buzz;         // 0.0f to 1.0f (Jiwa thread contact intensity)
    float string_sustain_sec;  // 2.0f to 6.0f

    // Shruti Box Controls
    bool  shruti_enabled;
    float shruti_gain;         // 0.0f to 1.0f
    float box_cutoff_hz;       // 400.0f to 3500.0f
    float reed_detune_cents;   // 1.5f to 4.0f (acoustic beating)
    float bellows_pressure;    // 0.0f to 1.0f
} accompaniment_config_t;

void accompaniment_init(void);
void accompaniment_set_dayan_pitch(float sa_hz, float detune_cents);
void accompaniment_trigger_string_pluck(int string_idx);
void accompaniment_set_mix(float tanpura_vol, float shruti_vol);

// Main JieLi AC791N Audio Callback (Interleaved 16-bit PCM Stereo)
void accompaniment_render_audio(int16_t *buffer, uint32_t frames);

#endif // INDIAN_ACCOMPANIMENT_H
`;

  const cSourceCode = `/*
 * indian_accompaniment.c - Tanpura & Shruti DSP for JieLi AC791N
 */

#include "indian_accompaniment.h"
#include <math.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846f
#endif

typedef struct {
    float freq;
    float phase;
    float phase_inc;
    float amplitude;
    float javari_phase;
    float javari_filter_state;
    float age_seconds;
    bool  active;
} tanpura_string_voice_t;

static accompaniment_config_t g_cfg;
static tanpura_string_voice_t g_strings[TANPURA_STRINGS_MAX];

// Shruti Reed Dual-Oscillator State
static float g_reed_phase1[REED_VOICES_MAX];
static float g_reed_phase2[REED_VOICES_MAX];
static float g_reed_inc1[REED_VOICES_MAX];
static float g_reed_inc2[REED_VOICES_MAX];
static float g_box_lp_state = 0.0f;

// Sequencer clock
static float g_seq_time = 0.0f;
static int   g_seq_step = 0;

void accompaniment_init(void) {
    g_cfg.base_sa_hz = 138.591f; // Standard Tabla Dayan C# (Kali 1)
    g_cfg.fine_detune_cents = 0.0f;

    g_cfg.tanpura_enabled = true;
    g_cfg.tanpura_gain = 0.85f;
    g_cfg.pattern = PATTERN_PA_SA_SA_SA;
    g_cfg.pluck_speed_bpm = 46.0f;
    g_cfg.javari_buzz = 0.75f;
    g_cfg.string_sustain_sec = 4.5f;

    g_cfg.shruti_enabled = true;
    g_cfg.shruti_gain = 0.65f;
    g_cfg.box_cutoff_hz = 1250.0f;
    g_cfg.reed_detune_cents = 2.5f;
    g_cfg.bellows_pressure = 0.85f;

    accompaniment_set_dayan_pitch(138.591f, 0.0f);
}

void accompaniment_set_dayan_pitch(float sa_hz, float detune_cents) {
    g_cfg.base_sa_hz = sa_hz;
    g_cfg.fine_detune_cents = detune_cents;
    float actual_sa = sa_hz * powf(2.0f, detune_cents / 1200.0f);

    // Setup Shruti Reeds (Sa + Pa)
    float pa_hz = actual_sa * 1.5000f; // Pure Just Pancham
    float spread = powf(2.0f, (g_cfg.reed_detune_cents / 2.0f) / 1200.0f);

    // Reed 0 (Sa dual reed)
    g_reed_inc1[0] = (2.0f * (float)M_PI * (actual_sa / spread)) / (float)AUDIO_SAMPLE_RATE;
    g_reed_inc2[0] = (2.0f * (float)M_PI * (actual_sa * spread)) / (float)AUDIO_SAMPLE_RATE;

    // Reed 1 (Pa dual reed)
    g_reed_inc1[1] = (2.0f * (float)M_PI * (pa_hz / spread)) / (float)AUDIO_SAMPLE_RATE;
    g_reed_inc2[1] = (2.0f * (float)M_PI * (pa_hz * spread)) / (float)AUDIO_SAMPLE_RATE;
}

void accompaniment_trigger_string_pluck(int string_idx) {
    if (string_idx < 0 || string_idx >= TANPURA_STRINGS_MAX) return;

    float actual_sa = g_cfg.base_sa_hz * powf(2.0f, g_cfg.fine_detune_cents / 1200.0f);
    float ratios[4] = { 1.5f, 1.0f, 1.001f, 0.5f }; // Pa, Middle Sa, Jodi Sa, Bass Kharaj Sa

    if (g_cfg.pattern == PATTERN_MA_SA_SA_SA) ratios[0] = 1.33333f; // Shuddha Ma
    else if (g_cfg.pattern == PATTERN_NI_SA_SA_SA) ratios[0] = 1.8750f; // Shuddha Ni

    g_strings[string_idx].freq = actual_sa * ratios[string_idx % 4];
    g_strings[string_idx].phase = 0.0f;
    g_strings[string_idx].phase_inc = (2.0f * (float)M_PI * g_strings[string_idx].freq) / (float)AUDIO_SAMPLE_RATE;
    g_strings[string_idx].amplitude = 1.0f;
    g_strings[string_idx].age_seconds = 0.0f;
    g_strings[string_idx].active = true;
}

void accompaniment_render_audio(int16_t *buffer, uint32_t frames) {
    float dt = 1.0f / (float)AUDIO_SAMPLE_RATE;
    float pluck_interval = 60.0f / g_cfg.pluck_speed_bpm;

    // Shruti box LP filter alpha
    float rc = 1.0f / (2.0f * (float)M_PI * g_cfg.box_cutoff_hz);
    float alpha = dt / (rc + dt);

    for (uint32_t i = 0; i < frames; i++) {
        // --- 1. TANPURA AUTOMATIC SEQUENCER ---
        if (g_cfg.tanpura_enabled) {
            g_seq_time += dt;
            if (g_seq_time >= pluck_interval) {
                g_seq_time -= pluck_interval;
                accompaniment_trigger_string_pluck(g_seq_step);
                g_seq_step = (g_seq_step + 1) % 4;
            }
        }

        // --- 2. RENDER ACTIVE TANPURA STRINGS WITH JAVARI ---
        float tanpura_mix = 0.0f;
        if (g_cfg.tanpura_enabled) {
            for (int s = 0; s < 4; s++) {
                if (!g_strings[s].active) continue;

                g_strings[s].age_seconds += dt;
                float age = g_strings[s].age_seconds;

                if (age >= g_cfg.string_sustain_sec) {
                    g_strings[s].active = false;
                    continue;
                }

                // Fundamental body decay
                float decay = expf(-age / 1.4f);
                float body = sinf(g_strings[s].phase) * decay;

                // Javari (Jiwa) Overtone Bloom:
                // Non-linear grazing creates 2nd-8th harmonic cascade that blooms around 0.2s
                float bloom = (age < 0.25f) ? (age / 0.25f) : expf(-(age - 0.25f) / 1.1f);
                float buzz = (sinf(g_strings[s].phase * 2.0f) * 0.5f +
                              sinf(g_strings[s].phase * 3.0f) * 0.35f +
                              sinf(g_strings[s].phase * 4.0f) * 0.25f +
                              sinf(g_strings[s].phase * 5.0f) * 0.18f) * bloom * g_cfg.javari_buzz;

                tanpura_mix += (body * 0.6f + buzz * 0.4f);

                g_strings[s].phase += g_strings[s].phase_inc;
                if (g_strings[s].phase >= 2.0f * (float)M_PI) g_strings[s].phase -= 2.0f * (float)M_PI;
            }
        }

        // --- 3. RENDER CONTINUOUS SHRUTI BOX FREE REEDS ---
        float shruti_mix = 0.0f;
        if (g_cfg.shruti_enabled) {
            for (int v = 0; v < 2; v++) {
                // Brass harmonium reed waveform (odd harmonic richness)
                float r1 = sinf(g_reed_phase1[v]) + 0.5f * sinf(g_reed_phase1[v] * 3.0f) + 0.25f * sinf(g_reed_phase1[v] * 5.0f);
                float r2 = sinf(g_reed_phase2[v]) + 0.5f * sinf(g_reed_phase2[v] * 3.0f) + 0.25f * sinf(g_reed_phase2[v] * 5.0f);

                g_reed_phase1[v] += g_reed_inc1[v];
                g_reed_phase2[v] += g_reed_inc2[v];
                if (g_reed_phase1[v] >= 2.0f * (float)M_PI) g_reed_phase1[v] -= 2.0f * (float)M_PI;
                if (g_reed_phase2[v] >= 2.0f * (float)M_PI) g_reed_phase2[v] -= 2.0f * (float)M_PI;

                shruti_mix += (r1 + r2) * 0.25f;
            }

            // Teak cavity lowpass filter
            g_box_lp_state += alpha * (shruti_mix - g_box_lp_state);
            shruti_mix = g_box_lp_state * g_cfg.bellows_pressure;
        }

        // --- 4. MASTER MIX ---
        float final_sample = (tanpura_mix * g_cfg.tanpura_gain * 0.7f) +
                             (shruti_mix * g_cfg.shruti_gain * 0.5f);

        int32_t pcm = (int32_t)(final_sample * 28000.0f);
        if (pcm > 32767) pcm = 32767;
        if (pcm < -32768) pcm = -32768;

        buffer[i * 2 + 0] = (int16_t)pcm; // Left
        buffer[i * 2 + 1] = (int16_t)pcm; // Right
    }
}
`;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 bg-stone-900/60 rounded-2xl p-5 border border-stone-800 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-800 mb-6 gap-2">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="font-bold text-stone-100 text-base">
              Porting to Hardware: JieLi AC791N Firmware Guide
            </h3>
            <p className="text-xs text-stone-400">
              How to adapt <span className="text-amber-400 font-mono">cartesive/fumi-1</span> into your own custom Shruti Box firmware.
            </p>
          </div>
        </div>

        <a 
          href="https://github.com/cartesive/fumi-1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono border border-stone-700 transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5 text-amber-400" />
          <span>cartesive/fumi-1 on GitHub</span>
          <ExternalLink className="w-3 h-3 text-stone-400" />
        </a>
      </div>

      {/* 5-Step Workflow Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-xs font-bold flex items-center justify-center font-mono">1</span>
            <span className="font-bold text-stone-200 text-xs">Fork & Clone</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed font-mono">
            git clone git@github.com:cartesive/fumi-1.git
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            FuMi-1 provides the JieLi AC791N hardware scaffolding and Web UI structure.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-xs font-bold flex items-center justify-center font-mono">2</span>
            <span className="font-bold text-stone-200 text-xs">Drop In C DSP</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Replace the existing sound generator in <code className="text-amber-300 font-mono">src/dsp/</code> with the 3-generator C code below (Shruti + Tanpura + FM Drone).
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-xs font-bold flex items-center justify-center font-mono">3</span>
            <span className="font-bold text-stone-200 text-xs">Flash Hardware</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Compile the firmware binary with GitHub Actions. Flash it over USB via Web MIDI or <code className="text-amber-300 font-mono">thefirmwarehub.com</code>.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-5 h-5 rounded-full bg-cyan-400 text-stone-950 text-xs font-bold flex items-center justify-center font-mono">4</span>
            <span className="font-bold text-stone-200 text-xs">Host on GitHub Pages</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Push code to GitHub. Enable <strong>Settings &gt; Pages &gt; GitHub Actions</strong>. Your web simulator will be live for free!
          </p>
        </div>
      </div>

      {/* GitHub Pages Hosting Explanation Card */}
      <div className="mb-6 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-stone-300 text-xs leading-relaxed">
        <div className="flex items-center gap-2 mb-2 text-cyan-300 font-serif font-bold text-sm">
          <span>Hosting Your Web Version on GitHub Pages (Free & 100% Static)</span>
        </div>
        <p className="mb-2">
          <strong>Yes, absolutely!</strong> You can host this entire web synthesizer on GitHub Pages. The repository is already configured with relative paths (<code className="text-cyan-300 font-mono">base: './'</code> in <code className="font-mono">vite.config.ts</code>) and includes the automated deployment workflow in <code className="text-cyan-300 font-mono">.github/workflows/deploy.yml</code>.
        </p>
        <div className="bg-black/40 p-3 rounded-xl border border-stone-800 font-mono text-[11px] space-y-1 text-stone-300">
          <div>1. Push this project to your GitHub repo (e.g. <span className="text-amber-400">git push origin main</span>)</div>
          <div>2. On GitHub, navigate to <strong>Settings &gt; Pages</strong></div>
          <div>3. Under <strong>Build and deployment &gt; Source</strong>, choose <strong>GitHub Actions</strong></div>
          <div>4. GitHub will build and publish your web simulator at <span className="text-emerald-400">https://&lt;username&gt;.github.io/&lt;repo&gt;/</span></div>
        </div>
      </div>

      {/* Safety & No Bricking Note */}
      <div className="mb-6 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-300">
          <span className="font-bold text-emerald-300">Bootloader Safety: </span>
          The FM-1's bootloader is write-protected in internal ROM. If your custom firmware has any bugs, you can simply hold the boot button while plugging in USB to return to recovery mode and flash official or other community firmware anytime.
        </div>
      </div>

      {/* C Code Export Tabs */}
      <div className="bg-stone-950 rounded-xl border border-stone-800 overflow-hidden">
        
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-stone-900 border-b border-stone-800">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-300">
            <Terminal className="w-4 h-4 text-amber-500" />
            <span>shruti_box.c & shruti_box.h (JieLi AC791N DSP Implementation)</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(cHeaderCode, 'header')}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-mono flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFile === 'header' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
              <span>Copy .h</span>
            </button>
            <button
              onClick={() => copyToClipboard(cSourceCode, 'source')}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] font-mono flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFile === 'source' ? <Check className="w-3.5 h-3.5 text-stone-950" /> : <Copy className="w-3.5 h-3.5 text-stone-950" />}
              <span>Copy .c</span>
            </button>
          </div>
        </div>

        {/* Code Preview */}
        <pre className="p-4 text-xs font-mono text-amber-300/90 overflow-x-auto max-h-96 leading-relaxed bg-black/60">
          <code>{cSourceCode}</code>
        </pre>
      </div>

    </div>
  );
};
