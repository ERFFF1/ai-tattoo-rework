// scripts/make_mockup_placeholder.mjs
import fs from 'node:fs';
import sharp from 'sharp';

const W = 1200, H = 1600;
const bg = { create: { width: W, height: H, channels: 3, background: '#ECE0D4' } };

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <ellipse cx="650" cy="950" rx="320" ry="520" fill="none" stroke="#5a5148" stroke-width="8"/>
  <text x="40" y="80" font-family="Arial" font-size="36" fill="#50473f">Triceps Mockup Placeholder</text>
</svg>`;

const outPath = 'public/mockups/triceps_base.png';
await sharp(bg).composite([{ input: Buffer.from(svg) }]).png().toFile(outPath);
console.log('ok:', outPath);
