// Applique le thème sauvegardé (cookie) dès l'initialisation, avant le rendu SSR
export default defineNuxtPlugin(() => {
  useAppTheme()
})
