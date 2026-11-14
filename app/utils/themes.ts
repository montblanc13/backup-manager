/**
 * Catalogue des thèmes de l'application : SEUL endroit à modifier pour en ajouter un.
 * Chaque thème pilote les couleurs Nuxt UI (`ui.colors`), le rayon des composants et
 * la nuance de la couleur primaire utilisée en clair / en sombre (pour un contraste suffisant).
 * `primary` et `neutral` doivent être des palettes Tailwind existantes.
 */
export interface AppTheme {
  id: string
  label: string
  description: string
  primary: string
  neutral: string
  /** Rayon de base (--ui-radius) */
  radius: string
  /** Nuance de la couleur primaire en mode clair / sombre (50 à 950) */
  shades: { light: number, dark: number }
  /** Couleur de la pastille d'aperçu (CSS) */
  swatch: string
}

export const APP_THEMES = [
  { id: 'slate', label: 'Ardoise', description: 'Neutre bleu-gris, sobre', primary: 'blue', neutral: 'slate', radius: '0.25rem', shades: { light: 600, dark: 400 }, swatch: '#2563eb' },
  { id: 'emerald', label: 'Émeraude', description: 'Vert profond, arrondi', primary: 'emerald', neutral: 'zinc', radius: '0.375rem', shades: { light: 700, dark: 400 }, swatch: '#047857' },
  { id: 'indigo', label: 'Indigo', description: 'Violet-bleu, très arrondi', primary: 'indigo', neutral: 'gray', radius: '0.5rem', shades: { light: 600, dark: 400 }, swatch: '#4f46e5' },
  { id: 'amber', label: 'Ambre', description: 'Chaud, pierre, anguleux', primary: 'amber', neutral: 'stone', radius: '0.0625rem', shades: { light: 700, dark: 400 }, swatch: '#b45309' },
  { id: 'rose', label: 'Rose', description: 'Rose vif, neutre zinc', primary: 'rose', neutral: 'neutral', radius: '0.4375rem', shades: { light: 600, dark: 400 }, swatch: '#e11d48' }
] as const satisfies readonly AppTheme[]

export type AppThemeId = (typeof APP_THEMES)[number]['id']

export const DEFAULT_THEME_ID: AppThemeId = 'slate'

/** Modes d'affichage proposés (le mode « system » suit le réglage du système) */
export const COLOR_MODES = [
  { value: 'light', label: 'Clair', icon: 'i-lucide-sun' },
  { value: 'dark', label: 'Sombre', icon: 'i-lucide-moon' },
  { value: 'system', label: 'Système', icon: 'i-lucide-monitor' }
] as const

export type ColorModePreference = (typeof COLOR_MODES)[number]['value']

/** Retrouve un thème par son identifiant (thème par défaut si inconnu) */
export function findTheme(id: string | null | undefined): AppTheme {
  return APP_THEMES.find(t => t.id === id) ?? APP_THEMES.find(t => t.id === DEFAULT_THEME_ID)!
}

/** CSS injecté dans <head> : rayon et nuance de la couleur primaire du thème (sélecteurs plus spécifiques que ceux de Nuxt UI) */
export function buildThemeCss(theme: AppTheme): string {
  return [
    `html:root{--ui-radius:${theme.radius}}`,
    `html:root:not(.dark){--ui-primary:var(--ui-color-primary-${theme.shades.light})}`,
    `html.dark{--ui-primary:var(--ui-color-primary-${theme.shades.dark})}`
  ].join('')
}
