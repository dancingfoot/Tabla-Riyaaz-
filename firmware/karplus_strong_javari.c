/*
 * karplus_strong_javari.c - Karplus-Strong Waveguide with Javari Non-Linear Bridge
 * Optimized for JieLi AC791N 32-bit RISC / DSP (M-VAVE FM-1 / cartesive/fumi-1)
 */

#include "karplus_strong_javari.h"
#include <math.h>
#include <string.h>
#include <stdlib.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846f
#endif

void ks_javari_init_string(ks_waveguide_string_t *str, float f0, float sustain, float javari, float flesh) {
    if (!str) return;
    memset(str, 0, sizeof(ks_waveguide_string_t));
    
    str->f0_hz = (f0 < 25.0f) ? 25.0f : f0;
    str->sustain_sec = (sustain < 2.0f) ? 2.0f : ((sustain > 7.0f) ? 7.0f : sustain);
    str->javari_buzz = (javari < 0.05f) ? 0.05f : ((javari > 1.0f) ? 1.0f : javari);
    str->flesh_noise = (flesh < 0.0f) ? 0.0f : ((flesh > 1.0f) ? 1.0f : flesh);
    
    // 1. Digital waveguide delay length: D = (fs / f0) - 0.5
    float total_delay = ((float)KS_SAMPLE_RATE / str->f0_hz) - 0.5f;
    if (total_delay > (float)(KS_MAX_DELAY_SAMPLES - 4)) {
        total_delay = (float)(KS_MAX_DELAY_SAMPLES - 4);
    }
    str->delay_len_int = (uint32_t)total_delay;
    str->delay_frac = total_delay - (float)str->delay_len_int;
    str->write_ptr = 0;
    
    // 2. Loop gain for long sustained resonance (T60 target)
    float g_target = expf(-3.0f / (str->f0_hz * str->sustain_sec));
    if (g_target > 0.9996f) g_target = 0.9996f;
    if (g_target < 0.9940f) g_target = 0.9940f;
    str->loop_gain = g_target;
    
    // High frequency damping coefficient S
    str->damping_s = 0.14f + (1.0f - str->javari_buzz) * 0.12f;
    
    // 3. Javari non-linear bridge parameters (clearance h and curvature stiffness k)
    str->bridge_clearance = 0.038f * (1.1f - str->javari_buzz * 0.65f);
    str->bridge_stiffness = 3.2f + str->javari_buzz * 8.0f;
    
    // 4. Gourd Helmholtz bandpass resonator (~160 Hz cavity)
    float omega = (2.0f * (float)M_PI * 160.0f) / (float)KS_SAMPLE_RATE;
    float q = 2.4f;
    float alpha = sinf(omega) / (2.0f * q);
    str->gourd_b0 = alpha;
    str->gourd_b2 = -alpha;
    str->gourd_a0 = 1.0f + alpha;
    str->gourd_a1 = -2.0f * cosf(omega);
    str->gourd_a2 = 1.0f - alpha;
    
    str->max_samples = (uint32_t)((float)KS_SAMPLE_RATE * str->sustain_sec);
    str->is_active = false;
}

void ks_javari_trigger_pluck(ks_waveguide_string_t *str) {
    if (!str) return;
    
    // Clear delay line buffer
    memset(str->delay_line, 0, sizeof(str->delay_line));
    str->write_ptr = 0;
    str->prev_bridged = 0.0f;
    str->dc_blocker_x = 0.0f;
    str->dc_blocker_y = 0.0f;
    str->gourd_x1 = 0.0f; str->gourd_x2 = 0.0f;
    str->gourd_y1 = 0.0f; str->gourd_y2 = 0.0f;
    
    // Build Hann-tapered pluck excitation pulse + shaped noise
    uint32_t len = (uint32_t)((float)KS_SAMPLE_RATE * (0.006f + str->flesh_noise * 0.008f));
    if (len > 120) len = 120;
    if (len >= str->delay_len_int) len = str->delay_len_int - 2;
    str->excitation_len = len;
    str->excitation_pos = 0;
    
    for (uint32_t i = 0; i < len; i++) {
        float t = (float)i / (float)len;
        float env = 0.5f * (1.0f - cosf(2.0f * (float)M_PI * t)); // Hann envelope
        float pluck = sinf((float)M_PI * t);
        float noise = (((float)rand() / (float)RAND_MAX) * 2.0f - 1.0f) * (0.25f + str->flesh_noise * 0.75f);
        str->excitation_buf[i] = (pluck * 0.75f + noise * 0.35f) * env;
    }
    
    str->age_samples = 0;
    str->is_active = true;
}

