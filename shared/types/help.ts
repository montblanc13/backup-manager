/** Entrée de la liste des guides d'aide */
export interface HelpGuideLink {
  path: string
  title: string
  description: string
  /** Libellé court (footer) */
  label: string
  /** Nom d'icône lucide (ex. i-lucide-rocket) */
  icon: string
}
