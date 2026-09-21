import { ChefProfile, QrMode } from '../types';

export function sanitizeInstagram(input: string): { handle: string; url: string } {
  const clean = input.trim().replace(/^@/, '');
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    const parts = clean.split('instagram.com/');
    const handle = parts[1]?.replace(/\/.*$/, '') || 'instagram';
    return { handle: `@${handle}`, url: clean };
  }
  return {
    handle: clean ? `@${clean}` : '',
    url: clean ? `https://instagram.com/${clean}` : '',
  };
}

export function sanitizeLinkedIn(input?: string): { display: string; url: string } {
  if (!input) {
    return { display: '', url: '' };
  }
  const clean = input.trim();
  if (!clean) {
    return { display: '', url: '' };
  }
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    const slug = clean.replace(/https?:\/\/(www\.)?linkedin\.com\/in\/?/, '').replace(/\/.*$/, '');
    return {
      display: slug ? `in/${slug}` : 'LinkedIn',
      url: clean,
    };
  }
  const handle = clean.replace(/^in\//, '').replace(/^@/, '').replace(/^\/+/, '');
  return {
    display: handle ? `in/${handle}` : 'LinkedIn',
    url: handle ? `https://www.linkedin.com/in/${handle}` : '',
  };
}

export function sanitizeWhatsApp(phone: string, defaultCountry: string = '54'): { numberOnly: string; waLink: string } {
  let digits = phone.replace(/\D/g, '');
  if (!digits) {
    digits = defaultCountry;
  }
  return {
    numberOnly: digits,
    waLink: `https://wa.me/${digits}`,
  };
}

export function generateVCard(profile: ChefProfile): string {
  const igChef = sanitizeInstagram(profile.instagramChef);
  const igWateke = sanitizeInstagram(profile.instagramWateke);
  const li = sanitizeLinkedIn(profile.linkedinUrl);
  const cleanPhone = profile.phone.trim();

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.name || 'Chef Ejecutivo'}`,
    `N:;${profile.name || 'Chef'};;;`,
    profile.role ? `TITLE:${profile.role}` : '',
    profile.company ? `ORG:${profile.company}` : '',
    cleanPhone ? `TEL;TYPE=CELL,VOICE,pref:${cleanPhone}` : '',
    profile.email ? `EMAIL;TYPE=INTERNET:${profile.email}` : '',
    profile.avatarUrl && profile.avatarUrl.startsWith('http') ? `PHOTO;VALUE=uri:${profile.avatarUrl}` : '',
    li.url ? `URL;type=LinkedIn:${li.url}` : '',
    igChef.url ? `URL;type=Instagram-Chef:${igChef.url}` : '',
    igWateke.url ? `URL;type=Instagram-Guateque:${igWateke.url}` : '',
    profile.menuUrl ? `URL;type=Menu-Viandas:${profile.menuUrl}` : '',
    `NOTE:${profile.role} • ${profile.company}. WhatsApp: ${cleanPhone}. Instagram Chef: ${igChef.handle}. Instagram Guateque: ${igWateke.handle}. LinkedIn: ${li.display}${profile.menuUrl ? `. Menú y Viandas: ${profile.menuUrl}` : ''}`,
    'END:VCARD',
  ].filter(Boolean);

  return lines.join('\r\n');
}

export function generateTextSummary(profile: ChefProfile): string {
  const igChef = sanitizeInstagram(profile.instagramChef);
  const igWateke = sanitizeInstagram(profile.instagramWateke);
  const li = sanitizeLinkedIn(profile.linkedinUrl);

  return [
    `👨‍🍳 ${profile.name} - ${profile.role}`,
    profile.company ? `🏢 ${profile.company}` : '',
    profile.phone ? `📱 WhatsApp: ${profile.phone}` : '',
    igChef.url ? `📸 Instagram Chef: ${igChef.url}` : '',
    igWateke.url ? `🍽️ Instagram Guateque Manduca: ${igWateke.url}` : '',
    profile.menuUrl ? `🍱 Menú & Viandas: ${profile.menuUrl}` : '',
    li.url ? `💼 LinkedIn: ${li.url}` : '',
  ].filter(Boolean).join('\n');
}

export function generateWhatsAppShareMessage(profile: ChefProfile, targetUrl: string): string {
  const name = profile.name || 'Hernán Fernández';
  const role = profile.role || 'Chef Ejecutivo & Asesor Gastronómico';
  const company = profile.company || 'Guateque Manduca';

  return `📇 *V-Card ${name}*
