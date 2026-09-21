import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { SafeQrCode } from './SafeQrCode';
import { 
  Phone, 
  Instagram, 
  Linkedin, 
  UtensilsCrossed, 
  QrCode, 
  Download, 
  Printer, 
  Share2, 
  RotateCw, 
  Sparkles,
  CheckCircle2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { ChefProfile, CardTheme, QrMode } from '../types';
import { sanitizeInstagram, sanitizeLinkedIn, sanitizeWhatsApp, getQrPayload, downloadVCardFile } from '../utils/vcard';
import { downloadFramedQr } from '../utils/qrDownload';

interface PersonalCardProps {
  profile: ChefProfile;
  theme: CardTheme;
  qrMode: QrMode;
  layout: 'horizontal' | 'vertical';
  showBackSide: boolean;
  onToggleSide: () => void;
  onOpenMobileView: () => void;
}

export function PersonalCard({
  profile,
  theme,
  qrMode,
  layout,
  showBackSide,
  onToggleSide,
  onOpenMobileView,
}: PersonalCardProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  const igChef = sanitizeInstagram(profile.instagramChef);
  const igWateke = sanitizeInstagram(profile.instagramWateke);
  const linkedin = sanitizeLinkedIn(profile.linkedinUrl);
  const wa = sanitizeWhatsApp(profile.whatsapp || profile.phone);

  const qrPayload = getQrPayload(profile, qrMode);

  const handleCopySummary = async () => {
    try {
      const summary = `Chef ${profile.name} - ${profile.role}\n🏢 ${profile.company}\n📱 WhatsApp: ${profile.phone}\n📸 Instagram Chef: ${igChef.url}\n🍽️ Instagram Wateke: ${igWateke.url}\n💼 LinkedIn: ${linkedin.url}`;
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleDownloadQrOnly = () => {
    // Look for canvas inside qrCanvasRef
    const canvas = qrCanvasRef.current?.querySelector('canvas');
    if (canvas) {
      downloadFramedQr({
        qrCanvas: canvas,
        name: profile.name || 'Hernán Fernández',
        role: profile.role || 'Chef Ejecutivo & Asesor Gastronómico',
        company: profile.company || 'Guateque Manduca',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Top action pill toolbar */}
      <div className="flex flex-wrap items-center justify-between w-full gap-2 px-3 py-2 mb-4 text-xs bg-neutral-900/80 border border-neutral-800 rounded-2xl no-print backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium text-neutral-200">Tarjeta QR Gastronómica</span>
          <span className="hidden sm:inline text-neutral-600">•</span>
          <span className="hidden sm:inline text-neutral-400">
            {qrMode === 'vcard' ? 'Modo vCard (Agrega a Contactos)' : qrMode === 'weblink' ? 'Modo Enlace Web' : 'Modo Texto Resumen'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            id="btn-toggle-flip"
            onClick={onToggleSide}
            className="flex items-center gap-1 px-2.5 py-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            title="Girar tarjeta (frente / dorso)"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showBackSide ? 'Ver Frente' : 'Ver Dorso'}</span>
          </button>

          <button
            id="btn-copy-info"
            onClick={handleCopySummary}
            className="flex items-center gap-1 px-2.5 py-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            title="Copiar datos"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copiado' : 'Compartir'}</span>
          </button>

          <button
            id="btn-download-vcard"
            onClick={() => downloadVCardFile(profile)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 rounded-lg transition-colors"
            title="Descargar archivo de contacto (.vcf)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-medium">.VCF</span>
          </button>

          <button
            id="btn-print-card"
            onClick={handlePrint}
            className="flex items-center gap-1 px-2.5 py-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            title="Imprimir tarjeta o exportar a PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* The Physical Card Mockup */}
      <div className="relative w-full perspective-1000">
        <div
          ref={cardRef}
          id="chef-business-card"
          className={`relative w-full rounded-2xl border transition-all duration-500 overflow-hidden shadow-2xl p-6 sm:p-8 ${theme.cardBg} ${theme.border}`}
          style={{ minHeight: layout === 'horizontal' ? '360px' : '480px' }}
        >
          {/* Subtle culinary background watermark */}
          <div className="absolute -right-8 -bottom-8 pointer-events-none opacity-[0.04] text-white">
            <UtensilsCrossed className="w-72 h-72" />
          </div>

          {!showBackSide ? (
            /* FRONT OF THE CARD: QR Code is the center-stage hero */
            <div className={`flex ${layout === 'horizontal' ? 'flex-col md:flex-row items-center justify-between gap-6' : 'flex-col items-center text-center gap-5'}`}>
              
              {/* QR Code Presentation Box */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="relative p-3.5 bg-white rounded-2xl shadow-xl border border-stone-200/80 group">
                  {/* Decorative corner brackets for executive finish */}
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-600/70" />
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-600/70" />
                  <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-600/70" />
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-600/70" />

                  {/* High quality SVG QR */}
                  <SafeQrCode
                    value={qrPayload}
                    size={layout === 'horizontal' ? 165 : 180}
                    fgColor={theme.qrFg}
                    bgColor={theme.qrBg}
                  />

                  {/* Hidden canvas for PNG export */}
                  <div ref={qrCanvasRef} className="hidden">
                    <QRCodeCanvas
                      value={qrPayload}
                      size={600}
                      level="M"
                      fgColor={theme.qrFg}
                      bgColor={theme.qrBg}
                      includeMargin={true}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-2.5 text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                  <QrCode className="w-3.5 h-3.5 text-amber-500" />
                  <span>Escaneá mi contacto</span>
                </div>
              </div>

              {/* Personal Information & Direct Touchpoints */}
              <div className={`flex flex-col ${layout === 'horizontal' ? 'text-left flex-1' : 'text-center w-full'} justify-center`}>
                
                {/* Header: Title, Photo & Company */}
                <div className="mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        className="w-12 h-12 rounded-xl object-cover border border-amber-400/80 shadow-md shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30 shrink-0">
                        <UtensilsCrossed className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {profile.role || 'Chef Ejecutivo & Asesor'}
                        </span>
                        {profile.company && (
                          <span className="text-xs font-semibold tracking-wide text-neutral-400">
                            • {profile.company}
                          </span>
                        )}
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-100">
                        {profile.name || 'Hernán'}
                      </h1>
                    </div>
                  </div>

                  {(profile.bio || profile.tagline) && (
                    <p className="mt-1 text-xs text-stone-300 line-clamp-2 max-w-md">
                      {profile.bio || profile.tagline}
                    </p>
                  )}
                </div>

                {/* The 4 Core Required Touchpoints */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-3 border-t border-neutral-800/80">
                  
                  {/* 1. Teléfono & WhatsApp */}
                  <a
                    href={wa.waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 text-stone-200 transition-all group"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] uppercase font-semibold text-emerald-400/90 flex items-center gap-1">
                        WhatsApp / Tel
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs font-medium truncate text-stone-200">
                        {profile.phone || 'Agregar número'}
                      </div>
                    </div>
                  </a>

                  {/* 2. Instagram: Chef Ejecutivo y Asesor */}
                  <a
                    href={igChef.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 text-stone-200 transition-all group"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 group-hover:scale-105 transition-transform shrink-0">
                      <Instagram className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] uppercase font-semibold text-pink-400/90 flex items-center gap-1">
                        Instagram Chef
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs font-medium truncate text-stone-200">
                        {igChef.handle || '@hernan.chef.ej'}
                      </div>
                    </div>
                  </a>

                  {/* 3. Instagram: Guateque Manduca */}
                  <a
                    href={igWateke.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 text-stone-200 transition-all group"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] uppercase font-semibold text-amber-400/90 flex items-center gap-1">
                        Guateque Manduca
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs font-medium truncate text-stone-200">
                        {igWateke.handle || '@guatequemanduca'}
                      </div>
                    </div>
                  </a>

                  {/* 4. LinkedIn Personal */}
                  <a
                    href={linkedin.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 text-stone-200 transition-all group"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                      <Linkedin className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] uppercase font-semibold text-blue-400/90 flex items-center gap-1">
                        LinkedIn Personal
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs font-medium truncate text-stone-200">
                        {linkedin.display || 'in/hernan-chef'}
                      </div>
                    </div>
                  </a>
                </div>

                {/* Footer note & CTA to open interactive view */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-800/50 text-[11px] text-neutral-400">
                  <span className="truncate">{profile.email}</span>
                  <button
                    onClick={onOpenMobileView}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium ml-2 shrink-0 transition-colors"
                  >
                    <span>Simular escaneo</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

              </div>
            </div>
          ) : (
            /* BACK OF THE CARD: Minimalist executive culinary crest */
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px] py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-900/40 mb-4">
                <UtensilsCrossed className="w-8 h-8 text-neutral-950" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-wider">
                {profile.company || 'GUATEQUE MANDUCA'}
              </h2>

              <p className="mt-1 text-xs uppercase tracking-widest text-amber-400 font-semibold">
                {profile.role || 'Chef Ejecutivo & Asesoría'}
              </p>

              <div className="w-12 h-0.5 bg-amber-500/40 my-4" />

              <p className="text-sm text-stone-300 max-w-sm italic font-serif">
                &ldquo;{profile.bio || 'Diseño de experiencias culinarias, asesoramiento de restaurantes y dirección gastronómica.'}&rdquo;
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {profile.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  {igChef.handle} • {igWateke.handle}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick button to download high-res QR for print */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4 no-print text-xs">
        <button
          id="btn-download-qr-only"
          onClick={handleDownloadQrOnly}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-stone-200 border border-neutral-700 transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Descargar Código QR en Alta Calidad (PNG)</span>
        </button>

        <button
          id="btn-open-recipient-preview"
          onClick={onOpenMobileView}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all shadow-sm"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ver cómo lo ve quien escanea</span>
        </button>
      </div>
    </div>
  );
}
