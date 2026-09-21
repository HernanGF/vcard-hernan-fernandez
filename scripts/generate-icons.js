import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Master 1024x1024 Monogram Emblem Matching User Reference:
// - Deep Boca Juniors Midnight Navy Blue Canvas
// - Elegant Metallic Golden Squircle (Rounded Square) Outer Frame
// - Central Vertical Gold Divider Bar
// - Serif Roman Capitals "H" and "F" in 3D Embossed Yellow-Gold
const iconSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <!-- Deep Boca Juniors Midnight Navy Blue Gradient -->
    <radialGradient id="bocaNavy" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#041a4a"/>
      <stop offset="55%" stop-color="#021235"/>
      <stop offset="85%" stop-color="#010a20"/>
      <stop offset="100%" stop-color="#000717"/>
    </radialGradient>

    <!-- Metallic Gold Outer Frame Gradient (3D Bevel Lighting) -->
    <linearGradient id="goldFrame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffde0"/>
      <stop offset="15%" stop-color="#fef08a"/>
      <stop offset="35%" stop-color="#facc15"/>
      <stop offset="60%" stop-color="#eab308"/>
      <stop offset="85%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>

    <!-- Metallic Gold Inner Specular Gleam -->
    <linearGradient id="goldInnerGleam" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="30%" stop-color="#fef08a" stop-opacity="0.5"/>
      <stop offset="70%" stop-color="#ca8a04" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#78350f" stop-opacity="0"/>
    </linearGradient>

    <!-- Central Vertical Divider Bar Gradient -->
    <linearGradient id="goldBar" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="12%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#facc15"/>
      <stop offset="80%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>

    <!-- Metallic 3D Embossed Gold Letters Gradient -->
    <linearGradient id="goldLetter" x1="20%" y1="10%" x2="80%" y2="95%">
      <stop offset="0%" stop-color="#fffde7"/>
      <stop offset="18%" stop-color="#fef08a"/>
      <stop offset="42%" stop-color="#facc15"/>
      <stop offset="72%" stop-color="#eab308"/>
      <stop offset="90%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>

    <!-- Subtle Drop Shadow for 3D Elevation -->
    <filter id="elevate" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.65"/>
    </filter>
  </defs>

  <!-- Solid Deep Midnight Navy Blue Canvas -->
  <rect width="1024" height="1024" fill="url(#bocaNavy)"/>

  <!-- Outer Rounded Square (Squircle) Gold Frame -->
  <rect 
    x="62" 
    y="62" 
    width="900" 
    height="900" 
    rx="140" 
    fill="none" 
    stroke="url(#goldFrame)" 
    stroke-width="19" 
    filter="url(#elevate)"
  />

  <!-- Inner Golden Specular Bevel Line on the Squircle -->
  <rect 
    x="74" 
    y="74" 
    width="876" 
    height="876" 
    rx="128" 
    fill="none" 
    stroke="url(#goldInnerGleam)" 
    stroke-width="3" 
  />

  <!-- Central Vertical Metallic Gold Divider Bar -->
  <rect 
    x="505" 
    y="230" 
    width="14" 
    height="564" 
    rx="3" 
    fill="url(#goldBar)" 
    filter="url(#elevate)"
  />

  <!-- Roman Serif Letter 'H' on the Left -->
  <text 
    x="328" 
    y="654" 
    font-family="Liberation Serif, Nimbus Roman, serif" 
    font-size="390" 
    font-weight="bold" 
    letter-spacing="-4" 
    fill="url(#goldLetter)" 
    text-anchor="middle" 
    filter="url(#elevate)"
  >H</text>

  <!-- Roman Serif Letter 'F' on the Right -->
  <text 
    x="692" 
    y="654" 
    font-family="Liberation Serif, Nimbus Roman, serif" 
    font-size="390" 
    font-weight="bold" 
    letter-spacing="-4" 
    fill="url(#goldLetter)" 
    text-anchor="middle" 
    filter="url(#elevate)"
  >F</text>
</svg>
`);

// 1200x630 Executive Social Preview Card for WhatsApp & Social Networks
// Features the new H | F Squircle Emblem on the Left and Executive Details on the Right
const bannerSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Deep Boca Midnight Navy Background -->
    <radialGradient id="bannerNavy" cx="35%" cy="50%" r="85%">
      <stop offset="0%" stop-color="#041a4a"/>
      <stop offset="50%" stop-color="#021235"/>
      <stop offset="100%" stop-color="#000717"/>
    </radialGradient>

    <!-- Metallic Gold Gradients -->
    <linearGradient id="bGoldLinear" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffde0"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#facc15"/>
      <stop offset="80%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>

    <linearGradient id="bDividerLine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffd500" stop-opacity="0"/>
      <stop offset="50%" stop-color="#ffd500" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#ffd500" stop-opacity="0"/>
    </linearGradient>

    <filter id="bShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Deep Navy Canvas -->
  <rect width="1200" height="630" fill="url(#bannerNavy)"/>

  <!-- Elegant Inner Border -->
  <rect x="25" y="25" width="1150" height="580" rx="28" fill="none" stroke="#172554" stroke-width="1.5" opacity="0.6"/>
  <rect x="35" y="35" width="1130" height="560" rx="22" fill="none" stroke="url(#bGoldLinear)" stroke-width="1.5" opacity="0.35"/>

  <!-- LEFT SIDE: Golden Squircle Emblem (H | F) scaled to 430x430 -->
  <g transform="translate(60, 100)">
    <!-- Squircle Frame -->
    <rect 
      x="0" 
      y="0" 
      width="430" 
      height="430" 
      rx="68" 
      fill="#021235" 
      stroke="url(#bGoldLinear)" 
      stroke-width="9" 
      filter="url(#bShadow)"
    />
    <rect 
      x="7" 
      y="7" 
      width="416" 
      height="416" 
      rx="61" 
      fill="none" 
      stroke="#fffde0" 
      stroke-width="1.5" 
      opacity="0.4"
    />

    <!-- Central Divider Bar -->
    <rect 
      x="211" 
      y="98" 
      width="8" 
      height="234" 
      rx="2" 
      fill="url(#bGoldLinear)" 
      filter="url(#bShadow)"
    />

    <!-- 'H' -->
    <text 
      x="138" 
      y="274" 
      font-family="Liberation Serif, Nimbus Roman, serif" 
      font-size="160" 
      font-weight="bold" 
      letter-spacing="-2" 
      fill="url(#bGoldLinear)" 
      text-anchor="middle" 
      filter="url(#bShadow)"
    >H</text>

    <!-- 'F' -->
    <text 
      x="290" 
      y="274" 
      font-family="Liberation Serif, Nimbus Roman, serif" 
      font-size="160" 
      font-weight="bold" 
      letter-spacing="-2" 
      fill="url(#bGoldLinear)" 
      text-anchor="middle" 
      filter="url(#bShadow)"
    >F</text>
  </g>

  <!-- VERTICAL DIVIDER LINE -->
  <line x1="535" y1="140" x2="535" y2="490" stroke="url(#bDividerLine)" stroke-width="2"/>

  <!-- RIGHT SIDE: Executive Identity & Catering Details -->
  <g transform="translate(585, 0)">
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
  await sharp(iconSvg).resize(600, 600).jpeg({ quality: 94 }).toFile(path.join(publicDir, 'og-monogram-blue.jpg'));
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

  console.log('Successfully generated all icons matching the reference image: H | F in Squircle with Boca Navy & Gold!');
}

run();
