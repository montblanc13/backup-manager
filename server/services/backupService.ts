import type { BackupExecution } from '#shared/types/backup'
import { executionFileRepository } from '../repositories/executionFileRepository'
import { executionRepository } from '../repositories/executionRepository'
import { taskRepository } from '../repositories/taskRepository'
import { runBackup } from './backupRunner'

// Tâches en cours : empêche deux exécutions simultanées d'une même tâche
const running = new Set<number>()

export class TaskNotFoundError extends Error {}
export class TaskAlreadyRunningError extends Error {}

/** Verrouille la tâche et crée l'exécution (synchrone, avant tout travail asynchrone) */
function begin(taskId: number) {
  const task = taskRepository.findById(taskId)
  if (!task) throw new TaskNotFoundError(`Tâche ${taskId} introuvable`)
  if (running.has(taskId)) throw new TaskAlreadyRunningError('Une exécution est déjà en cours')
  running.add(taskId)
  return { task, execution: executionRepository.start(taskId) }
}

/** Exécute le backup et enregistre résultat et fichiers embarqués */
async function perform(taskId: number, task: NonNullable<ReturnType<typeof taskRepository.findById>>, executionId: number, startedAt: Date) {
  try {
    const result = await runBackup(task, {
      startedAt,
      onFiles: files => executionFileRepository.insertMany(executionId, files)
    })
    // Pas d'archive : on ne garde pas la liste de fichiers d'une exécution échouée
    if (result.status === 'failed') executionFileRepository.deleteByExecution(executionId)
    executionRepository.finish(executionId, result)
  } finally {
    running.delete(taskId)
  }
}

/** Lance une exécution et attend sa fin (utilisé par le planificateur) */
export async function executeTask(taskId: number): Promise<BackupExecution> {
  const { task, execution } = begin(taskId)
  await perform(taskId, task, execution.id, new Date(execution.startedAt))
  return executionRepository.findById(execution.id)!
}

/** Lance l'exécution sans attendre sa fin (déclenchement manuel) ; retourne l'exécution en cours */
export function startTaskInBackground(taskId: number): BackupExecution {
  const { task, execution } = begin(taskId)
  void perform(taskId, task, execution.id, new Date(execution.startedAt)).catch(() => {})
  return execution
}
