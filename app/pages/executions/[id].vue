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
  { accessorKey: 'size', header: 'Taille' }
]
</script>

<template>
  <UContainer v-if="execution" class="space-y-6 py-8">
    <div>
      <UButton :to="`/tasks/${execution.taskId}`" icon="i-lucide-arrow-left" variant="link" color="neutral" label="Retour à la tâche" class="-ml-2" />
      <h1 class="flex items-center gap-3 text-2xl font-bold">
        Exécution #{{ execution.id }}
        <ExecutionStatusBadge :status="execution.status" />
      </h1>
    </div>

    <UAlert v-if="execution.error" color="error" variant="subtle" icon="i-lucide-circle-alert" title="Erreur" :description="execution.error" />

    <UCard>
      <dl class="grid gap-4 sm:grid-cols-3">
        <div><dt class="text-sm text-muted">Fichiers archivés</dt><dd class="text-xl font-semibold">{{ execution.filesCopied }}</dd></div>
        <div><dt class="text-sm text-muted">Éléments exclus</dt><dd class="text-xl font-semibold">{{ execution.filesSkipped }}</dd></div>
        <div><dt class="text-sm text-muted">Volume des données</dt><dd class="text-xl font-semibold">{{ formatBytes(execution.bytesCopied) }}</dd></div>
        <div><dt class="text-sm text-muted">Début</dt><dd>{{ formatDate(execution.startedAt) }}</dd></div>
        <div><dt class="text-sm text-muted">Fin</dt><dd>{{ formatDate(execution.finishedAt) }}</dd></div>
        <div><dt class="text-sm text-muted">Durée</dt><dd>{{ formatDuration(execution.startedAt, execution.finishedAt) }}</dd></div>
        <div v-if="execution.archivePath" class="sm:col-span-3">
          <dt class="text-sm text-muted">Archive ({{ formatBytes(execution.archiveBytes ?? 0) }} compressée)</dt>
          <dd class="break-all font-mono text-sm">{{ execution.archivePath }}</dd>
        </div>
      </dl>
    </UCard>

    <UCard v-if="execution.status !== 'failed'">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-semibold">Fichiers embarqués ({{ files.total }})</h2>
          <UInput v-model="search" icon="i-lucide-search" placeholder="Filtrer par chemin…" class="w-64" />
        </div>
      </template>
      <UTable :data="files.items" :columns="columns" :loading="filesStatus === 'pending'">
        <template #path-cell="{ row }"><span class="break-all font-mono text-sm">{{ row.original.path }}</span></template>
        <template #size-cell="{ row }">{{ formatBytes(row.original.size) }}</template>
        <template #empty>
          <div class="py-6 text-center text-muted">
            {{ execution.status === 'running' ? 'Exécution en cours…' : 'Aucun fichier' }}
          </div>
        </template>
      </UTable>
      <div v-if="files.total > pageSize" class="flex justify-center border-t border-default pt-4">
        <UPagination v-model:page="page" :items-per-page="pageSize" :total="files.total" />
      </div>
    </UCard>
  </UContainer>
</template>
