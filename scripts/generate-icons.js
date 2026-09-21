import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Master 1024x1024 Monogram Emblem Matching User Uploaded Reference:
// - Deep Navy Textured Background (Boca Juniors Midnight Blue)
// - Concentric Double Rounded Squircle Golden Frame with 3D Bevel Lighting
// - Central Vertical Metallic Gold Divider Bar
// - Serif Roman Capitals "H" and "F" in 3D Embossed Warm Gold with Realistic Cast Shadows
const iconSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <!-- Deep Boca Juniors Navy Woven Canvas Background -->
    <radialGradient id="bgNavy" cx="50%" cy="48%" r="72%">
      <stop offset="0%" stop-color="#071d49"/>
      <stop offset="45%" stop-color="#041437"/>
      <stop offset="80%" stop-color="#020b20"/>
      <stop offset="100%" stop-color="#010612"/>
    </radialGradient>

    <!-- Metallic Brushed Gold Gradient (3D Light from Top-Left) -->
    <linearGradient id="gold3D" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#fff9c4"/>
      <stop offset="14%" stop-color="#fef08a"/>
      <stop offset="32%" stop-color="#facc15"/>
      <stop offset="55%" stop-color="#eab308"/>
      <stop offset="75%" stop-color="#ca8a04"/>
      <stop offset="90%" stop-color="#a16207"/>
      <stop offset="100%" stop-color="#713f12"/>
    </linearGradient>

    <!-- Deep 3D Drop Shadow on Blue Fabric -->
    <filter id="castShadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="12" dy="18" stdDeviation="14" flood-color="#00030c" flood-opacity="0.92"/>
      <feDropShadow dx="4" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
    </filter>

    <!-- Fine Canvas Fabric Texture Filter -->
    <filter id="clothTexture">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.055 0" in="noise" result="coloredNoise"/>
      <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite"/>
      <feBlend mode="soft-light" in="composite" in2="SourceGraphic"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1024" height="1024" fill="url(#bgNavy)"/>

  <!-- Subtle Fabric Texture Pattern -->
  <rect width="1024" height="1024" fill="url(#bgNavy)" filter="url(#clothTexture)"/>

  <!-- Outer Rounded Squircle Frame (Double Border - Outer) -->
  <rect 
    x="142" 
    y="142" 
    width="740" 
    height="740" 
    rx="168" 
    fill="none" 
    stroke="url(#gold3D)" 
    stroke-width="20" 
    filter="url(#castShadow)"
  />

  <!-- Inner Rounded Squircle Frame (Double Border - Inner) -->
  <rect 
    x="182" 
    y="182" 
    width="660" 
    height="660" 
    rx="132" 
    fill="none" 
    stroke="url(#gold3D)" 
    stroke-width="14" 
    filter="url(#castShadow)"
  />

  <!-- Center Vertical Metallic Gold Divider Bar -->
  <rect 
    x="505" 
    y="320" 
    width="14" 
    height="384" 
    rx="4" 
    fill="url(#gold3D)" 
    filter="url(#castShadow)"
  />

  <!-- Left Capital Serif Letter 'H' -->
  <text 
    x="338" 
    y="644" 
    font-family="Liberation Serif, Nimbus Roman, C059, Georgia, serif" 
    font-size="315" 
    font-weight="bold" 
    letter-spacing="-4" 
    fill="url(#gold3D)" 
    text-anchor="middle" 
    filter="url(#castShadow)"
  >H</text>

  <!-- Right Capital Serif Letter 'F' -->
  <text 
    x="658" 
    y="644" 
    font-family="Liberation Serif, Nimbus Roman, C059, Georgia, serif" 
    font-size="315" 
    font-weight="bold" 
    letter-spacing="-4" 
    fill="url(#gold3D)" 
    text-anchor="middle" 
    filter="url(#castShadow)"
  >F</text>
</svg>
`);

// 1200x630 Executive Social Preview Card for WhatsApp & Social Networks
const bannerSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Deep Boca Midnight Navy Background -->
    <radialGradient id="bannerNavy" cx="30%" cy="50%" r="85%">
      <stop offset="0%" stop-color="#071d49"/>
      <stop offset="50%" stop-color="#041437"/>
      <stop offset="100%" stop-color="#010612"/>
    </radialGradient>

    <!-- Metallic Brushed Gold Gradient -->
    <linearGradient id="bGold3D" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#fff9c4"/>
      <stop offset="15%" stop-color="#fef08a"/>
      <stop offset="35%" stop-color="#facc15"/>
      <stop offset="60%" stop-color="#eab308"/>
      <stop offset="85%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#713f12"/>
    </linearGradient>

    <linearGradient id="bDividerLine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffd500" stop-opacity="0"/>
      <stop offset="50%" stop-color="#ffd500" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#ffd500" stop-opacity="0"/>
    </linearGradient>

    <filter id="bShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="8" dy="12" stdDeviation="10" flood-color="#00020a" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Deep Navy Canvas -->
  <rect width="1200" height="630" fill="url(#bannerNavy)"/>

  <!-- Elegant Inner Accent Borders -->
  <rect x="25" y="25" width="1150" height="580" rx="28" fill="none" stroke="#172554" stroke-width="1.5" opacity="0.6"/>
  <rect x="35" y="35" width="1130" height="560" rx="22" fill="none" stroke="url(#bGold3D)" stroke-width="1.5" opacity="0.35"/>

  <!-- LEFT SIDE: Golden Double Squircle Emblem (H | F) scaled to 430x430 -->
  <g transform="translate(65, 100)">
    <!-- Outer Squircle Frame -->
    <rect 
      x="0" 
      y="0" 
      width="430" 
      height="430" 
      rx="96" 
      fill="#041437" 
      stroke="url(#bGold3D)" 
      stroke-width="10" 
      filter="url(#bShadow)"
    />

    <!-- Inner Squircle Frame -->
    <rect 
      x="24" 
      y="24" 
      width="382" 
      height="382" 
      rx="76" 
      fill="none" 
      stroke="url(#bGold3D)" 
      stroke-width="7" 
      filter="url(#bShadow)"
    />

    <!-- Central Divider Bar -->
    <rect 
      x="211" 
      y="114" 
      width="8" 
      height="202" 
      rx="2" 
      fill="url(#bGold3D)" 
      filter="url(#bShadow)"
    />

    <!-- 'H' -->
    <text 
      x="142" 
      y="276" 
      font-family="Liberation Serif, Nimbus Roman, C059, Georgia, serif" 
      font-size="155" 
      font-weight="bold" 
      letter-spacing="-2" 
      fill="url(#bGold3D)" 
      text-anchor="middle" 
      filter="url(#bShadow)"
    >H</text>

    <!-- 'F' -->
    <text 
      x="276" 
      y="276" 
      font-family="Liberation Serif, Nimbus Roman, C059, Georgia, serif" 
      font-size="155" 
      font-weight="bold" 
      letter-spacing="-2" 
      fill="url(#bGold3D)" 
      text-anchor="middle" 
      filter="url(#bShadow)"
    >F</text>
  </g>

  <!-- VERTICAL SEPARATOR LINE -->
  <line x1="540" y1="140" x2="540" y2="490" stroke="url(#bDividerLine)" stroke-width="2"/>

  <!-- RIGHT SIDE: Executive Identity & Catering Details -->
  <g transform="translate(595, 0)">
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

    <!-- Main Name -->
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
      <rect width="470" height="48" rx="24" fill="#041a4a" stroke="#ffd500" stroke-width="1.2"/>
      <circle cx="28" cy="24" r="6" fill="#ffd500"/>
      <text 
        x="48" 
        y="31" 
        fill="#ffffff" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="19" 
        font-weight="600"
      >V-Card • Menú Digital &amp; Viandas al vacío</text>
    </g>
  </g>
</svg>
`);

