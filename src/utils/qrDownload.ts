/**
 * Utility to download a high-resolution QR code framed with luxury culinary branding
 * and explicit title "V-Card Hernán Fernández"
 */

interface FramedQrOptions {
  qrCanvas: HTMLCanvasElement;
  name?: string;
  role?: string;
  company?: string;
  subtitle?: string;
}

export function downloadFramedQr({
  qrCanvas,
  name = 'Hernán Fernández',
  role = 'Chef Ejecutivo & Asesor Gastronómico',
  company = 'Guateque Manduca',
}: FramedQrOptions) {
  // Create high-resolution canvas (1200 x 1500 px)
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 1500;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Helper for drawing rounded rectangle
  const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // 1. Dark culinary luxury background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#161412');
  bgGrad.addColorStop(0.4, '#0e0c0a');
  bgGrad.addColorStop(1, '#080706');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Warm radial golden glow at top
  const glowGrad = ctx.createRadialGradient(width / 2, 220, 60, width / 2, 220, 600);
  glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.16)');
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, 650);

  // 2. Elegant double golden frame
  const outerMargin = 50;
  const cornerRadius = 36;

  // Outer solid gold frame line
  ctx.save();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 4;
  drawRoundedRect(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, cornerRadius);
  ctx.stroke();

  // Inner fine accent gold line
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 1.5;
  const innerMargin = outerMargin + 14;
  drawRoundedRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2, cornerRadius - 10);
  ctx.stroke();

  // Corner decorative accents
  const drawCornerDot = (cx: number, cy: number) => {
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
  };
  drawCornerDot(outerMargin + 24, outerMargin + 24);
  drawCornerDot(width - outerMargin - 24, outerMargin + 24);
  drawCornerDot(outerMargin + 24, height - outerMargin - 24);
  drawCornerDot(width - outerMargin - 24, height - outerMargin - 24);
  ctx.restore();

  // 3. Header Texts
  ctx.textAlign = 'center';

  // Role badge text
  const roleText = (role || 'Chef Ejecutivo & Asesor Gastronómico').toUpperCase();
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 22px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(roleText, width / 2, 140);

  // Title: "V-Card Hernán Fernández"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px "Cormorant Garamond", Georgia, serif';
  const vcardTitle = `V-Card ${name || 'Hernán Fernández'}`;
  ctx.fillText(vcardTitle, width / 2, 208);

  // Company / Concept
  if (company) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(company, width / 2, 260);
  }

  // Gold divider line
  const divWidth = 320;
  const divY = 292;
  const divGrad = ctx.createLinearGradient(width / 2 - divWidth / 2, divY, width / 2 + divWidth / 2, divY);
  divGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
  divGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.85)');
  divGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - divWidth / 2, divY);
  ctx.lineTo(width / 2 + divWidth / 2, divY);
  ctx.stroke();

  // 4. White high-contrast framed container for the QR Code
  const qrBoxSize = 720;
  const qrBoxX = (width - qrBoxSize) / 2;
  const qrBoxY = 330;
  const qrBoxRadius = 32;

  ctx.save();
  ctx.shadowColor = 'rgba(245, 158, 11, 0.3)';
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 15;
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, qrBoxRadius);
  ctx.fill();
  ctx.restore();

  // Golden border around white container
  ctx.save();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 6;
  drawRoundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, qrBoxRadius);
  ctx.stroke();
  ctx.restore();

  // Draw high-resolution QR Code image in the center
  const qrPadding = 35;
  const qrDrawSize = qrBoxSize - qrPadding * 2;
  ctx.drawImage(qrCanvas, qrBoxX + qrPadding, qrBoxY + qrPadding, qrDrawSize, qrDrawSize);

  // 5. Instruction Footer
  const footerStartY = 1120;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Escaneá con la cámara de tu celular', width / 2, footerStartY);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 24px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Para abrir y guardar mi contacto directo en tu agenda (.vcf)', width / 2, footerStartY + 50);

  ctx.fillStyle = '#d6d3d1';
  ctx.font = '600 20px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('WhatsApp • Teléfono • Redes Sociales • Guateque Manduca', width / 2, footerStartY + 96);

  ctx.fillStyle = '#78716c';
  ctx.font = 'normal 18px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Buenos Aires, Argentina', width / 2, footerStartY + 132);

  // 6. Download file
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `V-Card_${(name || 'Hernan_Fernandez').replace(/\s+/g, '_')}_QR.png`;
  a.click();
}
