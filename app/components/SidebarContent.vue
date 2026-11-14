<script setup lang="ts">
// Contenu de la navigation, partagé entre la colonne desktop (repliable) et le tiroir mobile
defineProps<{ collapsed?: boolean }>()

const { appVersion } = useRuntimeConfig().public
const { data: guides } = await useHelpGuides()
const route = useRoute()

// « Tâches » reste actif sur les pages tâche et exécution
const mainLinks = computed(() => [
  { label: 'Tâches', to: '/', icon: 'i-lucide-list-checks', active: !route.path.startsWith('/help') },
  { label: 'Aide', to: '/help', icon: 'i-lucide-circle-help', active: route.path === '/help' }
])

const itemBase = 'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary'
const itemState = (active: boolean) => active
  ? 'bg-elevated font-medium text-highlighted'
  : 'text-muted hover:bg-elevated/60 hover:text-highlighted'
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <NuxtLink
      to="/"
      class="flex h-14 shrink-0 items-center gap-2.5 px-4 font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      :class="{ 'justify-center px-0': collapsed }"
      title="Backup Manager"
    >
      <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-inverted shadow-sm" aria-hidden="true">
        <UIcon name="i-lucide-hard-drive" class="size-4.5" />
      </span>
      <span v-if="!collapsed" class="truncate">Backup Manager</span>
      <span v-else class="sr-only">Backup Manager</span>
    </NuxtLink>

    <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-2">
      <nav aria-label="Navigation principale" class="flex flex-col gap-0.5">
        <NuxtLink
          v-for="link in mainLinks"
          :key="link.to"
          :to="link.to"
          :title="link.label"
          :aria-current="link.active ? 'page' : undefined"
          :class="[itemBase, itemState(link.active), { 'justify-center px-0': collapsed }]"
        >
          <UIcon :name="link.icon" class="size-4.5 shrink-0" aria-hidden="true" />
          <span v-if="!collapsed" class="truncate">{{ link.label }}</span>
          <span v-else class="sr-only">{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <nav v-if="guides.length" aria-label="Guides d'aide" class="flex flex-col gap-0.5">
        <p v-if="!collapsed" class="px-2.5 pb-1 text-xs font-medium uppercase tracking-wide text-dimmed">Guides</p>
        <div v-else class="mx-2 mb-1 h-px bg-border" aria-hidden="true" />
        <NuxtLink
          v-for="guide in guides"
          :key="guide.path"
          :to="guide.path"
          :title="guide.title"
          :aria-current="route.path === guide.path ? 'page' : undefined"
          :class="[itemBase, itemState(route.path === guide.path), { 'justify-center px-0': collapsed }]"
        >
          <UIcon :name="guide.icon" class="size-4.5 shrink-0" aria-hidden="true" />
          <span v-if="!collapsed" class="truncate">{{ guide.label }}</span>
          <span v-else class="sr-only">{{ guide.title }}</span>
        </NuxtLink>
      </nav>
    </div>

    <div class="flex shrink-0 flex-col gap-2 border-t border-default p-2">
      <div class="flex items-center gap-1" :class="collapsed ? 'flex-col' : 'justify-between'">
        <ThemeSwitcher :compact="collapsed" />
        <ColorModeSwitcher />
      </div>
      <UBadge
        :label="`v${appVersion}`"
        color="neutral"
        variant="subtle"
        size="sm"
        class="self-center font-mono"
        title="Version de l'application"
      />
    </div>
  </div>
</template>
