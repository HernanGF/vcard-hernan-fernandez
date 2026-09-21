import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { SafeQrCode } from './SafeQrCode';
import { 
  Phone, 
  Instagram, 
  Linkedin, 
  UtensilsCrossed, 
  Download, 
  Maximize2, 
  Minimize2,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Smartphone,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { ChefProfile, CardTheme, QrMode } from '../types';
import { sanitizeInstagram, sanitizeLinkedIn, sanitizeWhatsApp, getQrPayload, downloadVCardFile } from '../utils/vcard';

interface SoloQrCardProps {
  profile: ChefProfile;
  theme: CardTheme;
  qrMode: QrMode;
  onChangeQrMode: (mode: QrMode) => void;
  onOpenMobileView: () => void;
}

export function SoloQrCard({
  profile,
  theme,
  qrMode,
  onChangeQrMode,
  onOpenMobileView,
}: SoloQrCardProps) {
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const igChef = sanitizeInstagram(profile.instagramChef);
  const igWateke = sanitizeInstagram(profile.instagramWateke);
  const linkedin = sanitizeLinkedIn(profile.linkedinUrl);
  const wa = sanitizeWhatsApp(profile.whatsapp || profile.phone);

  const qrPayload = getQrPayload(profile, qrMode);

  const handleDownloadQrPng = () => {
    const canvas = qrCanvasRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${(profile.name || 'Chef').replace(/\s+/g, '_')}_Contacto.png`;
      a.click();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* Target card: Pure QR Presentation with luxury culinary badge */}
      <div
        id="solo-qr-card-container"
        className={`relative w-full rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-300 shadow-2xl border ${theme.cardBg} ${theme.border}`}
      >
        {/* Subtle executive watermark */}
        <div className="absolute top-2 right-2 pointer-events-none opacity-[0.03] text-white">
          <UtensilsCrossed className="w-48 h-48" />
        </div>

        {/* Top Chef Title Header */}
        <div className="w-full flex items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2 text-left">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-amber-950/40 shrink-0">
              <UtensilsCrossed className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-100 tracking-wide leading-tight">
                {profile.name || 'Hernán'}
              </h2>
              <p className="text-[11px] text-amber-400 font-semibold tracking-wider uppercase">
                {profile.role || 'Chef Ejecutivo & Asesor'}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 tracking-wider">
            {profile.company || 'Wateke Manduca'}
          </span>
        </div>

        {/* Main Hero QR Code */}
        <div className="relative p-4 sm:p-5 bg-white rounded-3xl shadow-2xl border-2 border-amber-500/40 my-2 group">
          {/* Ornate corner marks */}
          <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-600" />
          <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-600" />
          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-600" />
          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-600" />

          <SafeQrCode
            value={qrPayload}
            size={230}
            fgColor={theme.qrFg}
            bgColor={theme.qrBg}
          />

          {/* Hidden Canvas for High-Resolution Export */}
          <div ref={qrCanvasRef} className="hidden">
            <QRCodeCanvas
              value={qrPayload}
              size={800}
              level="M"
              fgColor={theme.qrFg}
              bgColor={theme.qrBg}
              includeMargin={true}
            />
          </div>
        </div>

        {/* Scan instruction */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-300 tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Apuntá con la cámara para guardar mi contacto</span>
        </div>

        {/* Direct interactive touchpoints: each button opens the real app/link */}
        <div className="w-full mt-5 pt-4 border-t border-neutral-800/80 text-left">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400">
              O abrí directamente tocando:
            </span>
            <span className="text-[10px] text-amber-400/80">Clickeables</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* 1. WhatsApp directo */}
            <a
              id="solo-btn-wa"
              href={wa.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/90 hover:bg-emerald-950/40 border border-neutral-800 hover:border-emerald-500/50 text-stone-200 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="overflow-hidden min-w-0">
                <div className="text-[10px] font-bold uppercase text-emerald-400 truncate flex items-center gap-0.5">
                  WhatsApp
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </div>
                <div className="text-xs font-medium truncate text-stone-300">
                  {profile.phone}
                </div>
              </div>
            </a>

            {/* 2. Instagram Chef */}
            <a
              id="solo-btn-ig-chef"
              href={igChef.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/90 hover:bg-pink-950/40 border border-neutral-800 hover:border-pink-500/50 text-stone-200 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="overflow-hidden min-w-0">
                <div className="text-[10px] font-bold uppercase text-pink-400 truncate flex items-center gap-0.5">
                  IG Chef
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </div>
                <div className="text-xs font-medium truncate text-stone-300">
                  {igChef.handle}
                </div>
              </div>
            </a>

            {/* 3. Instagram Wateke Manduca */}
            <a
              id="solo-btn-ig-wateke"
              href={igWateke.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/90 hover:bg-amber-950/40 border border-neutral-800 hover:border-amber-500/50 text-stone-200 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div className="overflow-hidden min-w-0">
                <div className="text-[10px] font-bold uppercase text-amber-400 truncate flex items-center gap-0.5">
                  Guateque Manduca
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </div>
                <div className="text-xs font-medium truncate text-stone-300">
                  {igWateke.handle}
                </div>
              </div>
            </a>

            {/* 4. LinkedIn Personal */}
            <a
              id="solo-btn-linkedin"
              href={linkedin.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-900/90 hover:bg-blue-950/40 border border-neutral-800 hover:border-blue-500/50 text-stone-200 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Linkedin className="w-4 h-4" />
              </div>
              <div className="overflow-hidden min-w-0">
                <div className="text-[10px] font-bold uppercase text-blue-400 truncate flex items-center gap-0.5">
                  LinkedIn
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </div>
                <div className="text-xs font-medium truncate text-stone-300">
                  {linkedin.display}
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Action button bar */}
        <div className="w-full mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs">
          <button
            onClick={() => downloadVCardFile(profile)}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar archivo .VCF</span>
          </button>

          <button
            onClick={onOpenMobileView}
            className="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simular en Celular</span>
          </button>
        </div>
      </div>

      {/* Download PNG Button */}
      <div className="w-full mt-4 flex items-center justify-center gap-2">
        <button
          onClick={handleDownloadQrPng}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-950/50 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Código QR (PNG Alta Definición)</span>
        </button>
      </div>
    </div>
  );
}
