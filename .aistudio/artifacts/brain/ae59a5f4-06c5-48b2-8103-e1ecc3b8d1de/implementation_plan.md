# Revised Implementation Plan: PureTones Acoustic Wavetables, 3-Generator Mixer, Indian Music History & Tabla Riyaz Reference

## Overview
This revised plan expands the project to incorporate key research from **Sadharani PureTones**, adds a dedicated **3-Generator Sound Mixer** (Shruti Box, Tanpura, and FM Operator Drone) with independent mute/solo/mix controls, implements an interactive **Indian Music History & 22-Shruti Evolution** system, introduces a complete **Tabla Riyaz & Taal Reference Library** with preferred BPMs and historical contexts, and provides a turnkey **GitHub Pages deployment workflow**.

---

## 1. PureTones Sample Feasibility & Wavetable Engine

### Can PureTones Samples be Used on the M-VAVE FM-1?
**Yes, exceptionally well!**
* **The Problem with Long Samples**: Storing raw multi-second 44.1 kHz PCM audio files consumes ~176 KB per second. Storing 10-15 long notes would quickly fill the MCU's SPI Flash.
* **The Solution (Acoustic Single-Cycle Wavetables & Transients)**:
  * PureTones utilizes periodic spectral models derived from high-resolution recordings of master Miraj Tanpuras and brass harmonium reeds.
  * We extract **single-cycle wavetable frames (1024 to 2048 samples)** capturing the exact physical overtone spectrum and non-linear phase offsets.
  * **Memory Footprint**: A 2048-sample 16-bit wavetable takes only **4 KB of Flash memory**! The FM-1's JieLi AC791N processor can store over 30 full master instrument wavetables in under 120 KB, easily fitting into both web and embedded hardware.
  * **Synthesis Behavior**: The wavetable provides 100% authentic acoustic timber, while the DSP code calculates dynamic pitch shifting, Javari bridge bloom, and filter envelopes without sample pitch-stretching artifacts.

---

## 2. 3-Generator Sound Mixer (Shruti, Tanpura, FM Operator Drone)

We will introduce a dedicated Mixer module allowing the musician to blend, mute, and solo three distinct sound generators:

| Generator | Sound Origin | DSP Architecture | Dedicated Controls |
| :--- | :--- | :--- | :--- |
| **1. Shruti Box** | Free-reed aerophone | Dual beating brass reeds, teakwood body resonance filter, air bellows pressure modulation. | Volume, Mute, Solo, Tone (Cutoff), Bellows speed. |
| **2. Tanpura** | Plucked 4/5 string | PureTones acoustic wavetable + Karplus-Strong string decay + dynamic cotton thread Javari bridge bloom. | Volume, Mute, Solo, Javari Buzz %, String Sustain, Pluck BPM. |
| **3. FM Operator Drone ("Dome")** | Native FM-1 2-Operator FM engine | Chowning 2-Operator FM synthesis: $y(t) = A \sin(\omega_c t + I(t) \sin(\omega_m t))$ with carrier ratio, modulator ratio, and feedback loop. | Volume, Mute, Solo, Modulator Ratio (1:1, 1:2, 2:3, 3:2), FM Index (brightness), Feedback depth. |

* **Master Mixer**:
  * Individual Mute (`M`) and Solo (`S`) buttons for all 3 generators.
  * Live visual VU meters on the FM-1 screen and on the web UI.

---

## 3. Indian Music History & 22-Shruti Evolution (PureTones Research)

Add an interactive educational module documenting the historical evolution of Indian scales and tuning:

1. **Vedic Era (Sama Gana, ~1500–1000 BCE)**:
   * Chants based on descending modal scales (*Krushta*, *Prathama*, *Dvitiya*, *Tritiya*, *Chaturtha*, *Mandra*, *Atisvarya*).
   * Transition from ancient 3-tone *Samika* chants to the foundational 7-note *Saptak*.
2. **Classical Era: Bharata Muni's *Natya Shastra* (~200 BCE–200 CE)**:
   * The *Shadja Grama* and *Madhyama Grama*.
   * The legendary **Sarana Chatushtayi Experiment**: Two identical 22-string vinas tuned and shifted over 4 successive cycles to demonstrate the 22 Shrutis and isolate the microtonal **Pramana Comma** ($\frac{81}{80} \approx 21.51\text{ cents}$).
