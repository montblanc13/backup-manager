<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { BackupTaskSummary } from '#shared/types/backup'

defineProps<{ tasks: BackupTaskSummary[] }>()
const emit = defineEmits<{ select: [task: BackupTaskSummary], create: [] }>()

const columns: TableColumn<BackupTaskSummary>[] = [
  { accessorKey: 'name', header: 'Nom' },
  { accessorKey: 'nextRunAt', header: 'Prochaine exécution', meta: { class: { th: 'hidden sm:table-cell', td: 'hidden sm:table-cell' } } },
  { id: 'lastStatus', header: 'Dernière exécution' },
  { id: 'open', header: '', meta: { class: { th: 'hidden sm:table-cell', td: 'hidden sm:table-cell' } } }
]
</script>

<template>
  <UEmpty
    v-if="!tasks.length"
    icon="i-lucide-archive"
    title="Aucune tâche de backup"
    description="Créez votre première tâche pour archiver un dossier automatiquement."
    :actions="[{ label: 'Nouvelle tâche', icon: 'i-lucide-plus', onClick: () => emit('create') }]"
    class="py-12"
  />
  <UTable
    v-else
    :data="tasks"
    :columns="columns"
    :ui="{ tr: 'cursor-pointer transition-colors hover:bg-elevated/50', th: 'px-3 text-xs font-medium uppercase tracking-wide text-muted sm:px-4', td: 'whitespace-normal px-3 py-3 sm:px-4' }"
    @select="(_e: Event, row: { original: BackupTaskSummary }) => emit('select', row.original)"
  >
    <template #name-cell="{ row }">
      <NuxtLink :to="`/tasks/${row.original.id}`" class="font-medium text-highlighted hover:underline focus-visible:outline-2 focus-visible:outline-primary" @click.stop>
        {{ row.original.name }}
      </NuxtLink>
      <div class="mt-0.5 font-mono text-xs text-muted">{{ row.original.cron }}</div>
      <!-- Sur mobile, la colonne « Prochaine exécution » est masquée : on la reprend ici -->
      <div class="mt-1 text-xs text-muted sm:hidden">
        {{ row.original.enabled ? `Prochaine : ${formatDate(row.original.nextRunAt)}` : 'Désactivée' }}
      </div>
    </template>
    <template #nextRunAt-cell="{ row }">
      <span v-if="row.original.enabled" class="tabular-nums">{{ formatDate(row.original.nextRunAt) }}</span>
      <UBadge v-else color="neutral" variant="outline" class="gap-1"><UIcon name="i-lucide-pause" class="size-3" aria-hidden="true" />Désactivée</UBadge>
    </template>
    <template #lastStatus-cell="{ row }">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <ExecutionStatusBadge :status="row.original.lastExecution?.status ?? null" />
        <span v-if="row.original.lastExecution" class="text-xs tabular-nums text-muted">
          {{ formatDate(row.original.lastExecution.startedAt) }}
        </span>
      </div>
    </template>
    <template #open-cell>
      <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" aria-hidden="true" />
    </template>
  </UTable>
</template>