const publicDir = path.resolve('public');

async function run() {
  // 1. WhatsApp Dedicated Square Monogram (600x600 in JPG & PNG)
  await sharp(iconSvg).resize(600, 600).jpeg({ quality: 95 }).toFile(path.join(publicDir, 'og-hf-boca.jpg'));
  await sharp(iconSvg).resize(600, 600).png().toFile(path.join(publicDir, 'og-hf-boca.png'));
  await sharp(iconSvg).resize(600, 600).jpeg({ quality: 95 }).toFile(path.join(publicDir, 'og-monogram-blue.jpg'));
  await sharp(iconSvg).resize(600, 600).png().toFile(path.join(publicDir, 'og-monogram-blue.png'));

  // 2. High-Res Social Preview Cards (1200x630)
  await sharp(bannerSvg).resize(1200, 630).jpeg({ quality: 92 }).toFile(path.join(publicDir, 'og-card.jpg'));
  await sharp(bannerSvg).resize(1200, 630).png({ quality: 95 }).toFile(path.join(publicDir, 'og-card.png'));

  // 3. PWA & Mobile App Icons
  await sharp(iconSvg).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(iconSvg).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(iconSvg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 4. Compact Favicons & Thumbnails
  await sharp(iconSvg).resize(400, 400).png().toFile(path.join(publicDir, 'og-thumb.png'));
  await sharp(iconSvg).resize(200, 200).png().toFile(path.join(publicDir, 'og-thumb-small.png'));
  await sharp(iconSvg).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32.png'));
  await sharp(iconSvg).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.ico'));

  // 5. Vector Files
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), iconSvg);
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg);

  console.log('Successfully generated all icons matching the user uploaded reference: H | F in Double Squircle with 3D Gold!');
}

run();
