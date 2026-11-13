import { Cron } from 'croner'
import type { BackupTask } from '#shared/types/backup'

type RunTask = (taskId: number) => Promise<unknown>

/** Planifie les tâches de backup selon leur expression cron */
class Scheduler {
  private jobs = new Map<number, Cron>()

  /** (Re)planifie une tâche ; la retire si elle est désactivée */
  schedule(task: BackupTask, run: RunTask): void {
    this.unschedule(task.id)
    if (!task.enabled) return
    this.jobs.set(task.id, new Cron(task.cron, { protect: true }, () => {
      void run(task.id)
    }))
  }

  unschedule(taskId: number): void {
    this.jobs.get(taskId)?.stop()
    this.jobs.delete(taskId)
  }

  /** Date de la prochaine exécution (ISO) ou null si non planifiée */
  nextRun(taskId: number): string | null {
    return this.jobs.get(taskId)?.nextRun()?.toISOString() ?? null
  }
}

export const scheduler = new Scheduler()
