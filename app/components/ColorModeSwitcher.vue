<script setup lang="ts">
// Sélecteur clair / sombre / système : affichage seulement, la logique est dans useAppTheme
const { modes, preference, currentModeOption } = useAppTheme()

const items = computed(() => [
  modes.map(m => ({
    label: m.label,
    icon: m.icon,
    trailingIcon: preference.value === m.value ? 'i-lucide-check' : undefined,
    onSelect: () => { preference.value = m.value }
  }))
])
</script>

<template>
  <!-- Le mode n'est connu que côté client : repli de même taille pour éviter le décalage -->
  <ClientOnly>
    <UDropdownMenu :items="items" :content="{ side: 'right', align: 'end', sideOffset: 8 }">
      <UButton color="neutral" variant="ghost" size="sm" :icon="currentModeOption.icon" :aria-label="`Mode d'affichage : ${currentModeOption.label}`" />
    </UDropdownMenu>
    <template #fallback>
      <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-monitor" aria-label="Mode d'affichage" disabled />
    </template>
  </ClientOnly>
</template>
