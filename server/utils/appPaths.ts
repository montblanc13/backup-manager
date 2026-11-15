import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

/** Nom du dossier de l'application sous `~/.config` */
const APP_DIR_NAME = 'backup-manager'

export interface AppPaths {
  /** Racine : `~/.config/backup-manager` (ou `NUXT_DATA_DIR`) */
  root: string
  /** Dossier de la base SQLite */
  dbDir: string
  /** Fichier de la base SQLite */
  dbFile: string
  /** Dossier des fichiers de l'application */
  dataDir: string
}

/**
 * Emplacements de stockage de l'application, relatifs au dossier personnel de l'utilisateur
 * (`os.homedir()` : fonctionne à l'identique sous Linux, macOS et Windows) :
 *   <HOME>/.config/backup-manager/db/backup-manager.db
 *   <HOME>/.config/backup-manager/data/
 * `NUXT_DATA_DIR` remplace la racine (nécessaire en Docker, où le HOME du conteneur n'est pas
 * celui de l'hôte).
 */
export function resolveAppPaths(configuredRoot = ''): AppPaths {
  const root = configuredRoot ? resolve(configuredRoot) : join(homedir(), '.config', APP_DIR_NAME)
  const dbDir = join(root, 'db')
  return { root, dbDir, dbFile: join(dbDir, `${APP_DIR_NAME}.db`), dataDir: join(root, 'data') }
}

/** Résout les emplacements depuis la config et crée les dossiers manquants */
export function ensureAppPaths(): AppPaths {
  const paths = resolveAppPaths(useRuntimeConfig().dataDir)
  mkdirSync(paths.dbDir, { recursive: true })
  mkdirSync(paths.dataDir, { recursive: true })
  return paths
}
