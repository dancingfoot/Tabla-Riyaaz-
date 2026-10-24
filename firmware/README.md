# M-VAVE FM-1 (FuMi-1) Custom Firmware: Indian Tanpura & Shruti Box

Target Hardware: **M-VAVE FM-1** (SoC: JieLi AC791N 32-bit RISC / DSP @ 160MHz)  
Architecture Compatibility: [cartesive/fumi-1](https://github.com/cartesive/fumi-1)

---

## 📁 Firmware Folder Contents

| File | Type | Description |
|---|---|---|
| `fumi_tanpura_ac791n.bin` | **Compiled Binary** (128 KB) | Raw firmware image for JieLi ISP/DFU flashing |
| `fumi_tanpura_ac791n.ufw` | **Upgrade Package** (128.5 KB) | JieLi Upgrade Firmware package for USB/SD flash updater |
| `karplus_strong_javari.h` | C Header | Physical modeling Karplus-Strong waveguide & non-linear Javari bridge definitions |
| `karplus_strong_javari.c` | C Source | Fixed-point / float DSP routines for Karplus-Strong waveguide with Javari curve |
| `indian_accompaniment.h` | C Header | Tanpura sequencer, Shruti Box dual-reed, and FM drone state management |
| `indian_accompaniment.c` | C Source | Accompaniment engine implementation & JieLi AC791N audio DMA render callback |
| `Makefile` | Build Script | Pi32v2 toolchain build configuration (`pi32v2-elf-gcc`) |

---

## ⚡ How to Flash the Firmware to M-VAVE FM-1

### Method 1: Web USB / FuMi-1 Web Flasher (Easiest)
1. Open the FuMi-1 web flasher in Chrome/Edge: [cartesive.github.io/fumi-1](https://cartesive.github.io/fumi-1/)
2. Connect your M-VAVE FM-1 to your computer via USB-C.
3. Put the device into Bootloader mode:
   - Turn off the FM-1.
   - **Press and hold down the rotary encoder knob** while connecting the USB-C cable or powering on.
   - The screen will display `DFU` or `USB UPDATE`.
4. Click **Connect Device** on the web flasher.
5. Select **Load Local Firmware** and choose `fumi_tanpura_ac791n.bin` from this folder.
6. Click **Flash Firmware**. The progress bar will reach 100% and the device will reboot into **Shruti-1**!

### Method 2: JieLi USB Mass Storage DFU
1. Hold down the encoder knob while plugging in USB.
2. The FM-1 appears as a USB drive named `JL_UPGRADE` or `M-VAVE`.
3. Copy `fumi_tanpura_ac791n.ufw` or `fumi_tanpura_ac791n.bin` into the root of the USB drive.
4. Eject safely and power cycle the FM-1.
5. The device will automatically verify CRC32 and flash the firmware.

---

## 🎛️ Physical Controls on M-VAVE FM-1

Once flashed, the physical FM-1 controls map directly to:
- **Knob 1**: Dayan Root Key (Sa tuning: C, C#, D, D#, etc.)
- **Knob 2**: Tanpura Pluck Tempo (20 to 90 BPM)
- **Knob 3**: Javari Buzz intensity (cotton thread bridge contact)
- **Knob 4**: Tanpura vs Shruti Box blend mix
- **Encoder Click**: Toggle between Pattern modes (Pa-Sa-Sa-Sa, Ma-Sa-Sa-Sa, Ni-Sa-Sa-Sa, 5-String)
- **Preset Buttons**: Quick load traditional Raga presets (Bhairav, Yaman, Darbari, Todi, etc.)
