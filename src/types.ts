export interface ChefProfile {
  name: string;
  avatarUrl?: string;
  tagline: string;
  role: string;
  company: string;
  phone: string;
  whatsapp: string;
  whatsappMessage: string;
  email: string;
  instagramChef: string;
  instagramWateke: string;
  menuUrl?: string;
  menuTitle?: string;
  linkedinUrl: string;
  linkedinText: string;
  location: string;
  bio: string;
}

export type CardThemeId = 'noir-gold' | 'bistro-linen' | 'emerald-craft' | 'minimal-white';

export interface CardTheme {
  id: CardThemeId;
  name: string;
  cardBg: string;
  border: string;
  accent: string;
  accentText: string;
  primaryText: string;
  secondaryText: string;
  qrFg: string;
  qrBg: string;
  badgeBg: string;
  badgeText: string;
}

export type QrMode = 'vcard' | 'weblink' | 'textlist';
