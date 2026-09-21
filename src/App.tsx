import { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  QrCode, 
  Download, 
  Phone, 
  Instagram, 
  Linkedin, 
  Mail, 
  MessageCircle, 
  Share2, 
  Check, 
  ExternalLink, 
  Sparkles, 
  SlidersHorizontal, 
  Copy, 
  X, 
  Smartphone,
  HelpCircle,
  Link as LinkIcon,
  Globe,
  Contact,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { SafeQrCode } from './components/SafeQrCode';
import { CardEditor } from './components/CardEditor';
import { ChefProfile, CardTheme } from './types';
import { CARD_THEMES } from './data/themes';
import { DEFAULT_CHEF_PROFILE } from './data/defaultProfile';
import { 
  sanitizeInstagram, 
  sanitizeLinkedIn, 
  sanitizeWhatsApp, 
  downloadVCardFile, 
  generateVCard,
  buildPublicWebProfileUrl, 
  getCleanAppUrl,
  generateWhatsAppShareMessage,
  AI_STUDIO_SHARED_URL,
  VERCEL_PRODUCTION_URL,
  parseProfileFromUrl 
} from './utils/vcard';
import { downloadFramedQr } from './utils/qrDownload';

const STORAGE_KEY = 'chef_personal_card_profile_v2';
const THEME_KEY = 'chef_personal_card_theme_v2';
const URL_SOURCE_KEY = 'chef_personal_card_url_source_v2';
const VERCEL_URL_KEY = 'chef_personal_card_vercel_url_v2';

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const wantsQrFirst = searchParams.get('tab') === 'qr';

  // Load saved profile or parsed profile from URL without losing custom photo or custom LinkedIn
  const [profile, setProfile] = useState<ChefProfile>(() => {
    let base: ChefProfile = { ...DEFAULT_CHEF_PROFILE };
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean up legacy fake stock photo or unwanted created emblem
        if (
          !parsed.avatarUrl ||
          parsed.avatarUrl.includes('unsplash.com') ||
          parsed.avatarUrl.includes('chef-avatar.svg') ||
          parsed.avatarUrl.trim() === ''
        ) {
          delete parsed.avatarUrl;
        }
        if (parsed.company === 'Wateke Manduca') {
          parsed.company = 'Guateque Manduca';
        }
        if (parsed.instagramWateke === '@watekemanduca') {
          parsed.instagramWateke = '@guatequemanduca';
        }
        base = { ...base, ...parsed };
      }
    } catch {
      // ignore
    }

    // Always ensure Hernán's real uploaded photo is the avatar
    if (!base.avatarUrl || base.avatarUrl.includes('chef-avatar.svg') || base.avatarUrl.trim() === '') {
      base.avatarUrl = '/assets/hernan-profile.jpg';
    }

    // Ensure valid fallback so LinkedIn NEVER fails to open
    if (!base.linkedinUrl || !base.linkedinUrl.trim()) {
      base.linkedinUrl = 'https://www.linkedin.com/in/hernan-fernandez';
      base.linkedinText = 'in/hernan-fernandez';
    }

    const fromUrl = parseProfileFromUrl();
    if (fromUrl) {
      // Only overwrite fields explicitly passed in the URL (does NOT wipe photo unless passed)
      return { ...base, ...fromUrl };
    }
    return base;
  });

  const [currentTheme, setCurrentTheme] = useState<CardTheme>(() => {
    try {
      const savedThemeId = localStorage.getItem(THEME_KEY);
      if (savedThemeId) {
        const found = CARD_THEMES.find(t => t.id === savedThemeId);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return CARD_THEMES[0];
  });

  // URL source selection: 'current' (active browser URL), 'aistudio' (published link), 'vercel' (custom domain)
  const [urlSource, setUrlSource] = useState<'current' | 'aistudio' | 'vercel'>(() => {
    try {
      const saved = localStorage.getItem(URL_SOURCE_KEY) as 'current' | 'aistudio' | 'vercel';
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'vercel';
  });

  const [customVercelUrl, setCustomVercelUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(VERCEL_URL_KEY);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return VERCEL_PRODUCTION_URL;
  });

  // QR content target: 'web' (open online vCard profile) or 'vcf' (direct phone contact import without web)
  const [qrTarget, setQrTarget] = useState<'web' | 'vcf'>('web');

  // Modals
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(wantsQrFirst);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(searchParams.get('edit') === '1' || searchParams.get('admin') === '1');
  const [isExplanationOpen, setIsExplanationOpen] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (e) {
      console.warn('Fullscreen request error:', e);
    }
  };

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      localStorage.setItem(THEME_KEY, currentTheme.id);
      localStorage.setItem(URL_SOURCE_KEY, urlSource);
      localStorage.setItem(VERCEL_URL_KEY, customVercelUrl);
    } catch {
      // ignore
    }
  }, [profile, currentTheme, urlSource, customVercelUrl]);

  // Compute base URL depending on selection
  const computedBaseUrl = (() => {
    if (urlSource === 'aistudio') {
      return AI_STUDIO_SHARED_URL;
    }
    if (urlSource === 'vercel' && customVercelUrl.trim()) {
      return customVercelUrl.trim();
    }
    return getCleanAppUrl();
  })();

  // Full clean public URL for sharing and QR
  const publicWebUrl = buildPublicWebProfileUrl(profile, computedBaseUrl);

  // QR payload: pure vCard data or web profile URL
  const qrPayload = qrTarget === 'vcf' ? generateVCard(profile) : publicWebUrl;

  // Rich WhatsApp and social share text
  const richShareMessage = generateWhatsAppShareMessage(profile, publicWebUrl);

  // Sanitized contact links
  const igChef = sanitizeInstagram(profile.instagramChef);
  const igWateke = sanitizeInstagram(profile.instagramWateke);
  const linkedin = sanitizeLinkedIn(profile.linkedinUrl);
  const wa = sanitizeWhatsApp(profile.whatsapp || profile.phone);
  // Pure direct chat link without any prefilled text as requested
  const waUrl = wa.waLink;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicWebUrl);
      setCopiedNotification('¡Enlace de tu vCard copiado al portapapeles!');
      setTimeout(() => setCopiedNotification(null), 3000);
    } catch {
      prompt('Copia este enlace para compartir tu vCard:', publicWebUrl);
    }
  };

  const handleCopyRichMessage = async () => {
    try {
      await navigator.clipboard.writeText(richShareMessage);
      setCopiedNotification('¡Mensaje explicativo completo copiado!');
      setTimeout(() => setCopiedNotification(null), 3000);
    } catch {
      prompt('Copia este mensaje para compartir:', richShareMessage);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'V-Card Hernán Fernández',
          text: richShareMessage,
          url: publicWebUrl,
        });
        return;
      } catch {
        // Fallback
      }
    }
    handleCopyRichMessage();
  };

  const handleDownloadQrPng = () => {
    const qrCanvas = (document.getElementById('high-res-qr-canvas') ||
      document.getElementById('high-res-qr-canvas-modal')) as HTMLCanvasElement | null;
    if (!qrCanvas) return;

    downloadFramedQr({
      qrCanvas,
      name: profile.name || 'Hernán Fernández',
      role: profile.role || 'Chef Ejecutivo & Asesor Gastronómico',
      company: profile.company || 'Guateque Manduca',
    });
  };

  const handleOpenInChrome = () => {
    window.open(publicWebUrl, '_blank', 'noopener,noreferrer');
  };

  // Detect whether we are in AI Studio development or admin mode
  const isStudio = typeof window !== 'undefined' && (
    window.location.hostname.includes('ais-dev-') ||
    window.location.hostname === 'localhost' ||
    window.location.search.includes('edit') ||
    window.location.search.includes('admin') ||
    window.self !== window.top // inside AI Studio editor iframe
  );

  const handleSaveProfileToServer = async (updated: ChefProfile) => {
    setProfile(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      await fetch('/api/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updated }),
      });
      setCopiedNotification('¡Tarjeta guardada permanentemente en el servidor!');
      setTimeout(() => setCopiedNotification(null), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-start px-3 sm:px-4 py-4 sm:py-8 relative selection:bg-amber-500 selection:text-neutral-950 font-sans">
      
      {/* Background warm culinary ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-80 bg-gradient-to-b from-amber-600/15 via-amber-700/5 to-transparent blur-3xl pointer-events-none" />

      {/* Floating toast notification */}
      {copiedNotification && (
        <div className="fixed top-5 z-50 px-4 py-2.5 rounded-2xl bg-emerald-500 text-neutral-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-300">
          <Check className="w-4 h-4 shrink-0" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* STUDIO ADMIN BAR: Exclusively visible to Hernán in Google AI Studio. NEVER visible to public clients */}
      {isStudio && (
        <aside className="w-full max-w-md mb-3.5 p-3 rounded-2xl bg-neutral-900/95 border border-amber-500/40 shadow-xl flex items-center justify-between z-30">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-amber-300">
                Panel de Edición (Solo visible en AI Studio)
              </div>
              <div className="text-[10px] text-stone-400">
                Los clientes externos solo ven tu tarjeta limpia
              </div>
            </div>
          </div>
          <button
            id="btn-studio-edit-profile"
            type="button"
            onClick={() => setIsEditorOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Editar Tarjeta</span>
          </button>
        </aside>
      )}

      {/* VIRTUAL VCARD (STANDALONE CARD VIEW) */}
      <main className="w-full max-w-lg bg-stone-950/95 rounded-3xl border border-stone-800/90 shadow-2xl overflow-hidden flex flex-col z-10 animate-fadeIn">
        
        {/* Header Profile Section */}
        <div className="relative bg-gradient-to-b from-amber-950/40 via-neutral-900/80 to-stone-950 p-6 sm:p-8 text-center border-b border-amber-900/20">
          
          {/* Top Quick Actions Bar (Fullscreen, Install, Share) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            {installPrompt && (
              <button
                id="btn-install-pwa"
                onClick={handleInstallApp}
                className="px-2.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Instalar App en pantalla de inicio"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instalar</span>
              </button>
            )}
            <button
              id="btn-toggle-fullscreen"
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-800/80 backdrop-blur-sm transition-all cursor-pointer shadow-sm"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
              aria-label="Pantalla completa"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              id="btn-quick-share-header"
              onClick={() => setIsQrModalOpen(true)}
              className="p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-800/80 backdrop-blur-sm transition-all cursor-pointer shadow-sm"
              title="Compartir tarjeta"
              aria-label="Compartir tarjeta"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Avatar / Photo */}
          <div className="relative inline-flex flex-col items-center justify-center mb-3.5">
            <img
              src={profile.avatarUrl || '/assets/hernan-profile.jpg'}
              alt={profile.name || 'Chef Hernán Fernández'}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-2 border-amber-400 shadow-xl shadow-amber-950/60 ring-4 ring-amber-500/20"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/assets/hernan-profile.jpg';
              }}
            />
          </div>

          {/* Role Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2.5 mt-1">
            <span>{profile.role || 'Chef Ejecutivo & Asesor Gastronómico'}</span>
          </div>

          {/* Name */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            {profile.name || 'Hernán Fernández'}
          </h1>

          {/* Company */}
          {profile.company && (
            <p className="text-lg sm:text-2xl font-bold text-amber-400 mt-1.5 tracking-wide">
              {profile.company}
            </p>
          )}

          {/* Descripción del puesto / Biografía Profesional */}
          {(profile.bio || profile.tagline) && (
            <p className="mt-4 text-sm sm:text-base text-stone-200 leading-relaxed font-sans max-w-md mx-auto text-center px-2">
              {profile.bio || profile.tagline}
            </p>
          )}
        </div>

          {/* PRIMARY GOLD CTA: Download & Agendar vCard */}
          <div className="p-5 sm:p-6 pb-2">
            <button
              id="btn-download-vcard-hero"
              onClick={() => downloadVCardFile(profile)}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-sm sm:text-base tracking-wide shadow-md shadow-amber-950/40 transition-all transform active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-5 h-5 text-neutral-950" />
              <span>Descargar Contacto (.vcf)</span>
            </button>
          </div>

          {/* Contact and Social Links List */}
          <div className="px-5 sm:px-6 pb-6 space-y-3">
            <div className="flex items-center justify-between pt-2 pb-1">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-stone-300">
                Redes y Contacto Directo
              </span>
              <span className="text-xs sm:text-sm text-amber-400 font-semibold">
                Abrir enlace ↗
              </span>
            </div>

            {/* 1. WhatsApp Action */}
            <a
              id="link-whatsapp-action"
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl bg-neutral-900/90 hover:bg-emerald-950/30 border border-neutral-800 hover:border-emerald-500/50 text-stone-100 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-sm sm:text-base font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>WhatsApp • Agendar & Chatear</span>
                    <span className="px-2 py-0.5 text-[10px] sm:text-xs bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                      Directo
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-stone-100 mt-0.5">
                    {profile.phone || '+54 9 11 6790-0574'}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>

            {/* 2. Instagram: Chef Ejecutivo */}
            <a
              id="link-ig-chef-action"
              href={igChef.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl bg-neutral-900/90 hover:bg-pink-950/30 border border-neutral-800 hover:border-pink-500/50 text-stone-100 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <Instagram className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-sm sm:text-base font-bold text-pink-400">
                    Instagram • Chef Ejecutivo & Asesor
                  </div>
                  <div className="text-base sm:text-lg font-bold text-stone-100 mt-0.5">
                    {igChef.handle || '@hernan.chef.ej'}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-pink-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>

            {/* 3. Instagram: Guateque Manduca */}
            <a
              id="link-ig-guateque-action"
              href={igWateke.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl bg-neutral-900/90 hover:bg-amber-950/30 border border-neutral-800 hover:border-amber-500/50 text-stone-100 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-sm sm:text-base font-bold text-amber-400">
                    Instagram • Guateque Manduca
                  </div>
                  <div className="text-base sm:text-lg font-bold text-stone-100 mt-0.5">
                    {igWateke.handle || '@guatequemanduca'}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>

            {/* 4. LinkedIn Personal */}
            <a
              id="link-linkedin-action"
              href={linkedin.url || (profile.linkedinUrl ? profile.linkedinUrl : 'https://www.linkedin.com/in/hernan-fernandez')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl bg-neutral-900/90 hover:bg-blue-950/30 border border-neutral-800 hover:border-blue-500/50 text-stone-100 transition-all shadow-sm group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <Linkedin className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-sm sm:text-base font-bold text-blue-400">
                    LinkedIn • Perfil Profesional
                  </div>
                  <div className="text-base sm:text-lg font-bold text-stone-100 mt-0.5">
                    {linkedin.display || 'in/hernan-fernandez'}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>

            {/* 5. Mail Directo */}
            <a
              id="link-email-action"
              href={`mailto:${profile.email}`}
              className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl bg-neutral-900/90 hover:bg-stone-800 border border-neutral-800 hover:border-amber-500/50 text-stone-100 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-sm sm:text-base font-bold text-amber-400">
                    Correo Electrónico
                  </div>
                  <div className="text-base sm:text-lg font-bold text-stone-100 truncate max-w-[200px] sm:max-w-[280px] mt-0.5">
                    {profile.email || 'hernan.chef.ej@gmail.com'}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>

            {/* 6. Llamar directamente */}
            {profile.phone && (
              <div className="pt-1.5">
                <a
                  href={`tel:${profile.phone}`}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-sm sm:text-base font-bold text-stone-200 transition-colors"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  <span>Llamar por teléfono ({profile.phone})</span>
                </a>
              </div>
            )}

            {/* SECCIÓN PRINCIPAL: CÓDIGO QR PARA ESCANEAR Y COMPARTIR ESTA VCARD */}
            <div className="pt-6 border-t border-neutral-800/80 text-center space-y-3.5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <QrCode className="w-4 h-4" />
                <span>Código QR de Contacto</span>
              </div>

              <p className="text-sm sm:text-base text-stone-300 font-medium">
                Apunta con la cámara de tu celular para abrir y guardar esta vCard
              </p>

              {/* QR Code Presentation Box */}
              <div className="p-4 sm:p-5 bg-white rounded-3xl inline-block shadow-2xl mx-auto border-4 border-amber-500/50 my-1">
                <SafeQrCode
                  value={publicWebUrl}
                  size={230}
                  fgColor="#09090b"
                  bgColor="#ffffff"
                />

                {/* Hidden canvas for high quality PNG download */}
                <div className="hidden">
                  <QRCodeCanvas
                    id="high-res-qr-canvas"
                    value={publicWebUrl}
                    size={900}
                    level="M"
                    fgColor="#09090b"
                    bgColor="#ffffff"
                    includeMargin={true}
                  />
                </div>
              </div>

              {/* Botones de acción rápida: Copiar Enlace y Compartir vCard */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 py-3 px-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-stone-200 text-xs sm:text-sm font-bold border border-neutral-800 transition-colors cursor-pointer active:scale-95"
                >
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>Copiar Enlace</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-3 px-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs sm:text-sm font-bold border border-amber-500/40 transition-colors cursor-pointer active:scale-95"
                >
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>Compartir vCard</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadQrPng}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/15 hover:from-amber-500/25 hover:to-amber-600/25 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-bold border border-amber-500/40 transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <span>Descargar Código QR</span>
              </button>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-900 text-neutral-400 flex items-center justify-between">
            <div className="text-left">
              <p className="font-serif font-bold text-sm sm:text-base text-stone-200">
                {profile.name} • {profile.role}
              </p>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                {profile.company} • Buenos Aires, Argentina
              </p>
            </div>
            {isStudio && (
              <button
                id="btn-edit-discreet"
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="p-2 rounded-lg text-neutral-600 hover:text-stone-300 hover:bg-neutral-900 transition-colors cursor-pointer"
                title="Ajustes de mi vCard"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>

      {/* VIEW 2: SHARE & SCAN QR CODE MODAL */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <main className="relative w-full max-w-md max-h-[90vh] bg-stone-950/95 rounded-3xl border border-stone-800/90 shadow-2xl p-5 sm:p-6 text-center overflow-y-auto space-y-5">
          
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <QrCode className="w-3.5 h-3.5" />
                <span>Escanear y Compartir</span>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-3xl font-serif font-bold text-white">
                {profile.name || 'Hernán Fernández'}
              </h2>
              <p className="text-sm sm:text-base text-amber-400 font-semibold mt-1">
                {profile.role} • {profile.company}
              </p>
            </div>

          {/* QR Mode Selector: [ Web vCard ] vs [ Descarga Directa en Contactos (.vcf) ] */}
          <div className="bg-neutral-900/90 p-2 rounded-2xl border border-neutral-800 text-left">
            <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
              <span>¿Qué hace el Código QR al escanear?</span>
              <span className="text-amber-400 font-semibold lowercase">elige tu modo</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium mt-1.5">
              <button
                type="button"
                onClick={() => setQrTarget('web')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center ${
                  qrTarget === 'web'
                    ? 'bg-amber-500/20 border border-amber-500/60 text-amber-200 shadow-sm'
                    : 'bg-neutral-950/60 border border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Globe className="w-5 h-5 mb-1 text-amber-400" />
                <span className="font-bold text-xs">Abrir Web vCard</span>
                <span className="text-[10px] text-stone-400 leading-tight mt-0.5">
                  Muestra tu foto real, texto y links
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQrTarget('vcf')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center ${
                  qrTarget === 'vcf'
                    ? 'bg-amber-500/20 border border-amber-500/60 text-amber-200 shadow-sm'
                    : 'bg-neutral-950/60 border border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Contact className="w-5 h-5 mb-1 text-amber-400" />
                <span className="font-bold text-xs">Agenda Directa (.vcf)</span>
                <span className="text-[10px] text-stone-400 leading-tight mt-0.5">
                  Guarda en el cel sin web
                </span>
              </button>
            </div>
            {qrTarget === 'vcf' && (
              <p className="text-xs text-emerald-400 px-3 py-2 mt-2 font-medium bg-emerald-950/40 rounded-xl border border-emerald-900/50">
                ✨ <strong>Modo Agenda activado:</strong> Quien apunte la cámara de su teléfono guardará tu contacto en su agenda al instante, sin necesidad de internet.
              </p>
            )}
          </div>

          {/* QR Code Presentation Box */}
          <div className="relative p-5 bg-white rounded-3xl inline-block shadow-2xl mx-auto border-4 border-amber-500/40">
            {/* Corner accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-600" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-600" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-600" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-600" />

            <SafeQrCode
              value={qrPayload}
              size={220}
              fgColor="#09090b"
              bgColor="#ffffff"
            />

            {/* Hidden canvas for crystal-clear PNG export */}
            <div className="hidden">
              <QRCodeCanvas
                id="high-res-qr-canvas-modal"
                value={qrPayload}
                size={900}
                level="M"
                fgColor="#09090b"
                bgColor="#ffffff"
                includeMargin={true}
              />
            </div>
          </div>

          {/* Download QR button */}
          <button
            id="btn-download-qr-image"
            onClick={handleDownloadQrPng}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-sm shadow-md transition-all cursor-pointer active:scale-98"
          >
            <Download className="w-5 h-5 text-neutral-950" />
            <span>Descargar Código QR</span>
          </button>

          {/* SECTION: RICH WHATSAPP SHARING PREVIEW */}
          <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-left space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <MessageCircle className="w-4 h-4" />
                <span>Compartir en WhatsApp con Texto Explicativo</span>
              </div>
              <button
                type="button"
                onClick={handleCopyRichMessage}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3 h-3" />
                <span>Copiar texto</span>
              </button>
            </div>

            {/* Preview Box of WhatsApp message */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] font-mono text-stone-300 whitespace-pre-wrap leading-relaxed">
              {richShareMessage}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                id="btn-share-wa-rich"
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(richShareMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Enviar a WhatsApp</span>
              </a>

              <button
                id="btn-copy-public-link-short"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-stone-200 font-bold text-xs transition-colors border border-neutral-700"
              >
                <LinkIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Copiar solo Link</span>
              </button>
            </div>
          </div>

          {/* SECTION: URL CONFIGURATION (CURRENT vs VERCEL vs AI STUDIO) */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Globe className="w-4 h-4" />
                <span>Destino de tu Enlace Web</span>
              </div>
              <button
                type="button"
                onClick={() => setIsExplanationOpen(!isExplanationOpen)}
                className="text-[10px] text-stone-400 hover:text-stone-200 flex items-center gap-1 underline underline-offset-2"
              >
                <HelpCircle className="w-3 h-3" />
                <span>¿Por qué daba error?</span>
              </button>
            </div>

            {/* Selector of URL target */}
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => setUrlSource('current')}
                className={`py-1.5 px-2 rounded-lg font-medium text-center transition-all ${
                  urlSource === 'current'
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                    : 'bg-neutral-950 text-stone-400 hover:text-stone-200 border border-neutral-800'
                }`}
              >
                Navegador Actual
              </button>

              <button
                type="button"
                onClick={() => setUrlSource('aistudio')}
                className={`py-1.5 px-2 rounded-lg font-medium text-center transition-all ${
                  urlSource === 'aistudio'
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                    : 'bg-neutral-950 text-stone-400 hover:text-stone-200 border border-neutral-800'
                }`}
              >
                AI Studio Público
              </button>

              <button
                type="button"
                onClick={() => setUrlSource('vercel')}
                className={`py-1.5 px-2 rounded-lg font-medium text-center transition-all ${
                  urlSource === 'vercel'
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                    : 'bg-neutral-950 text-stone-400 hover:text-stone-200 border border-neutral-800'
                }`}
              >
                Mi Vercel
              </button>
            </div>

            {/* If Vercel is selected, show input */}
            {urlSource === 'vercel' && (
              <div className="pt-2 space-y-1.5">
                <label className="text-[10px] text-stone-400 block font-medium">
                  Pega aquí la URL de tu proyecto en Vercel:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customVercelUrl}
                    onChange={(e) => setCustomVercelUrl(e.target.value)}
                    placeholder="https://tu-vcard.vercel.app"
                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Currently Active URL Display */}
            <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-800/80 text-[10px] text-stone-400 flex items-center justify-between gap-2 overflow-hidden">
              <span className="truncate font-mono text-stone-300">{publicWebUrl}</span>
              <button
                type="button"
                onClick={handleOpenInChrome}
                className="text-amber-400 hover:text-amber-300 shrink-0 font-medium"
              >
                Probar ↗
              </button>
            </div>

            {/* Collapsible friendly explanation for why links error out without publishing */}
            {isExplanationOpen && (
              <div className="p-3 bg-neutral-950 rounded-xl border border-amber-900/40 text-[11px] text-stone-300 space-y-2 mt-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Info className="w-3.5 h-3.5" />
                  <span>¿Por qué daba error al abrirlo en otro dispositivo?</span>
                </div>
                <p className="leading-relaxed">
                  <strong>1. En Google AI Studio:</strong> El entorno de edición donde estás trabajando es una sesión privada de tu cuenta. Para que cualquier persona o celular ajeno pueda abrir el enlace web sin pedir inicio de sesión, simplemente presiona el botón <strong>&quot;Share&quot; (Compartir)</strong> en la esquina superior derecha de AI Studio.
                </p>
                <p className="leading-relaxed">
                  <strong>2. Si lo subes a Vercel:</strong> Como ya hiciste con tu menú interactivo, puedes exportar o subir este código a Vercel. Pega tu enlace de Vercel aquí arriba y el Código QR y los botones se conectarán directamente a Vercel.
                </p>
                <p className="leading-relaxed">
                  <strong>3. Opción 100% offline (sin web):</strong> Si cambias arriba a <em>&quot;Agenda Directa (.vcf)&quot;</em>, el Código QR guardará tu contacto directo en cualquier celular sin pasar por ninguna web ni depender de ningún hosting.
                </p>
              </div>
            )}
          </div>

          {/* Close button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-stone-300 font-semibold text-xs transition-colors cursor-pointer border border-neutral-800"
            >
              Cerrar y Ver Tarjeta
            </button>
          </div>

        </main>
      </div>
    )}

      {/* MODAL: CUSTOMIZE / EDIT PROFILE DATA */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[90vh] bg-neutral-950 rounded-3xl border border-neutral-800 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-stone-100">
                  Editar Datos de tu vCard
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body with CardEditor */}
            <div className="p-4 overflow-y-auto flex-1">
              <CardEditor
                profile={profile}
                onChangeProfile={setProfile}
                currentTheme={currentTheme}
                onChangeTheme={setCurrentTheme}
                qrMode="weblink"
                onChangeQrMode={() => {}}
                layout="horizontal"
                onChangeLayout={() => {}}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">
                Los cambios se guardan automáticamente
              </span>
              <button
                onClick={async () => {
                  await handleSaveProfileToServer(profile);
                  setIsEditorOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                Guardar y Ver mi vCard
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Clean Global Footer */}
      <footer className="mt-8 text-center text-xs text-neutral-600 no-print">
        <p>
          vCard Virtual Oficial • Hernán Fernández • Guateque Manduca
        </p>
      </footer>

    </div>
  );
}
