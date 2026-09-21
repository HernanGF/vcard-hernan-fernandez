import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// 600x600 Icon with Authentic Boca Juniors Dark Navy Blue Background & Vibrant Yellow-Gold Letters
const iconSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <!-- Boca Juniors Deep Dark Navy Blue Gradient (#0a2458 -> #041738 -> #020d22) -->
    <radialGradient id="bocaNavyBg" cx="50%" cy="50%" r="72%">
      <stop offset="0%" stop-color="#0c2963"/>
      <stop offset="50%" stop-color="#071b42"/>
      <stop offset="85%" stop-color="#030e24"/>
      <stop offset="100%" stop-color="#020817"/>
    </radialGradient>
    
    <radialGradient id="bocaDiscBg" cx="50%" cy="50%" r="68%">
      <stop offset="0%" stop-color="#0e3175"/>
      <stop offset="45%" stop-color="#081e4a"/>
      <stop offset="85%" stop-color="#04122d"/>
      <stop offset="100%" stop-color="#020a1c"/>
    </radialGradient>

    <!-- Boca Juniors Bright Yellow-Gold Gradient (El Oro Xeneize) -->
    <linearGradient id="bocaGold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff885"/>
      <stop offset="20%" stop-color="#ffd500"/>
      <stop offset="60%" stop-color="#ffbe00"/>
      <stop offset="90%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>

    <linearGradient id="ringGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff59d"/>
      <stop offset="45%" stop-color="#ffd500"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
  </defs>

  <!-- Solid Boca Juniors Dark Navy Blue canvas -->
  <rect width="600" height="600" fill="url(#bocaNavyBg)"/>

  <!-- Outer Circular Disc with deep dark navy blue fill and pure yellow-gold border -->
  <circle cx="300" cy="300" r="236" fill="url(#bocaDiscBg)" stroke="url(#ringGold)" stroke-width="8" />
  <circle cx="300" cy="300" r="214" fill="none" stroke="url(#ringGold)" stroke-width="3" stroke-dasharray="8 8" opacity="0.95"/>
  
  <!-- Central Monogram HF with serif luxury typography in pure Boca yellow-gold -->
  <text 
    x="300" 
    y="360" 
    fill="url(#bocaGold)" 
    font-family="Georgia, 'Times New Roman', serif" 
    font-size="185" 
    font-weight="bold" 
    letter-spacing="6" 
    text-anchor="middle"
  >HF</text>

  <!-- Boca Gold Stars / Culinary Accents in bright yellow-gold -->
  <circle cx="300" cy="148" r="7.5" fill="#ffd500"/>
  <circle cx="300" cy="452" r="7.5" fill="#ffd500"/>
</svg>
`);

// 1200x630 Executive Horizontal Business Card for WhatsApp & Social Media
// Deep Boca Dark Navy Blue with Boca Gold Accents
const bannerSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Deep Boca Navy Canvas -->
    <radialGradient id="bannerBg" cx="30%" cy="50%" r="85%">
      <stop offset="0%" stop-color="#0a2458"/>
      <stop offset="50%" stop-color="#051433"/>
      <stop offset="100%" stop-color="#020817"/>
    </radialGradient>
    
    <radialGradient id="sealBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#0e3175"/>
      <stop offset="50%" stop-color="#081e4a"/>
      <stop offset="100%" stop-color="#020a1c"/>
    </radialGradient>

    <!-- Boca Gold Gradient -->
    <linearGradient id="goldLinearBanner" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff885"/>
      <stop offset="25%" stop-color="#ffd500"/>
      <stop offset="60%" stop-color="#ffbe00"/>
      <stop offset="85%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    
    <linearGradient id="goldLine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffd500" stop-opacity="0"/>
      <stop offset="50%" stop-color="#ffd500" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#ffd500" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Deep Boca Navy Canvas -->
  <rect width="1200" height="630" fill="url(#bannerBg)"/>

  <!-- Elegant Inner Border Frame with Golden Accents -->
  <rect x="25" y="25" width="1150" height="580" rx="28" fill="none" stroke="#172554" stroke-width="1.5" opacity="0.6"/>
  <rect x="35" y="35" width="1130" height="560" rx="22" fill="none" stroke="url(#goldLinearBanner)" stroke-width="1.5" opacity="0.45"/>

  <!-- LEFT SIDE: Golden Monogram Seal (HF) in Dark Boca Navy & Gold -->
  <g transform="translate(40, 0)">
    <circle cx="240" cy="315" r="160" fill="url(#sealBg)" stroke="url(#goldLinearBanner)" stroke-width="6.5"/>
    <circle cx="240" cy="315" r="142" fill="none" stroke="url(#goldLinearBanner)" stroke-width="2.5" stroke-dasharray="7 7" opacity="0.95"/>
    
    <!-- Monogram initials in bright Boca gold -->
    <text 
      x="240" 
      y="360" 
      fill="url(#goldLinearBanner)" 
      font-family="Georgia, 'Times New Roman', serif" 
      font-size="135" 
      font-weight="bold" 
      letter-spacing="5" 
      text-anchor="middle"
    >HF</text>

    <!-- Boca gold stars -->
    <circle cx="240" cy="200" r="6" fill="#ffd500"/>
    <circle cx="240" cy="430" r="6" fill="#ffd500"/>
  </g>

  <!-- VERTICAL DIVIDER LINE -->
  <line x1="475" y1="160" x2="475" y2="470" stroke="url(#goldLine)" stroke-width="2"/>

  <!-- RIGHT SIDE: Aligned Executive Information -->
  <g transform="translate(530, 0)">
    <!-- Subtitle / Tag -->
    <text 
      x="0" 
      y="205" 
      fill="#ffd500" 
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

    <!-- Interactive Pill / Badge in Boca Blue & Gold -->
    <g transform="translate(0, 400)">
      <rect width="450" height="46" rx="23" fill="#0c2963" stroke="#ffd500" stroke-width="1.2"/>
      <circle cx="26" cy="23" r="6" fill="#ffd500"/>
      <text 
        x="45" 
        y="30" 
        fill="#ffffff" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="19" 
        font-weight="600"
      >V-Card • Menú &amp; Viandas al vacío</text>
    </g>
  </g>
</svg>
`);

const publicDir = path.resolve('public');

async function run() {
  // PWA & Android Icons (Boca Juniors Dark Navy Blue background + Yellow-gold letters)
  await sharp(iconSvg).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(iconSvg).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  
  // Apple iOS Touch Icon
  await sharp(iconSvg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  
  // Favicons
  await sharp(iconSvg).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32.png'));
  await sharp(iconSvg).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.ico'));

  // Dedicated Square Monogram in Boca Navy Blue & Yellow-Gold (for WhatsApp square preview)
  await sharp(iconSvg).resize(600, 600).png().toFile(path.join(publicDir, 'og-monogram-blue.png'));
  await sharp(iconSvg).resize(400, 400).png().toFile(path.join(publicDir, 'og-thumb.png'));
  await sharp(iconSvg).resize(200, 200).png().toFile(path.join(publicDir, 'og-thumb-small.png'));

  // 1200x630 Executive Rectangular Card for WhatsApp & Social Networks
  await sharp(bannerSvg).resize(1200, 630).png({ quality: 95 }).toFile(path.join(publicDir, 'og-card.png'));
  await sharp(bannerSvg).resize(1200, 630).jpeg({ quality: 90 }).toFile(path.join(publicDir, 'og-card.jpg'));

  // Vector SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), iconSvg);
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg);
  
  console.log('All icons and banners successfully regenerated in Authentic Boca Juniors Dark Navy Blue & Gold!');
}

run();
