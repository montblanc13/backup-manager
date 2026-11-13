import type { BackupExecution, BackupTaskSummary, DirectoryListing, CronSuggestion, ExecutionFile, Page } from '#shared/types/backup'
import type { TaskInput } from '#shared/schemas/task'

/** Client HTTP de l'API de backup (couche d'accès aux données côté interface) */
export const backupApi = {
  listTasks: () => $fetch<BackupTaskSummary[]>('/api/tasks'),
  getTask: (id: number) => $fetch<BackupTaskSummary>(`/api/tasks/${id}`),
  createTask: (input: TaskInput) => $fetch<BackupTaskSummary>('/api/tasks', { method: 'POST', body: input }),
  updateTask: (id: number, input: TaskInput) =>
    $fetch<BackupTaskSummary>(`/api/tasks/${id}`, { method: 'PUT', body: input }),
  deleteTask: (id: number) => $fetch(`/api/tasks/${id}`, { method: 'DELETE' }),
  runTask: (id: number) => $fetch<BackupExecution>(`/api/tasks/${id}/run`, { method: 'POST' }),
  listExecutions: (taskId: number) => $fetch<BackupExecution[]>(`/api/tasks/${taskId}/executions`),
  listDirectories: (path?: string) =>
    $fetch<DirectoryListing>('/api/fs/directories', { query: { path } }),
  listExecutionFiles: (id: number, query: { search?: string, page: number, pageSize: number }) =>
    $fetch<Page<ExecutionFile>>(`/api/executions/${id}/files`, { query }),
  suggestCron: (description: string) =>
    $fetch<CronSuggestion>('/api/cron/suggest', { method: 'POST', body: { description } }),
  getExecution: (id: number) => $fetch<BackupExecution>(`/api/executions/${id}`)
}
