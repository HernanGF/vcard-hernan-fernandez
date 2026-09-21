import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { SafeQrCode } from './SafeQrCode';
import { 
  Instagram, 
  Linkedin, 
  UtensilsCrossed, 
  Download, 
  ExternalLink,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Copy,
  Globe,
  Smartphone,
  Check,
  Share2,
  Mail
} from 'lucide-react';
import { ChefProfile, CardTheme, QrMode } from '../types';
import { 
  sanitizeInstagram, 
  sanitizeLinkedIn, 
  sanitizeWhatsApp, 
  getQrPayload, 
  downloadVCardFile,
  buildPublicWebProfileUrl 
} from '../utils/vcard';
import { downloadFramedQr } from '../utils/qrDownload';

interface SoloQrPresenterProps {
  profile: ChefProfile;
  theme: CardTheme;
  qrMode: QrMode;
  onChangeQrMode: (mode: QrMode) => void;
  onOpenPublicLanding: () => void;
}

export function SoloQrPresenter({
  profile,
  theme,
  qrMode,
  onChangeQrMode,
  onOpenPublicLanding,
}: SoloQrPresenterProps) {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const igChef = sanitizeInstagram(profile.instagramChef);
  const igWateke = sanitizeInstagram(profile.instagramWateke);
  const linkedin = sanitizeLinkedIn(profile.linkedinUrl);
  const wa = sanitizeWhatsApp(profile.whatsapp || profile.phone);

  const publicLandingUrl = buildPublicWebProfileUrl(profile);
  const qrPayload = getQrPayload(profile, qrMode);

  const handleCopyWebLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLandingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleDownloadQrPng = () => {
    const canvas = document.getElementById('solo-qr-canvas') as HTMLCanvasElement | null;
    if (canvas) {
      downloadFramedQr({
        qrCanvas: canvas,
        name: profile.name || 'Hernán Fernández',
        role: profile.role || 'Chef Ejecutivo & Asesor Gastronómico',
        company: profile.company || 'Guateque Manduca',
      });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      
      {/* Informative Banner about what the QR does */}
      <div className="w-full mb-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-left">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
          <Globe className="w-4 h-4" />
        </div>
        <div className="text-xs text-stone-200 leading-relaxed">
          <span className="font-bold text-amber-300 block">
            {qrMode === 'weblink' 
              ? 'Código QR configurado a tu Página Web' 
              : 'Código QR configurado en modo vCard directo'}
          </span>
          {qrMode === 'weblink' 
            ? 'Al escanearlo con cualquier celular, se abrirá tu página web con todos tus enlaces y el botón para guardar el contacto directo en la agenda.' 
            : 'Al escanearlo, el teléfono intentará guardar el contacto de forma directa en la agenda sin abrir navegador.'}
        </div>
      </div>

      {/* The Hero QR Stand / Card */}
      <div 
        id="solo-card-frame"
        className={`relative w-full rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl border transition-all duration-300 ${theme.cardBg} ${theme.border}`}
      >
        {/* Subtle executive watermark */}
        <div className="absolute top-3 right-3 pointer-events-none opacity-[0.03] text-white">
          <UtensilsCrossed className="w-48 h-48" />
        </div>

        {/* Executive Header */}
        <div className="w-full flex items-center justify-between gap-3 mb-4 pb-3.5 border-b border-neutral-800/80">
          <div className="flex items-center gap-3 text-left">
            {profile.avatarUrl ? (
              <div className="relative shrink-0">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-amber-400/80 shadow-md"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-neutral-950 border border-amber-400 flex items-center justify-center text-amber-400">
                  <UtensilsCrossed className="w-2.5 h-2.5" />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 flex items-center justify-center font-bold shadow-md shadow-amber-950/40 shrink-0">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-serif font-bold text-stone-100 tracking-wide leading-none">
                {profile.name || 'Hernán'}
              </h1>
              <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase mt-1">
                {profile.role || 'Chef Ejecutivo & Asesor'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
              {profile.company || 'Guateque Manduca'}
            </span>
          </div>
        </div>

        {/* The QR Code (Prominent Centerpiece) */}
        <div className="relative p-4 sm:p-5 bg-white rounded-3xl shadow-2xl border-2 border-amber-500/50 my-1 group">
          {/* Corner gold accents */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-600" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-600" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-600" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-600" />

          <SafeQrCode
            value={qrPayload || 'https://guatequemanduca.com'}
            size={240}
            fgColor={theme.qrFg || '#09090b'}
            bgColor={theme.qrBg || '#ffffff'}
          />

          {/* Hidden Canvas for crisp export */}
          <div className="hidden">
            <QRCodeCanvas
              id="solo-qr-canvas"
              value={qrPayload || 'https://guatequemanduca.com'}
              size={900}
              level="M"
              fgColor={theme.qrFg || '#09090b'}
              bgColor={theme.qrBg || '#ffffff'}
              includeMargin={true}
            />
          </div>
        </div>

        {/* Scan instruction subtitle */}
        <div className="mt-3.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-200 tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Escanear con cámara para abrir en Chrome</span>
        </div>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          Abre la página web con foto, puesto, botón para descargar contacto y todos tus links
        </p>

        {/* Primary Action Buttons for the Landing Page */}
        <div className="w-full mt-4 flex flex-col gap-2.5">
          {/* 1. Main prominent button: Directly opens the Web Landing Page view inside the app */}
          <button
            id="btn-open-web-landing-primary"
            onClick={onOpenPublicLanding}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-950/50 transition-all active:scale-[0.98] border border-amber-300/40 cursor-pointer"
            title="Abrir la página web con todos los datos y el botón de descarga"
          >
            <Globe className="w-4 h-4 text-neutral-950 shrink-0" />
            <span>Abrir Página Web (Ver Datos & Descargar)</span>
          </button>

          <div className="flex items-center gap-2">
            {/* 2. Direct anchor link to open in a new Chrome tab without popup block */}
            <a
              id="link-open-in-chrome-tab"
              href={publicLandingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 text-xs font-semibold text-stone-200 transition-all"
              title="Abrir en una nueva pestaña del navegador"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Nueva Pestaña ↗</span>
            </a>

            {/* 3. Copy Link */}
            <button
              id="btn-copy-public-link"
              onClick={handleCopyWebLink}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 text-xs font-semibold text-stone-200 transition-all cursor-pointer"
              title="Copiar enlace web para compartirlo por WhatsApp o ponerlo en Instagram"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copiar Enlace</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Confirmation Notice */}
        <div className="mt-3.5 w-full p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-left flex items-start gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0 animate-pulse" />
          <div className="text-[11px] leading-relaxed text-stone-300">
            <strong className="text-amber-400 block font-semibold">Destino del QR: Pestaña Web en Chrome</strong>
            Al escanear el QR con la cámara, abre directamente la página web con foto, cargo en Guateque Manduca, botón para descargar contacto a la agenda y todos tus accesos.
          </div>
        </div>

        {/* DIRECT TOUCHPOINTS: Links to WhatsApp, Instagram Chef, Instagram Wateke, LinkedIn, Mail, vCard */}
        <div className="w-full mt-4 pt-3.5 border-t border-neutral-800/80 text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-xs font-bold text-stone-300 uppercase tracking-wider">
              <span>Accesos activos en la Tarjeta Web:</span>
            </div>
            <span className="text-[10px] text-amber-400 font-medium">6 accesos listos ✓</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* 1. WhatsApp directo */}
            <a
              id="link-wa-direct"
              href={wa.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 hover:bg-emerald-950/30 border border-neutral-800 hover:border-emerald-500/40 text-stone-200 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden min-w-0">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                    WhatsApp • Agendar
                  </div>
                  <div className="text-xs font-medium truncate text-stone-300">
                    {profile.phone}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-emerald-400 shrink-0" />
            </a>

            {/* 2. Descargar Contacto directo */}
            <button
              id="btn-download-contact-card"
              onClick={() => downloadVCardFile(profile)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-stone-200 transition-all group shadow-sm text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Download className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden min-w-0">
                  <div className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1">
                    Agendar Contacto
                  </div>
                  <div className="text-xs font-medium truncate text-stone-200">
                    Descargar .vcf
                  </div>
                </div>
              </div>
              <Download className="w-3 h-3 text-amber-400 shrink-0" />
            </button>

            {/* 3. Instagram Chef Ejecutivo y Asesor */}
            <a
              id="link-ig-chef-direct"
              href={igChef.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 hover:bg-pink-950/30 border border-neutral-800 hover:border-pink-500/40 text-stone-200 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                  <Instagram className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden min-w-0">
                  <div className="text-[10px] uppercase font-bold text-pink-400 flex items-center gap-1">
                    Instagram Chef
                  </div>
                  <div className="text-xs font-medium truncate text-stone-300">
                    {igChef.handle}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-pink-400 shrink-0" />
            </a>

            {/* 4. Instagram Guateque Manduca */}
            <a
              id="link-ig-wateke-direct"
              href={igWateke.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 hover:bg-amber-950/30 border border-neutral-800 hover:border-amber-500/40 text-stone-200 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden min-w-0">
                  <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                    Guateque Manduca
                  </div>
                  <div className="text-xs font-medium truncate text-stone-300">
                    {igWateke.handle}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-amber-400 shrink-0" />
            </a>

            {/* 5. LinkedIn Personal */}
            <a
              id="link-linkedin-direct"
              href={linkedin.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 hover:bg-blue-950/30 border border-neutral-800 hover:border-blue-500/40 text-stone-200 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Linkedin className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden min-w-0">
                  <div className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1">
                    LinkedIn Personal
                  </div>
                  <div className="text-xs font-medium truncate text-stone-300">
                    {linkedin.display}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
            </a>

            {/* 6. Mail Directo */}
            <a
              id="link-email-direct"
              href={`mailto:${profile.email}`}
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 hover:bg-stone-800 border border-neutral-800 hover:border-amber-500/40 text-stone-200 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden min-w-0">
                  <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                    Email Directo
                  </div>
                  <div className="text-xs font-medium truncate text-stone-300">
                    {profile.email}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-amber-400 shrink-0" />
            </a>
          </div>
        </div>

        {/* Bottom card footer actions */}
        <div className="w-full mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
          <button
            onClick={() => downloadVCardFile(profile)}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar archivo (.vcf)</span>
          </button>

          <span className="text-[11px] text-stone-400">
            Listo para compartir e imprimir
          </span>
        </div>
      </div>

      {/* Primary Export Actions Bar below the card */}
      <div className="w-full mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs">
        <button
          id="btn-download-hd-qr"
          onClick={handleDownloadQrPng}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shadow-lg shadow-amber-950/40 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Código QR (PNG Alta Definición)</span>
        </button>

        <button
          id="btn-save-vcard-bottom"
          onClick={() => downloadVCardFile(profile)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-stone-200 border border-neutral-800 transition-all"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Guardar Contacto (.VCF)</span>
        </button>
      </div>
    </div>
  );
}