float ks_javari_render_sample(ks_waveguide_string_t *str) {
    if (!str || !str->is_active) return 0.0f;
    
    uint32_t L = str->delay_len_int + 4;
    if (L > KS_MAX_DELAY_SAMPLES) L = KS_MAX_DELAY_SAMPLES;
    
    // Read delayed sample from circular waveguide line using linear interpolation
    uint32_t r0 = (str->write_ptr - str->delay_len_int + L) % L;
    uint32_t r1 = (str->write_ptr - str->delay_len_int - 1 + L) % L;
    float delayed = str->delay_line[r0] * (1.0f - str->delay_frac) + str->delay_line[r1] * str->delay_frac;
    
    // Dynamic cotton thread micro-flutter (~1.2 Hz) for Indian tambura acoustic undulating
    float flutter = 1.0f + 0.10f * sinf((2.0f * (float)M_PI * 1.2f * (float)str->age_samples) / (float)KS_SAMPLE_RATE);
    float clearance = str->bridge_clearance * flutter;
    
    // Non-linear Javari Bridge Mapping (asymmetric unilateral curved constraint)
    float bridged = delayed;
    if (delayed > clearance) {
        float d = delayed - clearance;
        bridged = clearance + d / (1.0f + str->bridge_stiffness * d);
    } else if (delayed < -clearance * 1.35f) {
        float d = delayed + clearance * 1.35f;
        bridged = -clearance * 1.35f + d / (1.0f + str->bridge_stiffness * 0.45f * d);
    }
    
    // Loop Filter: 2-Point Averaging FIR Lowpass Filter with Loop Gain
    float lpf_out = str->loop_gain * ((1.0f - str->damping_s) * bridged + str->damping_s * str->prev_bridged);
    str->prev_bridged = bridged;
    
    // DC Blocker: y[n] = x[n] - x[n-1] + R*y[n-1]
    float filtered = lpf_out - str->dc_blocker_x + 0.996f * str->dc_blocker_y;
    str->dc_blocker_x = lpf_out;
    str->dc_blocker_y = filtered;
    
    // Injection adder: Pluck excitation + feedback
    float x_in = 0.0f;
    if (str->excitation_pos < str->excitation_len) {
        x_in = str->excitation_buf[str->excitation_pos++];
    }
    float delay_in = x_in + filtered;
    
    // Write back into circular delay buffer
    str->delay_line[str->write_ptr] = delay_in;
    str->write_ptr = (str->write_ptr + 1) % L;
    
    // Tumba Gourd Helmholtz Body Resonator
    float in_g = bridged;
    float out_g = (str->gourd_b0 * in_g + str->gourd_b2 * str->gourd_x2 - str->gourd_a1 * str->gourd_y1 - str->gourd_a2 * str->gourd_y2) / str->gourd_a0;
    str->gourd_x2 = str->gourd_x1; str->gourd_x1 = in_g;
    str->gourd_y2 = str->gourd_y1; str->gourd_y1 = out_g;
    
    str->age_samples++;
    if (str->age_samples >= str->max_samples) {
        str->is_active = false;
    }
    
    // Blend bridge sound and warm wooden gourd body resonance
    return (bridged * 0.72f + out_g * 0.50f);
}
