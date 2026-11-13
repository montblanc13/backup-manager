import { count, eq, and, sql } from 'drizzle-orm'
import type { ExecutionFile, Page } from '#shared/types/backup'
import { getDb } from '../database/connection'
import { executionFiles } from '../database/schema'

// Limite SQLite : 32766 variables par requête (3 colonnes par ligne)
const INSERT_CHUNK = 1000

/** Accès aux fichiers embarqués dans les archives */
export const executionFileRepository = {
  /** Insère un lot de fichiers dans une seule transaction */
  insertMany(executionId: number, files: ExecutionFile[]): void {
    if (!files.length) return
    getDb().transaction((tx) => {
      for (let i = 0; i < files.length; i += INSERT_CHUNK) {
        tx.insert(executionFiles)
          .values(files.slice(i, i + INSERT_CHUNK).map(f => ({ executionId, path: f.path, size: f.size })))
          .run()
      }
    })
  },

  deleteByExecution(executionId: number): void {
    getDb().delete(executionFiles).where(eq(executionFiles.executionId, executionId)).run()
  },

  /** Liste paginée, filtrable par fragment de chemin (insensible à la casse) */
  findPage(executionId: number, opts: { search?: string, offset: number, limit: number }): Page<ExecutionFile> {
    const db = getDb()
    const escaped = opts.search?.replace(/[\\%_]/g, m => `\\${m}`)
    const where = escaped
      ? and(eq(executionFiles.executionId, executionId), sql`${executionFiles.path} LIKE ${`%${escaped}%`} ESCAPE '\\'`)
      : eq(executionFiles.executionId, executionId)

    const total = db.select({ value: count() }).from(executionFiles).where(where).get()?.value ?? 0
    const items = db.select({ path: executionFiles.path, size: executionFiles.size })
      .from(executionFiles).where(where)
      .orderBy(executionFiles.path)
      .limit(opts.limit).offset(opts.offset)
      .all()
    return { total, items }
  }
}
