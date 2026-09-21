import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Standard 512x512 with solid background for perfect maskable Android + iOS support
const svgBuffer = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#1c1917"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </radialGradient>
    <linearGradient id="gold" x1="10%" y1="10%" x2="90%" y2="90%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="35%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
  </defs>
  
  <!-- Solid full bleed background to prevent white borders on Android/iOS -->
  <rect width="512" height="512" fill="url(#bg)"/>
  
  <!-- Luxury Circular Accent Rings (within 80% safe zone) -->
  <circle cx="256" cy="256" r="185" fill="none" stroke="url(#gold)" stroke-width="5" opacity="0.45"/>
  <circle cx="256" cy="256" r="168" fill="none" stroke="url(#gold)" stroke-width="2" stroke-dasharray="6 6" opacity="0.85"/>
  
  <!-- Central Monogram HF with serif luxury contrast -->
  <text 
    x="256" 
    y="308" 
    fill="url(#gold)" 
    font-family="Georgia, 'Times New Roman', serif" 
    font-size="160" 
    font-weight="bold" 
    letter-spacing="6" 
    text-anchor="middle"
  >HF</text>

  <!-- Culinary Stars / Gastronomic Accents -->
  <circle cx="256" cy="125" r="5" fill="#f59e0b" opacity="0.9"/>
  <circle cx="256" cy="385" r="5" fill="#f59e0b" opacity="0.9"/>
</svg>
`);

const publicDir = path.resolve('public');

async function run() {
  // PWA & Android Icons
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  
  // Apple iOS Touch Icon
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  
  // Favicon PNG fallbacks
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32.png'));
  await sharp(svgBuffer).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.ico'));
  
  // Vector SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgBuffer);
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgBuffer);
  
  console.log('All high-res HF monogram icons generated successfully!');
}

run();
