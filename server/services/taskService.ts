import type { BackupTask, BackupTaskSummary } from '#shared/types/backup'
import type { TaskInput } from '#shared/schemas/task'
import { executionRepository } from '../repositories/executionRepository'
import { taskRepository } from '../repositories/taskRepository'
import { executeTask } from './backupService'
import { scheduler } from './scheduler'

function toSummary(task: BackupTask): BackupTaskSummary {
  return {
    ...task,
    nextRunAt: scheduler.nextRun(task.id),
    lastExecution: executionRepository.findLastByTask(task.id)
  }
}

/** Logique métier des tâches : persistance + planification */
export const taskService = {
  list(): BackupTaskSummary[] {
    return taskRepository.findAll().map(toSummary)
  },

  get(id: number): BackupTaskSummary | null {
    const task = taskRepository.findById(id)
    return task ? toSummary(task) : null
  },

  create(input: TaskInput): BackupTaskSummary {
    const task = taskRepository.create(input)
    scheduler.schedule(task, executeTask)
    return toSummary(task)
  },

  update(id: number, input: TaskInput): BackupTaskSummary | null {
    const task = taskRepository.update(id, input)
    if (!task) return null
    scheduler.schedule(task, executeTask)
    return toSummary(task)
  },

  delete(id: number): boolean {
    scheduler.unschedule(id)
    return taskRepository.delete(id)
  },

  /** Planifie toutes les tâches actives au démarrage du serveur */
  scheduleAll(): void {
    for (const task of taskRepository.findAll()) scheduler.schedule(task, executeTask)
  }
}
