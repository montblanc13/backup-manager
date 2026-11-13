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
  { accessorKey: 'filesCopied', header: 'Fichiers archivés' },
  { accessorKey: 'bytesCopied', header: 'Volume' }
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
  <UContainer v-if="task" class="space-y-6 py-8">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <UButton to="/" icon="i-lucide-arrow-left" variant="link" color="neutral" label="Retour" class="-ml-2" />
        <h1 class="text-2xl font-bold">{{ task.name }}</h1>
      </div>
      <div class="flex gap-2">
        <UButton icon="i-lucide-play" label="Lancer maintenant" :loading="running" @click="runNow" />
        <UButton icon="i-lucide-pencil" color="neutral" variant="outline" label="Modifier" @click="showForm = true" />
        <UButton icon="i-lucide-trash-2" color="error" variant="outline" label="Supprimer" @click="remove" />
      </div>
    </div>

    <UCard>
      <dl class="grid gap-3 sm:grid-cols-2">
        <div><dt class="text-sm text-muted">Source</dt><dd class="font-mono">{{ task.sourcePath }}</dd></div>
        <div><dt class="text-sm text-muted">Destination</dt><dd class="font-mono">{{ task.destinationPath }}</dd></div>
        <div><dt class="text-sm text-muted">Cron</dt><dd class="font-mono">{{ task.cron }}</dd></div>
        <div>
          <dt class="text-sm text-muted">Prochaine exécution</dt>
          <dd>{{ task.enabled ? formatDate(task.nextRunAt) : 'Désactivée' }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-sm text-muted">Exclusions</dt>
          <dd class="flex flex-wrap gap-1">
            <UBadge v-for="p in task.exclusions" :key="p" color="neutral" variant="subtle" class="font-mono">{{ p }}</UBadge>
            <span v-if="!task.exclusions.length">Aucune</span>
          </dd>
        </div>
      </dl>
    </UCard>

    <UCard>
      <template #header><h2 class="font-semibold">Historique des exécutions</h2></template>
      <UTable
        :data="executions"
        :columns="columns"
        class="cursor-pointer"
        @select="(_e: Event, row: { original: BackupExecution }) => navigateTo(`/executions/${row.original.id}`)"
      >
        <template #startedAt-cell="{ row }">{{ formatDate(row.original.startedAt) }}</template>
        <template #status-cell="{ row }"><ExecutionStatusBadge :status="row.original.status" /></template>
        <template #bytesCopied-cell="{ row }">{{ formatBytes(row.original.bytesCopied) }}</template>
        <template #empty><div class="py-6 text-center text-muted">Aucune exécution</div></template>
      </UTable>
    </UCard>

    <UModal v-model:open="showForm" title="Modifier la tâche">
      <template #body>
        <TaskForm :task="task" :loading="saving" @submit="save" @cancel="showForm = false" />
      </template>
    </UModal>
  </UContainer>
</template>
