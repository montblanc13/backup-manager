/**
 * Appelle `refresh` à intervalle régulier côté client.
 * Suspendu quand l'onglet est masqué, sans chevauchement si un appel est encore en cours,
 * et arrêté automatiquement au démontage du composant.
 * `refreshing` reste vrai au moins `minVisibleMs` pour que l'indicateur ne clignote pas.
 */
export function useAutoRefresh(refresh: () => Promise<unknown>, intervalMs = 5000, minVisibleMs = 700) {
  let timer: ReturnType<typeof setInterval> | undefined
  let inFlight = false
  const refreshing = ref(false)
  const lastRefreshedAt = ref<Date | null>(null)

  async function tick() {
    if (inFlight || document.hidden) return
    inFlight = true
    refreshing.value = true
    const startedAt = Date.now()
    try {
      await refresh()
      lastRefreshedAt.value = new Date()
    } finally {
      const remaining = minVisibleMs - (Date.now() - startedAt)
      if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining))
      refreshing.value = false
      inFlight = false
    }
  }

  onMounted(() => { timer = setInterval(tick, intervalMs) })
  onScopeDispose(() => clearInterval(timer))

  return { refreshing, lastRefreshedAt, intervalMs }
}
