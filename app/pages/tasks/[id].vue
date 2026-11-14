<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { BackupExecution } from '#shared/types/backup'
import type { TaskInput } from '#shared/schemas/task'

const route = useRoute()
const toast = useToast()
const id = Number(route.params.id)

const { data: task, error: taskError, refresh: refreshTask } = await useAsyncData(`task-${id}`, () => backupApi.getTask(id))
// Affiche la page d'erreur 404 plutôt qu'une page vide
if (taskError.value) throw createError({ statusCode: 404, statusMessage: 'Tâche introuvable', fatal: true })
const { data: executions, refresh: refreshExecutions } = await useAsyncData(
  `task-${id}-executions`, () => backupApi.listExecutions(id), { default: () => [] }
)

const showForm = ref(false)
const saving = ref(false)
const running = ref(false)

const columns: TableColumn<BackupExecution>[] = [
  { accessorKey: 'startedAt', header: 'Début' },
  { accessorKey: 'status', header: 'État' },
  { accessorKey: 'filesCopied', header: 'Fichiers archivés', meta: { class: { th: 'hidden sm:table-cell', td: 'hidden sm:table-cell' } } },
  { accessorKey: 'bytesCopied', header: 'Volume' },
  { id: 'open', header: '', meta: { class: { th: 'hidden sm:table-cell', td: 'hidden sm:table-cell' } } }
]

async function refreshAll() {
  await Promise.all([refreshTask(), refreshExecutions()])
}

async function runNow() {
  running.value = true
  try {
    await backupApi.runTask(id)
    await refreshAll()
    // Rafraîchit jusqu'à la fin de l'exécution (max ~30 s)
    for (let i = 0; i < 30 && executions.value[0]?.status === 'running'; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await refreshAll()
    }
  } catch (error: any) {
    toast.add({ title: 'Exécution impossible', description: error?.data?.statusMessage, color: 'error' })
  } finally {
    running.value = false
  }
}

async function save(input: TaskInput) {
  saving.value = true
  try {
    await backupApi.updateTask(id, input)
    showForm.value = false
    await refreshTask()
  } catch (error: any) {
    toast.add({ title: 'Modification impossible', description: error?.data?.statusMessage, color: 'error' })
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm('Supprimer cette tâche et son historique ?')) return
  await backupApi.deleteTask(id)
  await navigateTo('/')
}
</script>

<template>
  <div v-if="task">
    <PageHeader :title="task.name" back-to="/" back-label="Toutes les tâches">
      <template #badge>
        <UBadge v-if="!task.enabled" color="neutral" variant="outline" class="gap-1"><UIcon name="i-lucide-pause" class="size-3" aria-hidden="true" />Désactivée</UBadge>
      </template>
      <template #actions>
        <UButton icon="i-lucide-play" label="Lancer maintenant" :loading="running" @click="runNow" />
        <UButton icon="i-lucide-pencil" color="neutral" variant="outline" label="Modifier" @click="showForm = true" />
        <UButton icon="i-lucide-trash-2" color="error" variant="ghost" label="Supprimer" @click="remove" />
      </template>
    </PageHeader>

    <div class="space-y-6">
      <UCard :ui="{ root: 'shadow-xs' }">
        <dl class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <div class="min-w-0"><dt class="text-xs font-medium uppercase tracking-wide text-muted">Source</dt><dd class="mt-1 break-all font-mono text-sm">{{ task.sourcePath }}</dd></div>
          <div class="min-w-0"><dt class="text-xs font-medium uppercase tracking-wide text-muted">Destination</dt><dd class="mt-1 break-all font-mono text-sm">{{ task.destinationPath }}</dd></div>
          <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Planification</dt><dd class="mt-1 font-mono text-sm">{{ task.cron }}</dd></div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-muted">Prochaine exécution</dt>
            <dd class="mt-1 text-sm tabular-nums">{{ task.enabled ? formatDate(task.nextRunAt) : 'Désactivée' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-muted">Rétention</dt>
            <dd class="mt-1 flex flex-wrap gap-1.5">
              <UBadge v-for="label in formatRetention(task)" :key="label" color="neutral" variant="subtle" class="gap-1 tabular-nums">
                <UIcon name="i-lucide-recycle" class="size-3" aria-hidden="true" />{{ label }}
              </UBadge>
              <span v-if="!formatRetention(task).length" class="text-sm text-muted">Illimitée</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-muted">Exclusions</dt>
            <dd class="mt-1 flex flex-wrap gap-1.5">
              <UBadge v-for="p in task.exclusions" :key="p" color="neutral" variant="subtle" class="font-mono">{{ p }}</UBadge>
              <span v-if="!task.exclusions.length" class="text-sm text-muted">Aucune</span>
            </dd>
          </div>
        </dl>
      </UCard>

      <UCard :ui="{ root: 'overflow-hidden shadow-xs', header: 'px-4 py-3 sm:px-5', body: 'p-0 sm:p-0' }">
        <template #header><h2 class="text-sm font-semibold text-highlighted">Historique des exécutions</h2></template>
        <UTable
          :data="executions"
          :columns="columns"
          :ui="{ tr: 'cursor-pointer transition-colors hover:bg-elevated/50', th: 'px-3 text-xs font-medium uppercase tracking-wide text-muted sm:px-4', td: 'px-3 sm:px-4' }"
          @select="(_e: Event, row: { original: BackupExecution }) => navigateTo(`/executions/${row.original.id}`)"
        >
          <template #startedAt-cell="{ row }"><span class="tabular-nums">{{ formatDate(row.original.startedAt) }}</span></template>
          <template #status-cell="{ row }"><ExecutionStatusBadge :status="row.original.status" /></template>
          <template #filesCopied-cell="{ row }"><span class="tabular-nums">{{ row.original.filesCopied }}</span></template>
          <template #bytesCopied-cell="{ row }"><span class="tabular-nums">{{ formatBytes(row.original.bytesCopied) }}</span></template>
          <template #open-cell><UIcon name="i-lucide-chevron-right" class="size-4 text-muted" aria-hidden="true" /></template>
          <template #empty>
            <UEmpty icon="i-lucide-history" title="Aucune exécution" description="Lancez la tâche pour créer la première archive." variant="naked" />
          </template>
        </UTable>
      </UCard>
    </div>

    <UModal v-model:open="showForm" title="Modifier la tâche" description="Source, destination, planification et rétention.">
      <template #body>
        <TaskForm :task="task" :loading="saving" @submit="save" @cancel="showForm = false" />
      </template>
    </UModal>
  </div>
</template>
