<script setup lang="ts">
// Sélecteur de thème : affichage seulement, la logique est dans useAppTheme
defineProps<{ compact?: boolean }>()
const { themes, theme, setTheme } = useAppTheme()

const items = computed(() => [
  themes.map(t => ({
    label: t.label,
    description: t.description,
    trailingIcon: t.id === theme.value.id ? 'i-lucide-check' : undefined,
    swatch: t.swatch,
    onSelect: () => setTheme(t.id)
  }))
])
</script>

<template>
  <UDropdownMenu :items="items" :content="{ side: 'right', align: 'end', sideOffset: 8 }" :ui="{ content: 'w-64' }">
    <UButton color="neutral" variant="ghost" size="sm" :aria-label="`Thème : ${theme.label}`" class="gap-2">
      <span class="size-3.5 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/20" :style="{ backgroundColor: theme.swatch }" aria-hidden="true" />
      <template v-if="!compact">
        <span class="text-sm">{{ theme.label }}</span>
        <UIcon name="i-lucide-chevron-down" class="size-3.5 text-muted" aria-hidden="true" />
      </template>
    </UButton>
    <template #item-leading="{ item }">
      <span class="size-4 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/20" :style="{ backgroundColor: (item as any).swatch }" aria-hidden="true" />
    </template>
  </UDropdownMenu>
</template>
