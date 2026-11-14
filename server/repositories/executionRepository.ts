import { desc, eq } from 'drizzle-orm'
import type { BackupExecution, ExecutionStatus } from '#shared/types/backup'
import { getDb } from '../database/connection'
import { executions } from '../database/schema'

type ExecutionRow = typeof executions.$inferSelect

export interface ExecutionResult {
  status: ExecutionStatus
  filesCopied: number
  filesSkipped: number
  bytesCopied: number
  archivePath: string | null
  archiveBytes: number | null
  error: string | null
  archivesPurged: number
  bytesPurged: number
  retentionWarning: string | null
}

// Les colonnes ont déjà les mêmes noms que le modèle métier
function toExecution(row: ExecutionRow): BackupExecution {
  return { ...row }
}

/** Accès aux données de l'historique des exécutions */
export const executionRepository = {
  start(taskId: number): BackupExecution {
    const row = getDb().insert(executions)
      .values({ taskId, status: 'running', startedAt: new Date().toISOString() })
      .returning().get()
    return toExecution(row)
  },

  finish(id: number, result: ExecutionResult): void {
    getDb().update(executions)
      .set({ ...result, finishedAt: new Date().toISOString() })
      .where(eq(executions.id, id))
      .run()
  },

  findById(id: number): BackupExecution | null {
    const row = getDb().select().from(executions).where(eq(executions.id, id)).get()
    return row ? toExecution(row) : null
  },

  findByTask(taskId: number, limit = 50): BackupExecution[] {
    return getDb().select().from(executions)
      .where(eq(executions.taskId, taskId))
      .orderBy(desc(executions.startedAt), desc(executions.id))
      .limit(limit)
      .all()
      .map(toExecution)
  },

  findLastByTask(taskId: number): BackupExecution | null {
    return this.findByTask(taskId, 1)[0] ?? null
  },

  /** Marque comme échouées les exécutions restées "running" (arrêt brutal du serveur) */
  failInterrupted(): void {
    getDb().update(executions)
      .set({ status: 'failed', finishedAt: new Date().toISOString(), error: 'Interrompu (arrêt du serveur)' })
      .where(eq(executions.status, 'running'))
      .run()
  }
}
