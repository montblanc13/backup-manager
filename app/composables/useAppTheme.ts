import { APP_THEMES, COLOR_MODES, DEFAULT_THEME_ID, buildThemeCss, findTheme, type AppThemeId, type ColorModePreference } from '~/utils/themes'

/**
 * Thème (couleurs, rayon) et mode clair / sombre / système.
 * - thème : persisté dans le cookie `app-theme` (lisible côté serveur, donc rendu SSR sans flash) ;
 * - mode : géré par le color mode de Nuxt UI (script inline anti-flash, stockage localStorage).
 */
export function useAppTheme() {
  const cookie = useCookie<string>('app-theme', { default: () => DEFAULT_THEME_ID, maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  const appConfig = useAppConfig()
  const colorMode = useColorMode()

  const theme = computed(() => findTheme(cookie.value))

  // Applique les couleurs Nuxt UI (réactif : Nuxt UI régénère ses variables CSS, y compris en SSR)
  watchEffect(() => {
    appConfig.ui.colors.primary = theme.value.primary
    appConfig.ui.colors.neutral = theme.value.neutral
  })

  useHead({
    style: [{ key: 'app-theme', innerHTML: () => buildThemeCss(theme.value) }],
    htmlAttrs: { 'data-theme': () => theme.value.id }
  })

  function setTheme(id: AppThemeId) {
    cookie.value = findTheme(id).id
  }

  const preference = computed<ColorModePreference>({
    get: () => (colorMode.preference as ColorModePreference) ?? 'system',
    set: (value) => { colorMode.preference = value }
  })

  /** Mode effectivement affiché (résout « system ») */
  const resolvedMode = computed(() => colorMode.value)
  const currentModeOption = computed(() => COLOR_MODES.find(m => m.value === preference.value) ?? COLOR_MODES[2])

  return { themes: APP_THEMES, modes: COLOR_MODES, theme, setTheme, preference, resolvedMode, currentModeOption }
}
