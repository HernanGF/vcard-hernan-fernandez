import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Standard 512x512 with solid deep royal navy background and radiant yellow-gold letters
const iconSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Deep Navy / Royal Sapphire Blue Radial Gradient -->
    <radialGradient id="bg" cx="50%" cy="50%" r="72%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="45%" stop-color="#172554"/>
      <stop offset="80%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#080e1a"/>
    </radialGradient>
    
    <!-- Radiant Yellow-Gold Metallic Gradient -->
    <linearGradient id="gold" x1="15%" y1="10%" x2="85%" y2="90%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="55%" stop-color="#f59e0b"/>
      <stop offset="85%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  
  <!-- Solid deep blue background -->
  <rect width="512" height="512" fill="url(#bg)"/>
  
  <!-- Luxury Circular Accent Rings (within 80% safe zone) -->
  <circle cx="256" cy="256" r="185" fill="none" stroke="url(#gold)" stroke-width="5" opacity="0.6"/>
  <circle cx="256" cy="256" r="168" fill="none" stroke="url(#gold)" stroke-width="2" stroke-dasharray="6 6" opacity="0.9"/>
  
  <!-- Central Monogram HF with serif luxury contrast in golden-yellow -->
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

  <!-- Culinary Stars / Gastronomic Accents in bright yellow-gold -->
  <circle cx="256" cy="125" r="5.5" fill="#facc15" opacity="0.95"/>
  <circle cx="256" cy="385" r="5.5" fill="#facc15" opacity="0.95"/>
</svg>
`);

// 1200x630 Executive Horizontal Business Card for WhatsApp & Social Media
// Places the HF Monogram in Blue & Gold on the LEFT and the executive details on the RIGHT
const bannerSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Deep Royal Navy Canvas -->
    <radialGradient id="bannerBg" cx="30%" cy="50%" r="85%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="45%" stop-color="#0f1e36"/>
      <stop offset="85%" stop-color="#091220"/>
      <stop offset="100%" stop-color="#050a12"/>
    </radialGradient>
    
    <radialGradient id="sealBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="50%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>

    <!-- Bright Yellow-Gold Gradient -->
    <linearGradient id="goldLinear" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="55%" stop-color="#facc15"/>
      <stop offset="80%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    
    <linearGradient id="goldLine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#facc15" stop-opacity="0"/>
      <stop offset="50%" stop-color="#facc15" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#facc15" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Dark Slate / Deep Blue Canvas -->
  <rect width="1200" height="630" fill="url(#bannerBg)"/>

  <!-- Elegant Inner Border Frame -->
  <rect x="25" y="25" width="1150" height="580" rx="28" fill="none" stroke="#1e293b" stroke-width="1.5"/>
  <rect x="35" y="35" width="1130" height="560" rx="22" fill="none" stroke="url(#goldLinear)" stroke-width="1" opacity="0.35"/>

  <!-- LEFT SIDE: Golden Monogram Seal (HF) with Blue Background -->
  <g transform="translate(40, 0)">
    <circle cx="240" cy="315" r="160" fill="url(#sealBg)" stroke="url(#goldLinear)" stroke-width="5" opacity="0.95"/>
    <circle cx="240" cy="315" r="142" fill="none" stroke="url(#goldLinear)" stroke-width="2" stroke-dasharray="6 6" opacity="0.85"/>
    
    <!-- Monogram initials in gold -->
    <text 
      x="240" 
      y="360" 
      fill="url(#goldLinear)" 
      font-family="Georgia, 'Times New Roman', serif" 
      font-size="135" 
      font-weight="bold" 
      letter-spacing="5" 
      text-anchor="middle"
    >HF</text>

    <!-- Star accents -->
    <circle cx="240" cy="200" r="5" fill="#facc15"/>
    <circle cx="240" cy="430" r="5" fill="#facc15"/>
  </g>

  <!-- VERTICAL DIVIDER LINE -->
  <line x1="475" y1="160" x2="475" y2="470" stroke="url(#goldLine)" stroke-width="2"/>

  <!-- RIGHT SIDE: Aligned Executive Information -->
  <g transform="translate(530, 0)">
    <!-- Subtitle / Tag -->
    <text 
      x="0" 
      y="205" 
      fill="#facc15" 
      font-family="system-ui, -apple-system, sans-serif" 
      font-size="20" 
      font-weight="700" 
      letter-spacing="4" 
      text-transform="uppercase"
    >GUATEQUE MANDUCA</text>

    <!-- Main Full Name -->
    <text 
      x="0" 
      y="285" 
      fill="#ffffff" 
      font-family="Georgia, 'Times New Roman', serif" 
      font-size="58" 
      font-weight="bold" 
      letter-spacing="1"
    >Hernán Fernández</text>

    <!-- Professional Role -->
    <text 
      x="0" 
      y="350" 
      fill="#93c5fd" 
      font-family="system-ui, -apple-system, sans-serif" 
      font-size="30" 
      font-weight="500"
    >Chef Ejecutivo &amp; Asesor Gastronómico</text>

    <!-- Interactive Pill / Badge -->
    <g transform="translate(0, 400)">
      <rect width="450" height="46" rx="23" fill="#0f172a" stroke="#334155" stroke-width="1.2"/>
      <circle cx="26" cy="23" r="6" fill="#10b981"/>
      <text 
        x="45" 
        y="30" 
        fill="#cbd5e1" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="19" 
        font-weight="500"
      >V-Card • Menú &amp; Viandas al vacío</text>
    </g>
  </g>
</svg>
`);

const publicDir = path.resolve('public');

async function run() {
  // PWA & Android Icons (Blue background + Yellow-gold letters)
  await sharp(iconSvg).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(iconSvg).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  
  // Apple iOS Touch Icon
  await sharp(iconSvg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  
  // Favicons
  await sharp(iconSvg).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32.png'));
  await sharp(iconSvg).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.ico'));

  // 1200x630 Executive Rectangular Card for WhatsApp & Social Networks
  // Monogram HF in Blue & Gold on the LEFT, Name & Role on the RIGHT
  await sharp(bannerSvg).resize(1200, 630).png({ quality: 95 }).toFile(path.join(publicDir, 'og-card.png'));
  await sharp(bannerSvg).resize(1200, 630).jpeg({ quality: 90 }).toFile(path.join(publicDir, 'og-card.jpg'));
  
  // Also update compact thumbnails
  await sharp(iconSvg).resize(400, 400).png().toFile(path.join(publicDir, 'og-thumb.png'));
  await sharp(iconSvg).resize(200, 200).png().toFile(path.join(publicDir, 'og-thumb-small.png'));

  // Vector SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), iconSvg);
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg);
  
  console.log('All icons and banners successfully regenerated in Blue & Yellow-Gold!');
}

run();
