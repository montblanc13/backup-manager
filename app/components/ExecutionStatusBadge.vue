<script setup lang="ts">
import type { ExecutionStatus } from '#shared/types/backup'

defineProps<{ status: ExecutionStatus | null }>()
</script>

<template>
  <!-- Badge d'état d'une exécution (ou "Jamais exécutée") -->
  <UBadge v-if="status" :color="statusColors[status]" variant="subtle">
    {{ statusLabels[status] }}
  </UBadge>
  <UBadge v-else color="neutral" variant="subtle">Jamais exécutée</UBadge>
</template>
