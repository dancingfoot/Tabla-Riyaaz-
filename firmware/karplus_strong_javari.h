/*
 * karplus_strong_javari.h - Physical Modeling Karplus-Strong Waveguide with Javari Bridge
 * Target Architecture: JieLi AC791N 32-bit RISC / DSP Core (M-VAVE FM-1 / cartesive/fumi-1)
 * 
 * Implements:
 * 1. Digital Waveguide Delay Line with fractional linear interpolation
 * 2. Asymmetric non-linear Javari curved bridge contact (cotton thread jiva clearance)
 * 3. 2-Point FIR averaging loop filter with calibrated loop gain (4.5-6.5s singing sustain)
 * 4. Dual biquad cavity filters (Tumba gourd Helmholtz resonator + Tabli soundboard)
 */

#ifndef KARPLUS_STRONG_JAVARI_H
#define KARPLUS_STRONG_JAVARI_H

#include <stdint.h>
#include <stdbool.h>

#define KS_SAMPLE_RATE          44100
#define KS_MAX_DELAY_SAMPLES    2048  // Supports fundamental down to ~21.5 Hz
#define KS_MAX_STRINGS          5

typedef struct {
    float f0_hz;               // Fundamental frequency (e.g. 138.59 Hz for C#3)
    float sustain_sec;         // 2.0 to 7.0 seconds
    float javari_buzz;         // 0.0 to 1.0 (clearance & non-linear bridge stiffness)
    float flesh_noise;         // 0.0 to 1.0 (transient finger pluck friction)
    
    // Waveguide buffer state
    float delay_line[KS_MAX_DELAY_SAMPLES];
    uint32_t delay_len_int;
    float delay_frac;
    uint32_t write_ptr;
    
    // Filter & physical bridge states
    float loop_gain;           // g = exp(-3.0 / (f0 * sustain))
    float damping_s;           // FIR high-frequency roll-off (1 - S) + S*z^-1
    float bridge_clearance;    // Cotton thread clearance height (h)
    float bridge_stiffness;    // Non-linear compression coefficient (k)
    float prev_bridged;        // Loop filter memory
    float dc_blocker_x;        // DC blocker input memory
    float dc_blocker_y;        // DC blocker output memory
    
    // Helmholtz Gourd Resonator state (~160 Hz)
    float gourd_x1, gourd_x2;
    float gourd_y1, gourd_y2;
    float gourd_b0, gourd_b2;
    float gourd_a0, gourd_a1, gourd_a2;
    
    // Excitation state
    float excitation_buf[128];
    uint32_t excitation_len;
    uint32_t excitation_pos;
    bool  is_active;
    uint32_t age_samples;
    uint32_t max_samples;
} ks_waveguide_string_t;

// API functions
void ks_javari_init_string(ks_waveguide_string_t *str, float f0, float sustain, float javari, float flesh);
void ks_javari_trigger_pluck(ks_waveguide_string_t *str);
float ks_javari_render_sample(ks_waveguide_string_t *str);

#endif // KARPLUS_STRONG_JAVARI_H
