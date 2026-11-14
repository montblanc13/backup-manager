import type { HelpGuideLink } from '#shared/types/help'

/** Accès aux guides d'aide (Nuxt Content) : seule couche qui interroge la collection `help` */

/** Liste ordonnée des guides, pour l'index et le footer */
export function useHelpGuides() {
  return useAsyncData('help-guides', async (): Promise<HelpGuideLink[]> => {
    const guides = await queryCollection('help').select('path', 'title', 'description', 'order', 'label', 'icon').order('order', 'ASC').all()
    return guides.map(({ path, title, description, label, icon }) => ({ path, title, description, label, icon }))
  }, { default: () => [] })
}

/** Guide correspondant au chemin donné (null si absent) */
export function useHelpGuide(path: MaybeRefOrGetter<string>) {
  return useAsyncData(() => `help-guide-${toValue(path)}`, () => queryCollection('help').path(toValue(path)).first(), {
    watch: [() => toValue(path)]
  })
}
