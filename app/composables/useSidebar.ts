/**
 * État de la colonne de navigation : repliée (persistée par cookie, donc lisible côté serveur
 * sans flash) et ouverture du tiroir sur mobile.
 */
export function useSidebar() {
  const collapsed = useCookie<boolean>('sidebar-collapsed', {
    default: () => false,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  })
  const mobileOpen = useState('sidebar-mobile-open', () => false)

  const toggle = () => { collapsed.value = !collapsed.value }

  return { collapsed, mobileOpen, toggle }
}
