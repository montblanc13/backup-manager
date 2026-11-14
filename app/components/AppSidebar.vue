<script setup lang="ts">
// Colonne de navigation desktop, repliable (icônes seules) et collée sur toute la hauteur
const { collapsed, toggle } = useSidebar()
</script>

<template>
  <aside
    class="sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-default bg-default transition-[width] duration-200 ease-out motion-reduce:transition-none md:flex"
    :class="collapsed ? 'w-16' : 'w-60'"
    aria-label="Barre latérale"
  >
    <div class="min-h-0 flex-1">
      <SidebarContent :collapsed="collapsed" />
    </div>
    <div class="shrink-0 border-t border-default p-2" :class="collapsed ? 'flex justify-center' : ''">
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        :icon="collapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
        :label="collapsed ? undefined : 'Réduire'"
        :aria-label="collapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'"
        :aria-expanded="!collapsed"
        :block="!collapsed"
        class="justify-start"
        :class="{ 'justify-center': collapsed }"
        @click="toggle"
      />
    </div>
  </aside>
</template>
