import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { drizzle } from 'drizzle-orm/node-sqlite'
import { migrate } from 'drizzle-orm/node-sqlite/migrator'
import * as schema from './schema'

function createDb() {
  const config = useRuntimeConfig()
  const path = resolve(config.dbPath)
  mkdirSync(dirname(path), { recursive: true })

  const client = new DatabaseSync(path)
  client.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')

  const db = drizzle({ client, schema })
  // Applique les migrations Drizzle en attente
  migrate(db, { migrationsFolder: resolve(config.migrationsFolder) })
  return db
}

export type Database = ReturnType<typeof createDb>

let db: Database | null = null

/** Retourne la connexion Drizzle unique (créée et migrée au premier appel) */
export function getDb(): Database {
  return db ??= createDb()
}
