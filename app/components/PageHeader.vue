<script setup lang="ts">
// En-tête de page commun : lien de retour, titre, sous-titre, actions
defineProps<{ title: string, description?: string, backTo?: string, backLabel?: string }>()
</script>

<template>
  <div class="mb-6 space-y-2">
    <UButton v-if="backTo" :to="backTo" icon="i-lucide-arrow-left" variant="link" color="neutral" size="sm" :label="backLabel ?? 'Retour'" class="-ml-2.5" />
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0 space-y-1">
        <h1 class="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-semibold tracking-tight text-highlighted">
          {{ title }}
          <slot name="badge" />
        </h1>
        <p v-if="description" class="max-w-2xl text-sm text-muted">{{ description }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
