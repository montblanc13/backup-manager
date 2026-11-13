<script setup lang="ts">
import type { DirectoryListing } from '#shared/types/backup'

const props = defineProps<{ title: string }>()
// Chemin sélectionné (v-model) et état d'ouverture de la fenêtre
const model = defineModel<string>({ default: '' })
const open = defineModel<boolean>('open', { default: false })

const listing = ref<DirectoryListing | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showHidden = ref(false)

// Sous-dossiers affichés (les dossiers cachés sont masqués par défaut)
const visibleDirectories = computed(() =>
  (listing.value?.directories ?? []).filter(d => showHidden.value || !d.name.startsWith('.'))
)

// Segments cliquables du chemin courant, ex. / > home > user
const breadcrumb = computed(() => {
  const parts = (listing.value?.path ?? '').split('/').filter(Boolean)
  return [
    { label: '/', path: '/' },
    ...parts.map((label, i) => ({ label, path: '/' + parts.slice(0, i + 1).join('/') }))
  ]
})

async function load(path?: string) {
  loading.value = true
  error.value = null
  try {
    listing.value = await backupApi.listDirectories(path)
  } catch (e: any) {
    error.value = e?.data?.statusMessage ?? 'Impossible de lister le dossier'
    // Repli sur la racine si le chemin de départ est invalide
    if (path && !listing.value) await load()
  } finally {
    loading.value = false
  }
}

// À l'ouverture : démarre depuis le chemin déjà saisi, sinon depuis la racine
watch(open, (isOpen) => {
  if (isOpen) load(model.value.trim() || undefined)
})

function choose() {
  if (!listing.value) return
  model.value = listing.value.path
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="props.title" description="Dossiers du serveur">
    <template #body>
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-arrow-up"
            color="neutral"
            variant="outline"
            aria-label="Dossier parent"
            :disabled="!listing?.parent"
            @click="load(listing!.parent!)"
          />
          <nav class="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 rounded bg-elevated px-2 py-1 text-sm" aria-label="Chemin">
            <template v-for="(part, i) in breadcrumb" :key="part.path">
              <UIcon v-if="i > 1" name="i-lucide-chevron-right" class="size-3 text-muted" />
              <button type="button" class="font-mono hover:underline" @click="load(part.path)">{{ part.label }}</button>
            </template>
          </nav>
        </div>

        <UAlert v-if="error" color="error" variant="subtle" :title="error" />

        <div class="max-h-72 overflow-y-auto rounded border border-default">
          <div v-if="loading" class="p-4 text-center text-muted">Chargement…</div>
          <ul v-else-if="visibleDirectories.length" class="divide-y divide-default">
            <li v-for="dir in visibleDirectories" :key="dir.path">
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-elevated"
                @click="load(dir.path)"
              >
                <UIcon name="i-lucide-folder" class="shrink-0" />
                <span class="flex-1 truncate">{{ dir.name }}</span>
                <UIcon name="i-lucide-chevron-right" class="shrink-0 text-muted" />
              </button>
            </li>
          </ul>
          <div v-else class="p-4 text-center text-muted">Aucun sous-dossier</div>
        </div>

        <div class="flex items-center justify-between gap-2">
          <UCheckbox v-model="showHidden" label="Afficher les dossiers cachés" />
          <div class="flex gap-2">
          <UButton color="neutral" variant="ghost" label="Annuler" @click="open = false" />
          <UButton icon="i-lucide-check" label="Choisir ce dossier" :disabled="!listing" @click="choose" />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
