<script setup lang="ts">
// Barre supérieure mobile : ouvre la navigation dans un tiroir (la colonne desktop est masquée sous md)
const { mobileOpen } = useSidebar()
const route = useRoute()

// Referme le tiroir après chaque navigation
watch(() => route.fullPath, () => { mobileOpen.value = false })
</script>

<template>
  <header class="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-default bg-default/80 px-4 backdrop-blur md:hidden">
    <UButton color="neutral" variant="ghost" icon="i-lucide-menu" aria-label="Ouvrir le menu" @click="mobileOpen = true" />
    <NuxtLink to="/" class="flex items-center gap-2 font-semibold tracking-tight">
      <span class="flex size-7 items-center justify-center rounded-lg bg-primary text-inverted" aria-hidden="true">
        <UIcon name="i-lucide-hard-drive" class="size-4" />
      </span>
      Backup Manager
    </NuxtLink>

    <USlideover v-model:open="mobileOpen" side="left" title="Navigation" :ui="{ content: 'w-72 max-w-[85vw] sm:max-w-72', body: 'p-0 sm:p-0', header: 'sr-only' }">
      <template #body>
        <SidebarContent />
      </template>
    </USlideover>
  </header>
</template>
