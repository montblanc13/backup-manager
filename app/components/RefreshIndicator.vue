<script setup lang="ts">
// Indicateur discret d'actualisation automatique : la pastille pulse pendant un rafraîchissement,
// l'opacité varie sans changer la taille ni le texte (pas de décalage ni de clignotement)
defineProps<{ refreshing: boolean, intervalMs: number }>()
</script>

<template>
  <span class="inline-flex items-center gap-1.5 text-xs text-muted" role="status" aria-live="off" :title="`Actualisation automatique toutes les ${intervalMs / 1000} s`">
    <span class="size-1.5 rounded-full bg-success transition-opacity duration-500" :class="refreshing ? 'animate-pulse opacity-100' : 'opacity-40'" aria-hidden="true" />
    Actualisation auto
    <span class="sr-only">{{ refreshing ? 'en cours' : 'active' }}</span>
  </span>
</template>
