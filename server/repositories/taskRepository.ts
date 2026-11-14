import { eq } from 'drizzle-orm'
import type { BackupTask } from '#shared/types/backup'
import type { TaskInput } from '#shared/schemas/task'
import { getDb } from '../database/connection'
import { tasks } from '../database/schema'

type TaskRow = typeof tasks.$inferSelect

// Convertit une ligne SQL en objet métier
function toTask(row: TaskRow): BackupTask {
  return {
    id: row.id,
    name: row.name,
    sourcePath: row.sourcePath,
    destinationPath: row.destinationPath,
    cron: row.cron,
    exclusions: row.exclusions,
    enabled: row.enabled,
    retentionMaxFiles: row.retentionMaxFiles,
    retentionMaxBytes: row.retentionMaxBytes,
    createdAt: row.createdAt
  }
}

/** Accès aux données des tâches de backup */
export const taskRepository = {
  findAll(): BackupTask[] {
    return getDb().select().from(tasks).orderBy(tasks.name).all().map(toTask)
  },

  findById(id: number): BackupTask | null {
    const row = getDb().select().from(tasks).where(eq(tasks.id, id)).get()
    return row ? toTask(row) : null
  },

  create(input: TaskInput): BackupTask {
    const row = getDb().insert(tasks).values({ ...input, createdAt: new Date().toISOString() }).returning().get()
    return toTask(row)
  },

  update(id: number, input: TaskInput): BackupTask | null {
    const row = getDb().update(tasks).set(input).where(eq(tasks.id, id)).returning().get()
    return row ? toTask(row) : null
  },

  delete(id: number): boolean {
    return getDb().delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id }).all().length > 0
  }
}
