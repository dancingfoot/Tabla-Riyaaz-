/*
 * indian_accompaniment.h - Indian Classical Accompaniment Engine for JieLi AC791N
 * Target: M-VAVE FM-1 (JieLi AC791N 32-bit RISC / DSP)
 * Compatible with cartesive/fumi-1 architecture
 */

#ifndef INDIAN_ACCOMPANIMENT_H
#define INDIAN_ACCOMPANIMENT_H

#include <stdint.h>
#include <stdbool.h>
#include "karplus_strong_javari.h"

#define AUDIO_SAMPLE_RATE      44100
#define TANPURA_STRINGS_MAX    5
#define REED_VOICES_MAX        4

typedef enum {
    ENGINE_WAVEGUIDE_JAVARI = 0, // Karplus-Strong Physical Model with Javari Bridge
    ENGINE_6OP_FM           = 1, // Koto-to-Tanpura 6-Operator FM
    ENGINE_WAVETABLE        = 2, // PureTones 32-harmonic wavetables
    ENGINE_MATH_FOURIER     = 3  // Mathematical additive DSP
} synthesis_engine_t;

typedef enum {
    PATTERN_PA_SA_SA_SA = 0,
    PATTERN_MA_SA_SA_SA = 1,
    PATTERN_NI_SA_SA_SA = 2,
    PATTERN_5_STRING    = 3
} tanpura_pattern_t;

typedef struct {
    // Tuning (Tabla Dayan pitch alignment)
    float base_sa_hz;          // e.g. 138.591 Hz for C#3 (Kali 1)
    float fine_detune_cents;   // -50.0f to +50.0f cents
    
    // Engine selection
    synthesis_engine_t engine;

    // Tanpura Controls
    bool  tanpura_enabled;
    float tanpura_gain;        // 0.0f to 1.0f
    tanpura_pattern_t pattern;
    float pluck_speed_bpm;     // 20.0f to 90.0f BPM
    float javari_buzz;         // 0.0f to 1.0f (cotton thread / bridge curvature)
    float string_sustain_sec;  // 2.0f to 7.0f seconds
    float flesh_noise;         // 0.0f to 1.0f (pluck finger transient)

    // Shruti Box Controls
    bool  shruti_enabled;
    float shruti_gain;         // 0.0f to 1.0f
    float box_cutoff_hz;       // 400.0f to 3500.0f
    float reed_detune_cents;   // 1.5f to 4.0f (acoustic beating)
    float bellows_pressure;    // 0.0f to 1.0f

    // Master
    float master_volume;
    bool  muted;
} accompaniment_config_t;

void accompaniment_init(void);
void accompaniment_set_dayan_pitch(float sa_hz, float detune_cents);
void accompaniment_trigger_string_pluck(int string_idx);
void accompaniment_set_mix(float tanpura_vol, float shruti_vol);
void accompaniment_set_engine(synthesis_engine_t engine);

// Main JieLi AC791N Audio DMA Render Callback (Interleaved 16-bit PCM Stereo)
void accompaniment_render_audio(int16_t *buffer, uint32_t frames);

#endif // INDIAN_ACCOMPANIMENT_H