👨‍🍳 *${role}* • ${company}

Te comparto mi tarjeta de contacto virtual (vCard).
Al abrir este enlace podrás:
📲 Guardar todos mis datos con un toque en la agenda de tu teléfono (.vcf)
💬 Chatear directo por WhatsApp
📸 Ver mis perfiles de Instagram (@hernan.chef.ej y @guatequemanduca)
✨ Conocer mis servicios de asesoría gastronómica

👇 Toca aquí para abrir mi V-Card:
${targetUrl}`;
}

export const VERCEL_PRODUCTION_URL = 'https://vcard-hernan-fernandez.vercel.app';
export const AI_STUDIO_SHARED_URL = 'https://ais-pre-eder53zmzkew6zfqfcngez-33636785901.us-east1.run.app';

export function getCleanAppUrl(customUrl?: string): string {
  try {
    if (customUrl && customUrl.trim().startsWith('http')) {
      const cleanCustom = customUrl.trim().split('?')[0].split('#')[0];
      return cleanCustom.endsWith('/') ? cleanCustom.slice(0, -1) : cleanCustom;
    }

    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      // If opened on Vercel or a custom domain, use that exact origin
      if (origin.includes('vercel.app')) {
        return origin;
      }
    }

    // Default to the official public Vercel production URL
    return VERCEL_PRODUCTION_URL;
  } catch {
    return VERCEL_PRODUCTION_URL;
  }
}

export const CARD_PREVIEW_VERSION = 'v=hf';

export function buildPublicWebProfileUrl(_profile?: ChefProfile, customBase?: string): string {
  try {
    const base = getCleanAppUrl(customBase);
    const separator = base.includes('?') ? '&' : '/?';
    return `${base}${separator}${CARD_PREVIEW_VERSION}`;
  } catch {
    return `${customBase || VERCEL_PRODUCTION_URL}/?${CARD_PREVIEW_VERSION}`;
  }
}

export function parseProfileFromUrl(): Partial<ChefProfile> | null {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    if (!searchParams.has('tarjeta') && !searchParams.has('p') && !searchParams.has('n') && !searchParams.has('card')) {
      return null;
    }

    const updates: Partial<ChefProfile> = {};
    if (searchParams.get('n')) updates.name = searchParams.get('n')!;
    if (searchParams.get('r')) updates.role = searchParams.get('r')!;
    if (searchParams.get('c')) updates.company = searchParams.get('c')!;
    if (searchParams.get('p')) {
      updates.phone = searchParams.get('p')!;
      updates.whatsapp = searchParams.get('p')!;
    }
    if (searchParams.get('li')) {
      updates.linkedinUrl = searchParams.get('li')!;
    }
    return Object.keys(updates).length > 0 ? updates : null;
  } catch {
    return null;
  }
}

export function getQrPayload(profile: ChefProfile, mode?: QrMode, customBaseUrl?: string): string {
  // If explicitly set to vcard, output vcard data; otherwise ALWAYS output the clean web page URL
  if (mode === 'vcard') {
    return generateVCard(profile);
  }
  return buildPublicWebProfileUrl(profile, customBaseUrl);
}

export function downloadVCardFile(profile: ChefProfile): void {
  const vcard = generateVCard(profile);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${(profile.name || 'Contacto_Chef').replace(/\s+/g, '_')}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
