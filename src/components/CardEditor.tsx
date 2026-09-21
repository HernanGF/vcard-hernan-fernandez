import { useState } from 'react';
import { 
  Phone, 
  Instagram, 
  Linkedin, 
  User, 
  Briefcase, 
  Palette, 
  QrCode, 
  Mail, 
  Building2, 
  Check, 
  RotateCcw,
  Sparkles,
  Info,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  Save,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { ChefProfile, CardTheme, CardThemeId, QrMode } from '../types';
import { CARD_THEMES } from '../data/themes';
import { DEFAULT_CHEF_PROFILE } from '../data/defaultProfile';

interface CardEditorProps {
  profile: ChefProfile;
  onChangeProfile: (profile: ChefProfile) => void;
  currentTheme: CardTheme;
  onChangeTheme: (theme: CardTheme) => void;
  qrMode: QrMode;
  onChangeQrMode: (mode: QrMode) => void;
  layout: 'horizontal' | 'vertical';
  onChangeLayout: (layout: 'horizontal' | 'vertical') => void;
}

export function CardEditor({
  profile,
  onChangeProfile,
  currentTheme,
  onChangeTheme,
  qrMode,
  onChangeQrMode,
  layout,
  onChangeLayout,
}: CardEditorProps) {
  const [activeTab, setActiveTab] = useState<'contactos' | 'diseno' | 'qr'>('contactos');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSavePermanently = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      localStorage.setItem('chef_profile_v1', JSON.stringify(profile));
      const res = await fetch('/api/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      if (res.ok) {
        setSaveStatus('¡Guardado exitosamente en el servidor!');
      } else {
        setSaveStatus('Guardado localmente en tu navegador.');
      }
    } catch {
      setSaveStatus('Guardado localmente en tu navegador.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3500);
    }
  };

  const updateField = (key: keyof ChefProfile, value: string) => {
    onChangeProfile({
      ...profile,
      [key]: value,
    });
  };

  const resetToDefaults = () => {
    localStorage.removeItem('chef_profile_v1');
    onChangeProfile({ ...DEFAULT_CHEF_PROFILE, avatarUrl: '/assets/hernan-profile.jpg' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const inputElement = e.target;
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl !== 'string') return;

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxSize = 320; // High quality mobile avatar size
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.86);
            updateField('avatarUrl', compressed);
            // Persist to server disk so all mobile devices and external links see the photo
            fetch('/api/save-photo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: compressed }),
            }).catch(() => {});
          } else {
            updateField('avatarUrl', dataUrl);
            fetch('/api/save-photo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: dataUrl }),
            }).catch(() => {});
          }
        } catch {
          updateField('avatarUrl', dataUrl);
          fetch('/api/save-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataUrl }),
          }).catch(() => {});
        }
      };

      img.onerror = () => {
        // Fallback directly to dataUrl if canvas operations fail
        updateField('avatarUrl', dataUrl);
        fetch('/api/save-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl }),
        }).catch(() => {});
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
    inputElement.value = '';
  };

  return (
    <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-800 bg-neutral-950/60 p-1.5 gap-1">
        <button
          id="tab-btn-contactos"
          onClick={() => setActiveTab('contactos')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-xl transition-all ${
            activeTab === 'contactos'
              ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700/80'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Datos & Redes</span>
        </button>

        <button
          id="tab-btn-diseno"
          onClick={() => setActiveTab('diseno')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-xl transition-all ${
            activeTab === 'diseno'
              ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700/80'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Estilo & Formato</span>
        </button>

        <button
          id="tab-btn-qr"
          onClick={() => setActiveTab('qr')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-xl transition-all ${
            activeTab === 'qr'
              ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700/80'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Configuración QR</span>
        </button>
      </div>

      <div className="p-4 sm:p-5">
        {/* Quick Save Bar */}
        <div className="mb-4 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-2">
          <div className="text-left">
            <div className="text-xs font-bold text-stone-100">Guardar Cambios</div>
            <div className="text-[10px] text-stone-400">
              {saveStatus || 'Guarda en el servidor para actualizar tu vCard pública'}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSavePermanently}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
          >
            {isSaving ? (
              <span>Guardando...</span>
            ) : saveStatus ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-950" />
                <span>¡Guardado!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Ahora</span>
              </>
            )}
          </button>
        </div>

        {/* TAB 1: DATOS & REDES */}
        {activeTab === 'contactos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Los 4 Datos Requeridos de la Tarjeta
              </span>
              <button
                onClick={resetToDefaults}
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-amber-400 transition-colors"
                title="Restablecer valores de ejemplo"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            </div>

            {/* 1. Teléfono / WhatsApp */}
            <div className="space-y-1">
              <label htmlFor="input-phone" className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <Phone className="w-3.5 h-3.5" />
                <span>1. Teléfono propio / WhatsApp</span>
              </label>
              <input
                id="input-phone"
                type="text"
                value={profile.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+54 9 11 3456-7890"
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-700 rounded-xl text-stone-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-neutral-400">
                Permite enviar WhatsApp con 1 toque o llamar de forma directa.
              </span>
            </div>

            {/* 2. Instagram Chef Ejecutivo y Asesor */}
            <div className="space-y-1">
              <label htmlFor="input-ig-chef" className="flex items-center gap-1.5 text-xs font-medium text-pink-400">
                <Instagram className="w-3.5 h-3.5" />
                <span>2. Instagram: Chef Ejecutivo y Asesor</span>
              </label>
              <input
                id="input-ig-chef"
                type="text"
                value={profile.instagramChef}
                onChange={(e) => updateField('instagramChef', e.target.value)}
                placeholder="@hernan.chef.ej o https://instagram.com/..."
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-700 rounded-xl text-stone-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-neutral-400">
                Tu perfil profesional de chef y asesor gastronómico.
              </span>
            </div>

            {/* 3. Instagram Guateque Manduca */}
            <div className="space-y-1">
              <label htmlFor="input-ig-wateke" className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                <Instagram className="w-3.5 h-3.5" />
                <span>3. Instagram: Guateque Manduca</span>
              </label>
              <input
                id="input-ig-wateke"
                type="text"
                value={profile.instagramWateke}
                onChange={(e) => updateField('instagramWateke', e.target.value)}
                placeholder="@guatequemanduca o https://instagram.com/..."
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-700 rounded-xl text-stone-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-neutral-400">
                El perfil de tu proyecto o marca gastronómica Guateque Manduca.
              </span>
            </div>

            {/* Menú Digital / Carta & Viandas */}
            <div className="space-y-2 p-3 rounded-xl bg-amber-950/20 border border-amber-500/40">
              <div className="flex items-center justify-between">
                <label htmlFor="input-menu-url" className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Menú Digital • Catering y Viandas al vacío</span>
                </label>
                {profile.menuUrl && (
                  <a
                    href={profile.menuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Probar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                id="input-menu-url"
                type="text"
                value={profile.menuUrl || ''}
                onChange={(e) => updateField('menuUrl', e.target.value)}
                placeholder="https://... (enlace a tu carta web, Drive, PDF o catálogo)"
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-700 rounded-xl text-stone-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <input
                id="input-menu-title"
                type="text"
                value={profile.menuTitle || ''}
                onChange={(e) => updateField('menuTitle', e.target.value)}
                placeholder="Menú digital - Catering y Viandas al vacío"
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-700 rounded-xl text-stone-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-stone-400 block">
                Al hacer clic en este botón de tu V-Card, redirige directamente a la carta de viandas y catering.
              </span>
            </div>

            {/* 4. LinkedIn personal y dirección */}
            <div className="space-y-1.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center justify-between">
                <label htmlFor="input-linkedin" className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn Personal (Enlace a tu perfil)</span>
                </label>
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://www.linkedin.com/in/${profile.linkedinUrl.replace(/^in\//, '').replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Probar enlace</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                id="input-linkedin"
                type="text"
                value={profile.linkedinUrl || ''}
                onChange={(e) => {
                  onChangeProfile({
                    ...profile,
                    linkedinUrl: e.target.value.trim(),
                    linkedinText: e.target.value.trim(),
                  });
                }}
                placeholder="https://www.linkedin.com/in/tu-perfil o in/tu-perfil"
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-700 rounded-xl text-stone-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-[10px] text-stone-400 block">
                Pega la dirección de tu perfil de LinkedIn (por ejemplo: https://www.linkedin.com/in/tu-nombre).
              </span>
            </div>

            {/* Imagen Pequeña de Perfil (Avatar) */}
            <div className="pt-3 border-t border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Imagen Pequeña / Foto de Perfil</span>
                </span>
                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => updateField('avatarUrl', '')}
                    className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Quitar foto</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl || '/assets/hernan-profile.jpg'}
                    alt="Vista previa"
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/assets/hernan-profile.jpg';
                    }}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-neutral-950 flex items-center justify-center font-bold border-2 border-amber-300 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="avatar-file-upload"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-sm active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir mi foto</span>
                      <input
                        id="avatar-file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => updateField('avatarUrl', '/assets/hernan-profile.jpg')}
                      className="px-2.5 py-1.5 text-[11px] rounded-lg bg-neutral-800 hover:bg-neutral-700 text-stone-200 border border-neutral-700 transition-colors"
                    >
                      Foto Original
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Fotografía original de Hernán Fernández. Puedes cambiarla cuando quieras.
                  </p>
                </div>
              </div>
            </div>

            {/* Identidad de Marca y Descripción del Cargo */}
            <div className="pt-3 border-t border-neutral-800 space-y-3">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Cargo, Puesto y Descripción Profesional
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="input-name" className="block text-[11px] text-neutral-400 mb-1">
                    Nombre a mostrar
                  </label>
                  <input
                    id="input-name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Hernán"
                    className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor="input-role" className="block text-[11px] text-neutral-400 mb-1">
                    Cargo o Puesto
                  </label>
                  <input
                    id="input-role"
                    type="text"
                    value={profile.role}
                    onChange={(e) => updateField('role', e.target.value)}
                    placeholder="Chef Ejecutivo & Asesor"
                    className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor="input-company" className="block text-[11px] text-neutral-400 mb-1">
                    Marca / Restaurante / Proyecto
                  </label>
                  <input
                    id="input-company"
                    type="text"
                    value={profile.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    placeholder="Guateque Manduca"
                    className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor="input-email" className="block text-[11px] text-neutral-400 mb-1">
                    Correo Electrónico (Mail)
                  </label>
                  <input
                    id="input-email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="hernan.chef.ej@gmail.com"
                    className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Pequeña Descripción de Cargo o Puesto */}
              <div>
                <label htmlFor="input-bio" className="block text-[11px] text-amber-400 font-medium mb-1">
                  Pequeña descripción de cargo o puesto / Bio
                </label>
                <textarea
                  id="input-bio"
                  rows={2}
                  value={profile.bio || ''}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Especialista en diseño de cartas de autor, consultoría gastronómica, optimización y rentabilidad de cocinas..."
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
                <span className="text-[10px] text-neutral-500">
                  Aparece destacada en la tarjeta personal digital para contextualizar tus servicios y trayectoria.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ESTILO & FORMATO */}
        {activeTab === 'diseno' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Temas de Tarjeta de Presentación
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {CARD_THEMES.map((themeOption) => {
                  const isSelected = currentTheme.id === themeOption.id;
                  return (
                    <button
                      key={themeOption.id}
                      onClick={() => onChangeTheme(themeOption)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-950/20 text-white shadow-md'
                          : 'border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-neutral-600"
                          style={{ backgroundColor: themeOption.qrFg }}
                        />
                        <span className="text-xs font-medium">{themeOption.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Orientación de la Tarjeta
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => onChangeLayout('horizontal')}
                  className={`p-2.5 text-xs font-medium rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    layout === 'horizontal'
                      ? 'border-amber-500 bg-amber-950/20 text-amber-300'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="w-12 h-7 border border-current rounded-sm flex items-center justify-center text-[9px]">
                    85x55mm
                  </div>
                  <span>Horizontal (Estándar)</span>
                </button>

                <button
                  onClick={() => onChangeLayout('vertical')}
                  className={`p-2.5 text-xs font-medium rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    layout === 'vertical'
                      ? 'border-amber-500 bg-amber-950/20 text-amber-300'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="w-7 h-12 border border-current rounded-sm flex items-center justify-center text-[9px]">
                    Vertical
                  </div>
                  <span>Vertical (Badge / Móvil)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONFIGURACIÓN QR */}
        {activeTab === 'qr' && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                ¿Qué sucede al escanear el código QR?
              </span>
              <p className="text-[11px] text-neutral-400 mb-3">
                Seleccioná el formato que querés codificar dentro del código QR.
              </p>

              <div className="space-y-2">
                {/* Option 1: Web Link Landing (Primary & Recommended) */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    qrMode === 'weblink'
                      ? 'border-amber-500 bg-amber-950/20 text-white'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="qrMode"
                    value="weblink"
                    checked={qrMode === 'weblink'}
                    onChange={() => onChangeQrMode('weblink')}
                    className="mt-0.5 text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <div className="text-xs font-semibold text-stone-100 flex items-center gap-1.5">
                      <span>🌐 Página Web Digital (Recomendado)</span>
                      <span className="px-1.5 py-0.2 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-medium">
                        Tu Preferencia
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Al escanear el QR, se abre tu página web donde están todos tus datos, botones directos para WhatsApp, Instagrams, LinkedIn y el botón <strong>&ldquo;Guardar en mis Contactos&rdquo;</strong>.
                    </p>
                  </div>
                </label>

                {/* Option 2: vCard Direct */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    qrMode === 'vcard'
                      ? 'border-amber-500 bg-amber-950/20 text-white'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="qrMode"
                    value="vcard"
                    checked={qrMode === 'vcard'}
                    onChange={() => onChangeQrMode('vcard')}
                    className="mt-0.5 text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <div className="text-xs font-semibold text-stone-100 flex items-center gap-1.5">
                      <span>📇 vCard Directo (Sin pasar por web)</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Al enfocar con la cámara, el teléfono abre directamente la agenda de contactos con tus datos pre-cargados.
                    </p>
                  </div>
                </label>

                {/* Option 3: Text list */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    qrMode === 'textlist'
                      ? 'border-amber-500 bg-amber-950/20 text-white'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="qrMode"
                    value="textlist"
                    checked={qrMode === 'textlist'}
                    onChange={() => onChangeQrMode('textlist')}
                    className="mt-0.5 text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <div className="text-xs font-semibold text-stone-100">
                      Texto Plano con Enlaces
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Muestra un mensaje de texto claro con cada link (WhatsApp, Instagram de Chef, Instagram de Wateke Manduca y LinkedIn).
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-start gap-2.5 text-xs text-neutral-400">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                El código QR se actualiza en tiempo real al escribir cualquier cambio. Podés probar escanearlo directamente desde la pantalla con la cámara de tu teléfono.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
