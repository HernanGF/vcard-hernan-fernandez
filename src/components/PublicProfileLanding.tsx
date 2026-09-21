import { useState } from 'react';
import { 
  Phone, 
  Instagram, 
  Linkedin, 
  UtensilsCrossed, 
  Download, 
  MessageCircle, 
  Mail, 
  Share2, 
  Check, 
  ExternalLink, 
  Sparkles, 
  QrCode, 
  X,
  SlidersHorizontal,
  Copy
} from 'lucide-react';
import { SafeQrCode } from './SafeQrCode';
import { ChefProfile } from '../types';
import { 
  sanitizeInstagram, 
  sanitizeLinkedIn, 
  sanitizeWhatsApp, 
  downloadVCardFile, 
  buildPublicWebProfileUrl 
} from '../utils/vcard';

interface PublicProfileLandingProps {
  profile: ChefProfile;
  onOpenEditor?: () => void;
  isOwnerView?: boolean;
}

export function PublicProfileLanding({ 
  profile, 
  onOpenEditor,
  isOwnerView = false 
}: PublicProfileLandingProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const igChef = sanitizeInstagram(profile.instagramChef);
  const igWateke = sanitizeInstagram(profile.instagramWateke);
  const linkedin = sanitizeLinkedIn(profile.linkedinUrl);
  const wa = sanitizeWhatsApp(profile.whatsapp || profile.phone);

  const publicUrl = buildPublicWebProfileUrl(profile);
  const waMessage = profile.whatsappMessage || 'Hola Hernán, te contacto a través de tu tarjeta digital.';
  const waUrl = `${wa.waLink}&text=${encodeURIComponent(waMessage)}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - ${profile.role}`,
          text: `Tarjeta personal y contacto de ${profile.name}, ${profile.role} en ${profile.company}`,
          url: publicUrl,
        });
        return;
      } catch {
        // Fallback to copy if user cancelled or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-start px-4 py-6 sm:py-10 relative selection:bg-amber-500 selection:text-neutral-950">
      
      {/* Subtle warm culinary glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-72 bg-gradient-to-b from-amber-600/10 via-amber-700/5 to-transparent blur-3xl pointer-events-none" />

      {/* Chrome Tab Simulator / Mobile Browser Bar */}
      <div className="w-full max-w-md mb-3 z-10">
        <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-md text-xs shadow-lg">
          <div className="flex items-center gap-2 text-stone-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-semibold text-stone-200">Tarjeta Personal Digital</span>
            <span className="text-[10px] text-amber-400 font-medium px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
              Pestaña Web
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowQrModal(true)}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-stone-300 hover:text-white transition-colors"
              title="Mostrar Código QR"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-stone-300 hover:text-white transition-colors"
              title="Compartir o copiar enlace"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400 font-semibold">Copiado</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-300" />
                  <span className="text-[11px]">Compartir</span>
                </>
              )}
            </button>

            {onOpenEditor && (
              <button
                onClick={onOpenEditor}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all"
                title="Volver al panel con QR y editor"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Panel & QR</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Central Profile Web Card */}
      <main className="w-full max-w-md bg-stone-950/95 rounded-3xl border border-stone-800/90 shadow-2xl overflow-hidden flex flex-col z-10">
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-b from-amber-950/40 via-neutral-900/80 to-stone-950 p-6 sm:p-7 text-center border-b border-amber-900/20">
          
          {/* Small Profile Image (Avatar) */}
          <div className="relative inline-flex items-center justify-center mb-3">
            {profile.avatarUrl ? (
              <div className="relative group">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name || 'Chef Hernán'}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-amber-400 shadow-xl shadow-amber-950/60 ring-4 ring-amber-500/20"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-neutral-950 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-md">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                </div>
              </div>
            ) : (
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-neutral-950 flex items-center justify-center shadow-xl shadow-amber-950/50 border-2 border-amber-300">
                <UtensilsCrossed className="w-10 h-10" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-neutral-950 border-2 border-amber-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
              </div>
            )}
          </div>

          {/* Role badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>{profile.role || 'Chef Ejecutivo & Asesor'}</span>
          </div>

          {/* Name */}
          <h1 className="text-3xl font-serif font-bold text-stone-100 tracking-tight leading-tight">
            {profile.name || 'Hernán'}
          </h1>

          {/* Company */}
          {profile.company && (
            <p className="text-base font-semibold text-amber-400/95 mt-1 tracking-wide">
              {profile.company}
            </p>
          )}

          {/* Role Description / Bio Section */}
          {(profile.bio || profile.tagline) && (
            <div className="mt-3.5 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-left">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Descripción del Cargo & Asesoría</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {profile.bio || profile.tagline}
              </p>
            </div>
          )}
        </div>

        {/* PRIMARY ACTION 1: Download & Save Contact Directly (.vcf) */}
        <div className="p-5 pb-2">
          <button
            id="btn-save-contact-hero"
            onClick={() => downloadVCardFile(profile)}
            className="w-full relative overflow-hidden group flex flex-col items-center justify-center py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold shadow-lg shadow-amber-950/60 transition-all transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-extrabold">
              <Download className="w-5 h-5 text-neutral-950 animate-bounce" />
              <span>Descargar Contacto y Agendar (.vcf)</span>
            </div>
            <span className="text-[11px] font-medium text-neutral-900/85 mt-0.5">
              Guarda teléfono, WhatsApp, mail, Instagrams y LinkedIn en tu agenda
            </span>
          </button>
        </div>

        {/* Contact Links List */}
        <div className="px-5 pb-5 space-y-2.5">
          
          <div className="flex items-center justify-between pt-2 pb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Redes y Contacto Directo
            </span>
            <span className="text-[10px] text-amber-400 font-medium">
              Abrir enlace ↗
            </span>
          </div>

          {/* 1. WhatsApp Action - Agendar y Chatear */}
          <a
            id="public-link-whatsapp"
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-emerald-950/30 border border-neutral-800 hover:border-emerald-500/50 text-stone-100 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 group-hover:scale-105 transition-transform shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span>WhatsApp • Agendar & Chatear</span>
                  <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                    Directo
                  </span>
                </div>
                <div className="text-sm font-medium text-stone-200">
                  {profile.phone || '+54 9 11 ...'}
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </a>

          {/* 2. Instagram: Chef Ejecutivo y Asesor */}
          <a
            id="public-link-ig-chef"
            href={igChef.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-pink-950/30 border border-neutral-800 hover:border-pink-500/50 text-stone-100 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30 group-hover:scale-105 transition-transform shrink-0">
                <Instagram className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-pink-400">
                  Instagram • Chef Ejecutivo & Asesor
                </div>
                <div className="text-sm font-medium text-stone-200">
                  {igChef.handle || '@hernan.chef.ej'}
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-pink-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </a>

          {/* 3. Instagram: Guateque Manduca */}
          <a
            id="public-link-ig-wateke"
            href={igWateke.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-amber-950/30 border border-neutral-800 hover:border-amber-500/50 text-stone-100 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-amber-400">
                  Instagram • Guateque Manduca
                </div>
                <div className="text-sm font-medium text-stone-200">
                  {igWateke.handle || '@guatequemanduca'}
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </a>

          {/* 4. LinkedIn Personal */}
          <a
            id="public-link-linkedin"
            href={linkedin.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-blue-950/30 border border-neutral-800 hover:border-blue-500/50 text-stone-100 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform shrink-0">
                <Linkedin className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-blue-400">
                  LinkedIn Personal
                </div>
                <div className="text-sm font-medium text-stone-200">
                  {linkedin.display || 'in/hernan-chef'}
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </a>

          {/* 5. Mail Directo */}
          <a
            id="public-link-email"
            href={`mailto:${profile.email}`}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-stone-800 border border-neutral-800 hover:border-amber-500/50 text-stone-100 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-amber-400">
                  Correo Electrónico
                </div>
                <div className="text-sm font-medium text-stone-200 truncate max-w-[200px] sm:max-w-[260px]">
                  {profile.email || 'hernan.chef.ej@gmail.com'}
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </a>

          {/* Llamada Telefónica Directa */}
          {profile.phone && (
            <div className="pt-1">
              <a
                href={`tel:${profile.phone}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-stone-300 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Llamar directamente por teléfono ({profile.phone})</span>
              </a>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-5 py-4 bg-neutral-950 border-t border-neutral-900 text-center text-xs text-neutral-500">
          <p className="font-serif">
            {profile.name} • {profile.role}
          </p>
          <p className="text-[11px] text-neutral-600 mt-0.5">
            {profile.company} • Buenos Aires, Argentina
          </p>
        </div>
      </main>

      {/* QR Code Modal for on-screen sharing */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-2xl text-center">
            
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-800 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 mb-3 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <QrCode className="w-4 h-4" />
              <span>Código QR de esta Tarjeta</span>
            </div>

            <h3 className="text-lg font-serif font-bold text-stone-100 mb-1">
              {profile.name}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Escaneá con la cámara de cualquier teléfono para abrir esta página web
            </p>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-xl mx-auto my-1 border-2 border-amber-500/40">
              <SafeQrCode
                value={publicUrl}
                size={220}
                fgColor="#09090b"
                bgColor="#ffffff"
              />
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace Web'}</span>
              </button>

              <button
                onClick={() => setShowQrModal(false)}
                className="text-xs text-stone-400 hover:text-white py-1"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
