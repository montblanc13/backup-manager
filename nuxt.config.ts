// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/icon/module', '@nuxt/image'],
  css: ['~/assets/css/main.css'],
  // Auto-import de la couche d'accès à l'API (app/services)
  imports: { dirs: ['services'] },
  // Configuration serveur uniquement. Chaque clé est surchargée par la variable
  // d'environnement NUXT_<CLE_EN_SNAKE_CASE> (lue depuis .env), ex. dbPath -> NUXT_DB_PATH
  runtimeConfig: {
    dbPath: './data/backup-manager.db',
    // Dossier des migrations Drizzle (à embarquer tel quel dans l'image de production)
    migrationsFolder: './server/database/migrations',
    // Clé API Anthropic (NUXT_ANTHROPIC_API_KEY) pour la suggestion de cron en langage naturel
    anthropicApiKey: '',
    // Modèle utilisé pour cette suggestion (NUXT_ANTHROPIC_MODEL)
    anthropicModel: 'claude-opus-5-5',
    // Racine du sélecteur de dossier : le serveur ne permet pas de naviguer au-dessus
    browseRoot: '/'
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
