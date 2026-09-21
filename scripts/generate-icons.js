import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgBuffer = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1c1917"/>
      <stop offset="100%" stop-color="#09090b"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  
  <!-- Outer Dark Slate & Obsidian Background -->
  <rect width="512" height="512" rx="100" fill="url(#bg)"/>
  
  <!-- Subtle circular border frame -->
  <circle cx="256" cy="256" r="215" fill="none" stroke="url(#gold)" stroke-width="6" opacity="0.4"/>
  <circle cx="256" cy="256" r="195" fill="none" stroke="url(#gold)" stroke-width="2.5" stroke-dasharray="8 6" opacity="0.8"/>
  
  <!-- Monogram Initials HF -->
  <text 
    x="256" 
    y="312" 
    fill="url(#gold)" 
    font-family="Georgia, 'Times New Roman', serif" 
    font-size="185" 
    font-weight="bold" 
    letter-spacing="10" 
    text-anchor="middle"
  >HF</text>

  <!-- Small Gastronomic Star Accent -->
  <circle cx="256" cy="115" r="5" fill="#f59e0b" opacity="0.9"/>
  <circle cx="256" cy="395" r="5" fill="#f59e0b" opacity="0.9"/>
</svg>
`);

const publicDir = path.resolve('public');

async function run() {
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgBuffer);
  console.log('Icons generated successfully!');
}

run();
