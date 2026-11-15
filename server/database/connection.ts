import { DatabaseSync } from 'node:sqlite'
import { resolve } from 'node:path'
import { drizzle } from 'drizzle-orm/node-sqlite'
import { migrate } from 'drizzle-orm/node-sqlite/migrator'
import * as schema from './schema'

function createDb() {
  const config = useRuntimeConfig()
  // Crée ~/.config/backup-manager/{db,data} au besoin
  const client = new DatabaseSync(ensureAppPaths().dbFile)
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
