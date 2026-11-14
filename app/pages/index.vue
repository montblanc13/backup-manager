<script setup lang="ts">
import type { TaskInput } from '#shared/schemas/task'

const toast = useToast()
const { data: tasks, refresh } = await useAsyncData('tasks', () => backupApi.listTasks(), { default: () => [] })

// Suivi des exécutions : rafraîchit la liste toutes les 5 s
const { refreshing, intervalMs } = useAutoRefresh(refresh, 5000)

const showForm = ref(false)
const saving = ref(false)

async function createTask(input: TaskInput) {
  saving.value = true
  try {
    await backupApi.createTask(input)
    showForm.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Création impossible', description: error?.data?.statusMessage, color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader title="Tâches de sauvegarde" description="Planifiez et suivez vos sauvegardes d'archives.">
      <template #actions>
        <RefreshIndicator :refreshing="refreshing" :interval-ms="intervalMs" class="mr-1" />
        <UButton icon="i-lucide-plus" label="Nouvelle tâche" @click="showForm = true" />
      </template>
    </PageHeader>

    <UCard :ui="{ root: 'overflow-hidden shadow-xs', body: 'p-0 sm:p-0' }">
      <TaskTable :tasks="tasks" @select="task => navigateTo(`/tasks/${task.id}`)" @create="showForm = true" />
    </UCard>

    <UModal v-model:open="showForm" title="Nouvelle tâche de backup" description="Source, destination, planification et rétention.">
      <template #body>
        <TaskForm :loading="saving" @submit="createTask" @cancel="showForm = false" />
      </template>
    </UModal>
  </div>
</template>
