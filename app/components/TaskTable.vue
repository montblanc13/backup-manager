<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { BackupTaskSummary } from '#shared/types/backup'

defineProps<{ tasks: BackupTaskSummary[] }>()
const emit = defineEmits<{ select: [task: BackupTaskSummary] }>()

const columns: TableColumn<BackupTaskSummary>[] = [
  { accessorKey: 'name', header: 'Nom' },
  { accessorKey: 'nextRunAt', header: 'Prochaine exécution' },
  { id: 'lastStatus', header: 'Dernière exécution' }
]
</script>

<template>
  <UTable
    :data="tasks"
    :columns="columns"
    class="cursor-pointer"
    @select="(_e: Event, row: { original: BackupTaskSummary }) => emit('select', row.original)"
  >
    <template #name-cell="{ row }">
      <div class="font-medium">{{ row.original.name }}</div>
      <div class="font-mono text-xs text-muted">{{ row.original.cron }}</div>
    </template>
    <template #nextRunAt-cell="{ row }">
      <span v-if="row.original.enabled">{{ formatDate(row.original.nextRunAt) }}</span>
      <UBadge v-else color="neutral" variant="subtle">Désactivée</UBadge>
    </template>
    <template #lastStatus-cell="{ row }">
      <div class="flex items-center gap-2">
        <ExecutionStatusBadge :status="row.original.lastExecution?.status ?? null" />
        <span v-if="row.original.lastExecution" class="text-xs text-muted">
          {{ formatDate(row.original.lastExecution.startedAt) }}
        </span>
      </div>
    </template>
    <template #empty>
      <div class="py-6 text-center text-muted">Aucune tâche de backup</div>
    </template>
  </UTable>
</template>
