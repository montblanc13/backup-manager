<script setup lang="ts">
import type { BackupTask, CronSuggestion } from '#shared/types/backup'
import { taskInputSchema, type TaskInput } from '#shared/schemas/task'

const props = defineProps<{ task?: BackupTask, loading?: boolean }>()
const emit = defineEmits<{ submit: [input: TaskInput], cancel: [] }>()

const state = reactive({
  name: props.task?.name ?? '',
  sourcePath: props.task?.sourcePath ?? '',
  destinationPath: props.task?.destinationPath ?? '',
  cron: props.task?.cron ?? '0 3 * * *',
  // Une exclusion par ligne dans le champ texte
  exclusionsText: props.task?.exclusions.join('\n') ?? '',
  enabled: props.task?.enabled ?? true
})

// Convertit l'état du formulaire en entrée validée par le schéma partagé
// Quel sélecteur de dossier est ouvert (aucun, source ou destination)
const pickerOpen = reactive({ source: false, destination: false })

// --- Suggestion de cron par IA à partir d'une description en langage naturel ---
const aiDescription = ref('')
const aiLoading = ref(false)
const aiError = ref<string | null>(null)
const suggestion = ref<CronSuggestion | null>(null)
// Évite de relancer l'IA si le texte n'a pas changé entre deux sorties de champ
let lastDescribed = ''

async function suggestFromDescription() {
  const description = aiDescription.value.trim()
  if (description.length < 3 || description === lastDescribed) return
  lastDescribed = description
  aiLoading.value = true
  aiError.value = null
  suggestion.value = null
  try {
    suggestion.value = await backupApi.suggestCron(description)
  } catch (error: any) {
    aiError.value = error?.data?.statusMessage ?? 'Suggestion impossible'
    lastDescribed = ''
  } finally {
    aiLoading.value = false
  }
}

function applySuggestion() {
  if (!suggestion.value) return
  state.cron = suggestion.value.cron
  suggestion.value = null
}

const parsed = computed(() => ({
  ...state,
  exclusions: state.exclusionsText.split('\n').map(l => l.trim()).filter(Boolean)
}))

function onSubmit() {
  emit('submit', taskInputSchema.parse(parsed.value))
}
</script>

<template>
  <UForm :schema="taskInputSchema" :state="parsed" class="space-y-4" @submit="onSubmit">
    <UFormField label="Nom" name="name" required>
      <UInput v-model="state.name" class="w-full" />
    </UFormField>
    <UFormField label="Dossier source" name="sourcePath" required>
      <div class="flex gap-2">
        <UInput v-model="state.sourcePath" placeholder="/data/documents" class="w-full" />
        <UButton icon="i-lucide-folder-open" color="neutral" variant="outline" aria-label="Parcourir la source" @click="pickerOpen.source = true" />
      </div>
    </UFormField>
    <UFormField label="Destination" name="destinationPath" required>
      <div class="flex gap-2">
        <UInput v-model="state.destinationPath" placeholder="/backups/documents" class="w-full" />
        <UButton icon="i-lucide-folder-open" color="neutral" variant="outline" aria-label="Parcourir la destination" @click="pickerOpen.destination = true" />
      </div>
    </UFormField>
    <UFormField label="Planification (cron)" name="cron" help="Ex. « 0 3 * * * » = tous les jours à 03:00" required>
      <UInput v-model="state.cron" class="w-full font-mono" />
    </UFormField>
    <!-- Description en langage naturel -> proposition de cron par IA (à la sortie du champ) -->
    <div class="space-y-2">
      <UInput
        v-model="aiDescription"
        icon="i-lucide-sparkles"
        :loading="aiLoading"
        size="sm"
        class="w-full"
        placeholder="Décrire la programmation, ex. « chaque nuit à 2h, du lundi au vendredi »"
        aria-label="Décrire la programmation en langage naturel"
        @blur="suggestFromDescription"
      />
      <UAlert v-if="aiError" color="warning" variant="subtle" icon="i-lucide-circle-alert" :title="aiError" />
      <UCard v-if="suggestion" variant="subtle" :ui="{ body: 'p-3 sm:p-3 space-y-2' }">
        <div class="flex items-center justify-between gap-2">
          <code class="font-mono font-semibold">{{ suggestion.cron }}</code>
          <div class="flex gap-2">
            <UButton size="xs" color="neutral" variant="ghost" label="Ignorer" @click="suggestion = null" />
            <UButton size="xs" icon="i-lucide-check" label="Utiliser" @click="applySuggestion" />
          </div>
        </div>
        <p class="text-sm">{{ suggestion.explanation }}</p>
        <p class="text-xs text-muted">
          Prochaines exécutions : {{ suggestion.nextRuns.map(d => formatDate(d)).join(' · ') }}
        </p>
      </UCard>
    </div>
    <UFormField label="Exclusions" name="exclusions" help="Un pattern glob par ligne (ex. *.log, node_modules)">
      <UTextarea v-model="state.exclusionsText" :rows="3" class="w-full font-mono" />
    </UFormField>
    <USwitch v-model="state.enabled" label="Tâche active" />
    <div class="flex justify-end gap-2">
      <UButton color="neutral" variant="ghost" label="Annuler" @click="emit('cancel')" />
      <UButton type="submit" :loading="loading" label="Enregistrer" />
    </div>
  </UForm>
  <FolderPicker v-model="state.sourcePath" v-model:open="pickerOpen.source" title="Choisir le dossier source" />
  <FolderPicker v-model="state.destinationPath" v-model:open="pickerOpen.destination" title="Choisir la destination" />
</template>
