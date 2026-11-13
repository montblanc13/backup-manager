<script setup lang="ts">
import type { TaskInput } from '#shared/schemas/task'

const toast = useToast()
const { data: tasks, refresh } = await useAsyncData('tasks', () => backupApi.listTasks(), { default: () => [] })

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
  <UContainer class="py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="flex items-center gap-2 text-2xl font-bold">
        <UIcon name="i-lucide-hard-drive" />
        Backup Manager
      </h1>
      <UButton icon="i-lucide-plus" label="Nouvelle tâche" @click="showForm = true" />
    </div>

    <UCard>
      <TaskTable :tasks="tasks" @select="task => navigateTo(`/tasks/${task.id}`)" />
    </UCard>

    <UModal v-model:open="showForm" title="Nouvelle tâche de backup">
      <template #body>
        <TaskForm :loading="saving" @submit="createTask" @cancel="showForm = false" />
      </template>
    </UModal>
  </UContainer>
</template>
