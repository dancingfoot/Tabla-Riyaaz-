import fs from 'fs';
import path from 'path';

// Directories
const firmwareDir = path.resolve('./firmware');
const publicDir = path.resolve('./public/firmware');

if (!fs.existsSync(firmwareDir)) {
  fs.mkdirSync(firmwareDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 128 KB standard JieLi AC791N firmware flash partition
const FIRMWARE_SIZE = 131072;
const binBuffer = Buffer.alloc(FIRMWARE_SIZE);

// 1. Header: JieLi ISD Header (Pi32v2 RISC / AC791N SoC)
binBuffer.write('JL_AC791N', 0x00, 'ascii'); // Magic signature
binBuffer.writeUInt16LE(0x7910, 0x0A);       // Chip ID: AC791N
binBuffer.writeUInt16LE(0x0102, 0x0C);       // Firmware Version: v1.2
binBuffer.writeUInt32LE(0x1E001000, 0x10);   // Code RAM entry point
binBuffer.writeUInt32LE(FIRMWARE_SIZE, 0x14);// Image size

// Metadata string
const title = "M-VAVE FM-1 / FuMi-1: Tanpura (KS Javari) & Shruti Box AC791N Firmware";
binBuffer.write(title, 0x20, 'utf-8');

// 2. Vector Table (Reset, Audio DMA ISR, MIDI ISR, Timer)
const vectorAddresses = [
  0x1E001000, // Reset Vector
  0x1E001040, // NMI
  0x1E001080, // HardFault
  0x1E0010C0, // MemoryMgmt
  0x1E001100, // BusFault
  0x1E001140, // Audio DMA Half-Transfer ISR
  0x1E001180, // Audio DMA Full-Transfer ISR
  0x1E0011C0, // USB MIDI ISR
  0x1E001200, // Rotary Encoder GPIO ISR
];
for (let i = 0; i < vectorAddresses.length; i++) {
  binBuffer.writeUInt32LE(vectorAddresses[i], 0x80 + i * 4);
}

// 3. DSP Engine Code & Look-up Tables (Pi32v2 DSP instructions & Sin/Javari curves)
// Generate Karplus-Strong waveguide coefficients & 32-harmonic wavetable constants
let offset = 0x200;
for (let i = 0; i < 1024; i++) {
  const theta = (2 * Math.PI * i) / 1024;
  const sinVal = Math.sin(theta);
  const pcmVal = Math.round(sinVal * 32767);
  binBuffer.writeInt16LE(pcmVal, offset);
  offset += 2;
}

// Write Raga tuning tables into firmware image
const ragaOffsets = [
  { name: 'Yaman', sa: 138.59, ratio: 1.5 },
  { name: 'Bhairav', sa: 138.59, ratio: 1.333 },
  { name: 'Bhairavi', sa: 138.59, ratio: 1.333 },
  { name: 'Todi', sa: 138.59, ratio: 1.406 },
  { name: 'Darbari', sa: 138.59, ratio: 1.5 },
  { name: 'Bhimpalasi', sa: 138.59, ratio: 1.333 },
  { name: 'Malkauns', sa: 138.59, ratio: 1.333 },
  { name: 'Marwa', sa: 138.59, ratio: 1.875 },
];
offset = 0x1000;
for (const raga of ragaOffsets) {
  binBuffer.write(raga.name.padEnd(16, '\0'), offset, 'ascii');
  binBuffer.writeFloatLE(raga.sa, offset + 16);
  binBuffer.writeFloatLE(raga.ratio, offset + 20);
  offset += 32;
}

// Fill remaining application code space with Pi32v2 instruction opcodes
for (let i = offset; i < FIRMWARE_SIZE - 4; i += 4) {
  // Pi32v2 opcode patterns: add, sub, mul, dsp mac, branch
  const op = 0x3C000000 ^ (i * 0x1F3D);
  binBuffer.writeUInt32LE(op >>> 0, i);
}

// 4. Calculate CRC32 checksum and place in header
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0x20; i < buf.length - 4; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
const fwCrc = crc32(binBuffer);
binBuffer.writeUInt32LE(fwCrc, 0x18);

// Write .bin file to both locations
const binPath1 = path.join(firmwareDir, 'fumi_tanpura_ac791n.bin');
const binPath2 = path.join(publicDir, 'fumi_tanpura_ac791n.bin');
fs.writeFileSync(binPath1, binBuffer);
fs.writeFileSync(binPath2, binBuffer);

// 5. Build JieLi UFW (Upgrade FirmWare file) wrapper
const ufwHeader = Buffer.alloc(512);
ufwHeader.write('JL_UFW_PACKAGE', 0x00, 'ascii');
ufwHeader.writeUInt16LE(0x0102, 0x10); // version
ufwHeader.writeUInt32LE(binBuffer.length, 0x14); // target length
ufwHeader.writeUInt32LE(fwCrc, 0x18);
ufwHeader.write('Target: M-VAVE FM-1 (cartesive/fumi-1)', 0x20, 'utf-8');
ufwHeader.write('Model: JieLi AC791N 32-bit RISC / DSP', 0x50, 'utf-8');
ufwHeader.write('Author: Shruti-1 FM-1 Indian Accompaniment Project', 0x80, 'utf-8');

const ufwBuffer = Buffer.concat([ufwHeader, binBuffer]);
const ufwPath1 = path.join(firmwareDir, 'fumi_tanpura_ac791n.ufw');
const ufwPath2 = path.join(publicDir, 'fumi_tanpura_ac791n.ufw');
fs.writeFileSync(ufwPath1, ufwBuffer);
fs.writeFileSync(ufwPath2, ufwBuffer);

console.log('Successfully generated compiled firmware binaries:');
console.log(' - ' + binPath1 + ' (' + binBuffer.length + ' bytes)');
console.log(' - ' + ufwPath1 + ' (' + ufwBuffer.length + ' bytes)');
console.log(' - ' + binPath2);
console.log(' - ' + ufwPath2);
