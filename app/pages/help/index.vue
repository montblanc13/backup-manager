<script setup lang="ts">
const { data: guides } = await useHelpGuides()

useSeoMeta({ title: 'Aide : guides pratiques' })
</script>

<template>
  <div>
    <PageHeader title="Guides pratiques" description="Pas à pas pour configurer et suivre vos sauvegardes." back-to="/" />
    <ul class="grid gap-3 sm:grid-cols-2">
      <li v-for="guide in guides" :key="guide.path">
        <NuxtLink
          :to="guide.path"
          class="group flex h-full items-start gap-3 rounded-lg border border-default bg-default p-4 shadow-xs transition hover:border-accented hover:bg-elevated/40 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <span class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden="true">
            <UIcon :name="guide.icon" class="size-4" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block font-medium text-highlighted group-hover:underline">{{ guide.title }}</span>
            <span class="mt-1 block text-sm text-muted">{{ guide.description }}</span>
          </span>
          <UIcon name="i-lucide-chevron-right" class="mt-1 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
