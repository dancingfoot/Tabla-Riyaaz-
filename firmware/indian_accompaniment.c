/*
 * indian_accompaniment.c - Tanpura (with Karplus-Strong Waveguide) & Shruti DSP
 * Target: JieLi AC791N 32-bit RISC / DSP SoC
 */

#include "indian_accompaniment.h"
#include <math.h>
#include <string.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846f
#endif

static accompaniment_config_t g_cfg;
static ks_waveguide_string_t  g_ks_strings[TANPURA_STRINGS_MAX];

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
    g_cfg.engine = ENGINE_WAVEGUIDE_JAVARI;

    g_cfg.tanpura_enabled = true;
    g_cfg.tanpura_gain = 0.85f;
    g_cfg.pattern = PATTERN_PA_SA_SA_SA;
    g_cfg.pluck_speed_bpm = 46.0f;
    g_cfg.javari_buzz = 0.75f;
    g_cfg.string_sustain_sec = 5.0f;
    g_cfg.flesh_noise = 0.35f;

    g_cfg.shruti_enabled = true;
    g_cfg.shruti_gain = 0.65f;
    g_cfg.box_cutoff_hz = 1250.0f;
    g_cfg.reed_detune_cents = 2.5f;
    g_cfg.bellows_pressure = 0.85f;

    g_cfg.master_volume = 0.80f;
    g_cfg.muted = false;

    accompaniment_set_dayan_pitch(138.591f, 0.0f);
}

void accompaniment_set_dayan_pitch(float sa_hz, float detune_cents) {
    g_cfg.base_sa_hz = sa_hz;
    g_cfg.fine_detune_cents = detune_cents;
    float actual_sa = sa_hz * powf(2.0f, detune_cents / 1200.0f);

    // Initialize the 4 Karplus-Strong Waveguide Strings
    float ratios[4] = { 1.5000f, 1.0000f, 1.0016f, 0.5000f }; // Pa, Middle Sa, Jodi Sa, Bass Kharaj Sa
    if (g_cfg.pattern == PATTERN_MA_SA_SA_SA) ratios[0] = 1.33333f; // Shuddha Ma
    else if (g_cfg.pattern == PATTERN_NI_SA_SA_SA) ratios[0] = 1.8750f; // Shuddha Ni

    for (int i = 0; i < 4; i++) {
        float f0 = actual_sa * ratios[i];
        ks_javari_init_string(&g_ks_strings[i], f0, g_cfg.string_sustain_sec, g_cfg.javari_buzz, g_cfg.flesh_noise);
    }

    // Setup Shruti Reeds (Sa + Pa)
    float pa_hz = actual_sa * 1.5000f;
    float spread = powf(2.0f, (g_cfg.reed_detune_cents / 2.0f) / 1200.0f);

    g_reed_inc1[0] = (2.0f * (float)M_PI * (actual_sa / spread)) / (float)AUDIO_SAMPLE_RATE;
    g_reed_inc2[0] = (2.0f * (float)M_PI * (actual_sa * spread)) / (float)AUDIO_SAMPLE_RATE;

    g_reed_inc1[1] = (2.0f * (float)M_PI * (pa_hz / spread)) / (float)AUDIO_SAMPLE_RATE;
    g_reed_inc2[1] = (2.0f * (float)M_PI * (pa_hz * spread)) / (float)AUDIO_SAMPLE_RATE;
}

void accompaniment_trigger_string_pluck(int string_idx) {
    if (string_idx < 0 || string_idx >= 4) return;
    ks_javari_trigger_pluck(&g_ks_strings[string_idx]);
}

void accompaniment_set_engine(synthesis_engine_t engine) {
    g_cfg.engine = engine;
}

void accompaniment_set_mix(float tanpura_vol, float shruti_vol) {
    g_cfg.tanpura_gain = tanpura_vol;
    g_cfg.shruti_gain = shruti_vol;
}

void accompaniment_render_audio(int16_t *buffer, uint32_t frames) {
    if (!buffer) return;
    if (g_cfg.muted) {
        memset(buffer, 0, frames * 2 * sizeof(int16_t));
        return;
    }

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

        // --- 2. RENDER ACTIVE TANPURA STRINGS VIA KARPLUS-STRONG JAVARI WAVEGUIDE ---
        float tanpura_mix = 0.0f;
        if (g_cfg.tanpura_enabled) {
            for (int s = 0; s < 4; s++) {
                if (g_ks_strings[s].is_active) {
                    tanpura_mix += ks_javari_render_sample(&g_ks_strings[s]);
                }
            }
        }

        // --- 3. RENDER CONTINUOUS SHRUTI BOX FREE REEDS ---
        float shruti_mix = 0.0f;
        if (g_cfg.shruti_enabled) {
            for (int v = 0; v < 2; v++) {
                float r1 = sinf(g_reed_phase1[v]) + 0.45f * sinf(g_reed_phase1[v] * 3.0f) + 0.20f * sinf(g_reed_phase1[v] * 5.0f);
                float r2 = sinf(g_reed_phase2[v]) + 0.45f * sinf(g_reed_phase2[v] * 3.0f) + 0.20f * sinf(g_reed_phase2[v] * 5.0f);

                g_reed_phase1[v] += g_reed_inc1[v];
                g_reed_phase2[v] += g_reed_inc2[v];
                if (g_reed_phase1[v] >= 2.0f * (float)M_PI) g_reed_phase1[v] -= 2.0f * (float)M_PI;
                if (g_reed_phase2[v] >= 2.0f * (float)M_PI) g_reed_phase2[v] -= 2.0f * (float)M_PI;

                shruti_mix += (r1 + r2) * 0.25f;
            }

            // Wooden cavity lowpass filter
            g_box_lp_state += alpha * (shruti_mix - g_box_lp_state);
            shruti_mix = g_box_lp_state * g_cfg.bellows_pressure;
        }

        // --- 4. MASTER MIX & SOFT LIMITING ---
        float final_sample = (tanpura_mix * g_cfg.tanpura_gain * 0.72f) +
                             (shruti_mix * g_cfg.shruti_gain * 0.50f);
        final_sample *= g_cfg.master_volume;

        // Soft saturation
        if (final_sample > 1.0f) final_sample = 1.0f;
        else if (final_sample < -1.0f) final_sample = -1.0f;

        int32_t pcm = (int32_t)(final_sample * 30000.0f);
        if (pcm > 32767) pcm = 32767;
        if (pcm < -32768) pcm = -32768;

        buffer[i * 2 + 0] = (int16_t)pcm; // Left Channel
        buffer[i * 2 + 1] = (int16_t)pcm; // Right Channel
    }
}
