// Types partagés entre le client et le serveur

export type ExecutionStatus = 'running' | 'success' | 'failed'

export interface BackupTask {
  id: number
  name: string
  sourcePath: string
  destinationPath: string
  cron: string
  /** Patterns glob exclus de la sauvegarde */
  exclusions: string[]
  enabled: boolean
  /** Nombre maximal d'archives conservées dans la destination (null = illimité) */
  retentionMaxFiles: number | null
  /** Volume total maximal des archives conservées, en octets (null = illimité) */
  retentionMaxBytes: number | null
  createdAt: string
}

export interface BackupExecution {
  id: number
  taskId: number
  status: ExecutionStatus
  startedAt: string
  finishedAt: string | null
  filesCopied: number
  filesSkipped: number
  bytesCopied: number
  /** Chemin absolu de l'archive .tar.gz produite (null si échec avant création) */
  archivePath: string | null
  /** Taille compressée de l'archive en octets */
  archiveBytes: number | null
  error: string | null
  /** Archives anciennes supprimées par la politique de rétention après cette exécution */
  archivesPurged: number
  /** Octets libérés par cette purge */
  bytesPurged: number
  /** Avertissement si la purge a rencontré une erreur (le backup reste réussi) */
  retentionWarning: string | null
}

/** Fichier embarqué dans l'archive d'une exécution */
export interface ExecutionFile {
  /** Chemin relatif au dossier source */
  path: string
  size: number
}

/** Page de résultats */
export interface Page<T> {
  total: number
  items: T[]
}

/** Tâche enrichie pour l'affichage du tableau */
export interface BackupTaskSummary extends BackupTask {
  nextRunAt: string | null
  lastExecution: BackupExecution | null
}

/** Contenu d'un dossier du serveur, pour le sélecteur de dossier */
export interface DirectoryListing {
  /** Chemin absolu du dossier listé */
  path: string
  /** Dossier parent, null à la racine navigable */
  parent: string | null
  directories: { name: string, path: string }[]
}

/** Expression cron proposée par l'IA à partir d'une description */
export interface CronSuggestion {
  cron: string
  explanation: string
  /** Prochaines exécutions (ISO) pour vérification par l'utilisateur */
  nextRuns: string[]
}
