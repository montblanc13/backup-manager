<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { ExecutionFile } from '#shared/types/backup'

const id = Number(useRoute().params.id)
const { data: execution, error } = await useAsyncData(`execution-${id}`, () => backupApi.getExecution(id))
// Affiche la page d'erreur 404 plutôt qu'une page vide
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Exécution introuvable', fatal: true })

// --- Fichiers embarqués dans l'archive (pagination et recherche côté serveur) ---
const pageSize = 50
const page = ref(1)
const search = ref('')
const debouncedSearch = useDebouncedRef(search, 300)

const { data: files, status: filesStatus } = await useAsyncData(
  `execution-${id}-files`,
  () => backupApi.listExecutionFiles(id, { search: debouncedSearch.value || undefined, page: page.value, pageSize }),
  { watch: [page, debouncedSearch], default: () => ({ total: 0, items: [] as ExecutionFile[] }) }
)

// Une nouvelle recherche revient à la première page
watch(debouncedSearch, () => { page.value = 1 })

const columns: TableColumn<ExecutionFile>[] = [
  { accessorKey: 'path', header: 'Fichier' },
  { accessorKey: 'size', header: 'Taille', meta: { class: { th: 'text-right', td: 'text-right' } } }
]

// Chiffres clés affichés en tuiles
const stats = computed(() => execution.value
  ? [
      { label: 'Fichiers archivés', value: execution.value.filesCopied },
      { label: 'Éléments exclus', value: execution.value.filesSkipped },
      { label: 'Volume des données', value: formatBytes(execution.value.bytesCopied) }
    ]
  : [])
</script>

<template>
  <div v-if="execution">
    <PageHeader :title="`Exécution #${execution.id}`" :back-to="`/tasks/${execution.taskId}`" back-label="Retour à la tâche">
      <template #badge><ExecutionStatusBadge :status="execution.status" /></template>
    </PageHeader>

    <div class="space-y-6">
      <UAlert v-if="execution.error" color="error" variant="subtle" icon="i-lucide-circle-alert" title="Erreur" :description="execution.error" />
      <UAlert v-if="execution.retentionWarning" color="warning" variant="subtle" icon="i-lucide-triangle-alert" title="Rétention : avertissement" :description="execution.retentionWarning" />

      <section class="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Résumé">
        <UCard v-for="stat in stats" :key="stat.label" :ui="{ root: 'shadow-xs', body: 'p-3 sm:p-4' }">
          <div class="text-[0.65rem] font-medium uppercase leading-tight tracking-wide text-muted sm:text-xs">{{ stat.label }}</div>
          <div class="mt-1 text-xl sm:text-2xl font-semibold tabular-nums text-highlighted">{{ stat.value }}</div>
        </UCard>
      </section>

      <UCard :ui="{ root: 'shadow-xs' }">
        <dl class="grid gap-x-6 gap-y-4 sm:grid-cols-3">
          <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Début</dt><dd class="mt-1 text-sm tabular-nums">{{ formatDate(execution.startedAt) }}</dd></div>
          <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Fin</dt><dd class="mt-1 text-sm tabular-nums">{{ formatDate(execution.finishedAt) }}</dd></div>
          <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Durée</dt><dd class="mt-1 text-sm tabular-nums">{{ formatDuration(execution.startedAt, execution.finishedAt) }}</dd></div>
          <div v-if="execution.archivePath" class="sm:col-span-3">
            <dt class="text-xs font-medium uppercase tracking-wide text-muted">Archive ({{ formatBytes(execution.archiveBytes ?? 0) }} compressée)</dt>
            <dd class="mt-1 break-all rounded-md bg-elevated px-2.5 py-1.5 font-mono text-xs">{{ execution.archivePath }}</dd>
          </div>
          <div v-if="execution.archivesPurged > 0" class="sm:col-span-3">
            <dt class="text-xs font-medium uppercase tracking-wide text-muted">Rétention</dt>
            <dd class="mt-1 flex items-center gap-2 text-sm">
              <UIcon name="i-lucide-trash-2" class="size-4 shrink-0 text-muted" aria-hidden="true" />
              {{ execution.archivesPurged }} ancienne(s) archive(s) supprimée(s), {{ formatBytes(execution.bytesPurged) }} libérés
            </dd>
          </div>
        </dl>
      </UCard>

      <UCard v-if="execution.status !== 'failed'" :ui="{ root: 'overflow-hidden shadow-xs', header: 'px-4 py-3 sm:px-5', body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-sm font-semibold text-highlighted">Fichiers embarqués <span class="font-normal tabular-nums text-muted">({{ files.total }})</span></h2>
            <UInput v-model="search" icon="i-lucide-search" placeholder="Filtrer par chemin…" aria-label="Filtrer les fichiers par chemin" size="sm" class="w-full sm:w-64" />
          </div>
        </template>
        <UTable :data="files.items" :columns="columns" :loading="filesStatus === 'pending'" :ui="{ th: 'text-xs font-medium uppercase tracking-wide text-muted', td: 'py-2' }">
          <template #path-cell="{ row }"><span class="break-all font-mono text-xs">{{ row.original.path }}</span></template>
          <template #size-cell="{ row }"><span class="tabular-nums">{{ formatBytes(row.original.size) }}</span></template>
          <template #empty>
            <UEmpty
              :icon="execution.status === 'running' ? 'i-lucide-loader-circle' : 'i-lucide-file-x'"
              :loading="execution.status === 'running'"
              :title="execution.status === 'running' ? 'Exécution en cours…' : 'Aucun fichier'"
              variant="naked"
            />
          </template>
        </UTable>
        <div v-if="files.total > pageSize" class="flex justify-center border-t border-default p-3">
          <UPagination v-model:page="page" :items-per-page="pageSize" :total="files.total" />
        </div>
      </UCard>
    </div>
  </div>
</template>
