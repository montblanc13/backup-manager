import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { ExecutionStatus } from '#shared/types/backup'

/** Tâches de backup */
export const tasks = sqliteTable('tasks', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  sourcePath: text('source_path').notNull(),
  destinationPath: text('destination_path').notNull(),
  cron: text().notNull(),
  // Patterns glob exclus, stockés en JSON
  exclusions: text({ mode: 'json' }).$type<string[]>().notNull().default([]),
  enabled: integer({ mode: 'boolean' }).notNull().default(true),
  // Rétention des archives de la destination (null = illimité) ; volume en octets
  retentionMaxFiles: integer('retention_max_files'),
  retentionMaxBytes: integer('retention_max_bytes'),
  createdAt: text('created_at').notNull()
})

/** Historique des exécutions */
export const executions = sqliteTable('executions', {
  id: integer().primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  status: text().$type<ExecutionStatus>().notNull(),
  startedAt: text('started_at').notNull(),
  finishedAt: text('finished_at'),
  filesCopied: integer('files_copied').notNull().default(0),
  filesSkipped: integer('files_skipped').notNull().default(0),
  bytesCopied: integer('bytes_copied').notNull().default(0),
  // Archive .tar.gz produite (chemin absolu) et sa taille compressée
  archivePath: text('archive_path'),
  archiveBytes: integer('archive_bytes'),
  error: text(),
  // Résultat de la purge de rétention appliquée après un backup réussi
  archivesPurged: integer('archives_purged').notNull().default(0),
  bytesPurged: integer('bytes_purged').notNull().default(0),
  retentionWarning: text('retention_warning')
}, table => [index('idx_executions_task').on(table.taskId, table.startedAt)])

/** Fichiers effectivement embarqués dans l'archive d'une exécution */
export const executionFiles = sqliteTable('execution_files', {
  id: integer().primaryKey({ autoIncrement: true }),
  executionId: integer('execution_id').notNull().references(() => executions.id, { onDelete: 'cascade' }),
  // Chemin relatif au dossier source
  path: text().notNull(),
  size: integer().notNull()
}, table => [index('idx_execution_files_execution').on(table.executionId)])
