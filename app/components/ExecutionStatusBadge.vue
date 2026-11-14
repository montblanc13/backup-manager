<script setup lang="ts">
import type { ExecutionStatus } from '#shared/types/backup'

defineProps<{ status: ExecutionStatus | null }>()

const icons: Record<ExecutionStatus, string> = {
  running: 'i-lucide-loader-circle',
  success: 'i-lucide-circle-check',
  failed: 'i-lucide-circle-x'
}
</script>

<template>
  <!-- Badge d'état d'une exécution (ou "Jamais exécutée") : icône + libellé, jamais la couleur seule -->
  <UBadge v-if="status" :color="statusColors[status]" variant="subtle" size="md" class="gap-1.5 font-medium">
    <UIcon :name="icons[status]" class="size-3.5" :class="{ 'animate-spin': status === 'running' }" aria-hidden="true" />
    {{ statusLabels[status] }}
  </UBadge>
  <UBadge v-else color="neutral" variant="subtle" size="md" class="gap-1.5 font-medium">
    <UIcon name="i-lucide-minus" class="size-3.5" aria-hidden="true" />
    Jamais exécutée
  </UBadge>
</template>
