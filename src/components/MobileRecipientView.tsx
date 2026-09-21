import { useState } from 'react';
import { 
  Phone, 
  Instagram, 
  Linkedin, 
  UtensilsCrossed, 
  Download, 
  MessageCircle, 
  Mail, 
  X, 
  Share2, 
  Check, 
  ExternalLink,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { ChefProfile } from '../types';
import { sanitizeInstagram, sanitizeLinkedIn, sanitizeWhatsApp, downloadVCardFile } from '../utils/vcard';

interface MobileRecipientViewProps {
  profile: ChefProfile;
  onClose: () => void;
  isModal?: boolean;
}

export function MobileRecipientView({ profile, onClose, isModal = true }: MobileRecipientViewProps) {
  const [copied, setCopied] = useState(false);

  const igChef = sanitizeInstagram(profile.instagramChef);
  const igWateke = sanitizeInstagram(profile.instagramWateke);
  const linkedin = sanitizeLinkedIn(profile.linkedinUrl);
  const wa = sanitizeWhatsApp(profile.whatsapp || profile.phone);

  const waUrlWithMsg = `${wa.waLink}?text=${encodeURIComponent(profile.whatsappMessage || 'Hola Hernán, te contacto por tu tarjeta personal.')}`;

  const copyToClipboard = async () => {
    try {
      const summary = `Chef ${profile.name} - ${profile.role}\nWhatsApp: ${profile.phone}\nInstagram Chef: ${igChef.url}\nInstagram Wateke: ${igWateke.url}\nLinkedIn: ${linkedin.url}`;
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const content = (
    <div className="w-full max-w-md mx-auto bg-stone-950 text-stone-100 rounded-3xl border border-stone-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Header Banner with culinary vibe */}
      <div className="relative bg-gradient-to-br from-amber-950 via-neutral-900 to-stone-950 px-6 pt-7 pb-6 border-b border-amber-900/30 text-center">
        {isModal && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-900/80 text-stone-400 hover:text-white border border-neutral-700 transition-colors"
            title="Cerrar vista móvil"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-neutral-950 shadow-xl shadow-amber-900/40 mb-3 mx-auto">
          <UtensilsCrossed className="w-8 h-8" />
        </div>

        <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-widest mb-1.5">
          {profile.role || 'Chef Ejecutivo & Asesor'}
        </div>

        <h2 className="text-3xl font-serif font-bold text-stone-100 tracking-tight">
          {profile.name || 'Hernán'}
        </h2>

        {profile.company && (
          <p className="text-sm font-semibold text-amber-400/90 mt-0.5">
            {profile.company}
          </p>
        )}

        {profile.tagline && (
          <p className="text-xs text-stone-400 mt-2 max-w-xs mx-auto leading-relaxed">
            {profile.tagline}
          </p>
        )}
      </div>

      {/* Action Buttons - Touch friendly */}
      <div className="p-5 space-y-3 flex-1 overflow-y-auto max-h-[60vh]">
        
        {/* 1. WhatsApp Action (Primary) */}
        <a
          href={waUrlWithMsg}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-stone-100 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold shadow-md shadow-emerald-950/50">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                WhatsApp Directo
                <Sparkles className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-sm font-medium text-stone-200">
                {profile.phone || '+54 9 11 ...'}
              </div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
        </a>

        {/* 2. Instagram: Chef Ejecutivo y Asesor */}
        <a
          href={igChef.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-pink-950/20 hover:bg-pink-950/35 border border-pink-500/30 text-stone-100 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white flex items-center justify-center shadow-md">
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
          <ExternalLink className="w-4 h-4 text-pink-400 group-hover:translate-x-0.5 transition-transform" />
        </a>

        {/* 3. Instagram: Wateke Manduca */}
        <a
          href={igWateke.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-950/20 hover:bg-amber-950/35 border border-amber-500/30 text-stone-100 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-amber-400">
                Instagram • Wateke Manduca
              </div>
              <div className="text-sm font-medium text-stone-200">
                {igWateke.handle || '@watekemanduca'}
              </div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </a>

        {/* 4. LinkedIn Personal */}
        <a
          href={linkedin.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-950/20 hover:bg-blue-950/35 border border-blue-500/30 text-stone-100 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Linkedin className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-blue-400">
                LinkedIn Profesional
              </div>
              <div className="text-sm font-medium text-stone-200">
                {linkedin.display || 'in/hernan-chef'}
              </div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
        </a>

        {/* Save to Phone Contacts (vCard) */}
        <button
          onClick={() => downloadVCardFile(profile)}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-900/30"
        >
          <Download className="w-4 h-4" />
          <span>Guardar en mi Teléfono (vCard)</span>
        </button>

        {/* Secondary options row */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
          <a
            href={`tel:${profile.phone}`}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-stone-300 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Llamar</span>
          </a>

          <a
            href={`mailto:${profile.email}`}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-stone-300 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>Email</span>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-neutral-950/80 border-t border-neutral-900 flex items-center justify-between text-[11px] text-stone-400">
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 hover:text-stone-200 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? '¡Copiado!' : 'Compartir datos'}</span>
        </button>

        {isModal && (
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-amber-400 hover:underline"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Volver a la tarjeta</span>
          </button>
        )}
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md animate-scaleUp">
        {content}
      </div>
    </div>
  );
}
