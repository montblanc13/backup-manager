import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // Guides d'aide : content/help/*.md, servis sous /help/<slug>
    help: defineCollection({
      type: 'page',
      source: 'help/*.md',
      schema: z.object({
        // Position dans la liste des guides (ordre croissant)
        order: z.number(),
        // Libellé court et icône lucide, pour le footer et l'index des guides
        label: z.string(),
        icon: z.string()
      })
    })
  }
})