3. **Medieval Synthesis: Sarangadeva's *Sangita Ratnakara* (13th Century)**:
   * Identification and naming of all 22 Shrutis (*Tivra*, *Kumudvati*, *Manda*, *Chandovati*, *Dayavati*, *Ranjani*, etc.) across five Jatis (*Dipta*, *Ayata*, *Karuna*, *Mridu*, *Madhya*).
4. **Modern Systems: Bhatkhande's 10 Thaats & 72 Melakarta**:
   * Venkatamakhin's mathematical 72 Melakarta system in Carnatic music.
   * Pandit Vishnu Narayan Bhatkhande's 10 Thaat classification system for Hindustani ragas.
5. **Interactive 22-Shruti Microtonal Table & Consonance Calculator**:
   * View all 22 Shrutis with their Sanskrit names, exact fractions, cents, and acoustic intervals.
   * Visual consonance indicators showing **Vadi** (sonant), **Samvadi** (consonant: pure fourths/fifths), **Anuvadi** (assonant), and **Vivadi** (dissonant semitones).

---

## 4. Dedicated Tabla Riyaz & Taal Reference Library (Non-Engine Educational Tab)

A comprehensive practice reference designed specifically for tabla players:

### Included Taals:
* **Teental** (16 Matras - 4x4, Dha Dhin Dhin Dha)
* **Jhaptal** (10 Matras - 2-3-2-3, Dhi Na Dhi Dhi Na)
* **Rupak** (7 Matras - 3-2-2, Tin Tin Na Dhi Na Dhi Na)
* **Ektaal** (12 Matras - 2x6, Dhin Dhin DhaGe Tirakita Tu Na)
* **Keherwa** (8 Matras - 4x2, Dha Ge Na Ti Na Ka Dhi Na)
* **Dadra** (6 Matras - 3x2, Dha Dhi Na Dha Tu Na)
* **Chachar / Deepchandi** (14 Matras - 3-4-3-4)
* **Bhajani / Khemta** (8 Matras)
* **Tilwada** (16 Matras - Vilambit Khyal)

### Features per Taal:
* **Interactive Theka Visualizer**: Displays Vibhags, Matras, Bols, Sam (X), Tali (2, 3, 4), and Khali (0).
* **Preferred BPM Buttons**: One-click tempo buttons for **Vilambit** (Slow, 30–50 BPM), **Madhyalaya** (Medium, 60–90 BPM), and **Drut** (Fast, 110–180 BPM) that instantly set the Tanpura accompaniment plucking tempo!
* **Historical Context Modal**: Origins, connection to Pakhawaj/Dhrupad vs Khayal, Gharana styles (Delhi, Ajrada, Farrukhabad, Lucknow, Benares, Punjab).
* **Variations & Practice Themes**: Common *Peshkar*, *Kaida*, *Rela*, and *Tihai* themes for each taal.

---

## 5. GitHub Pages Deployment Workflow

To host the web version on GitHub Pages (`https://<username>.github.io/fumi-1/`):
1. **Vite Configuration**: Set `base: './'` in `vite.config.ts` for relative asset linking.
2. **GitHub Actions Workflow (`.github/workflows/deploy.yml`)**:
   * Automated build on push to `main`.
   * Sets up Node.js, runs `npm install`, runs `npm run build`, and publishes `dist/` to the `gh-pages` branch.
3. **In-App Deployment Guide**:
   * Instructions for enabling GitHub Pages in repo settings with zero configuration.

---

## 6. Execution Steps
1. Update `src/audio/shrutiEngine.ts` to add the 3-Generator Mixer and FM Operator Drone engine.
2. Create `src/components/TablaReference.tsx` for the full Taal library with preferred BPMs and historical contexts.
3. Create `src/components/IndianMusicHistory.tsx` documenting Vedic Sama Gana, Bharata's 22 Shrutis, and the consonance engine.
4. Update `src/components/FM1Hardware.tsx` and `src/App.tsx` with mixer strips, tabs, and clean light UI.
5. Create `.github/workflows/deploy.yml` and test production build.
