import { promises as fs } from 'node:fs'
import { join, resolve } from 'node:path'
import type { BackupTask } from '#shared/types/backup'
import { taskSlug } from './backupRunner'

/** Archive présente dans la destination et produite par la tâche */
export interface ArchiveEntry {
  name: string
  size: number
  /** Date de modification (ms), utilisée en repli pour départager deux horodatages identiques */
  mtimeMs: number
}

export interface RetentionPolicy {
  maxFiles: number | null
  maxBytes: number | null
}

export interface RetentionOutcome {
  archivesPurged: number
  bytesPurged: number
  warning: string | null
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Motif strict des archives d'une tâche : <slug>-AAAAMMJJ-HHMMSS.tar.gz.
 * Le tiret + 8 chiffres + tiret + 6 chiffres + extension évitent toute confusion
 * entre deux tâches dont les slugs se préfixent (« docs » / « docs-perso »).
 * Les fichiers .partial ne correspondent pas.
 */
export function archivePattern(taskName: string): RegExp {
  return new RegExp(`^${escapeRegExp(taskSlug(taskName))}-(\\d{8}-\\d{6})\\.tar\\.gz$`)
}

/**
 * Fonction pure : désigne les archives à supprimer, les plus anciennes d'abord.
 * - sans limite : rien n'est supprimé ;
 * - les deux limites s'appliquent ensemble (on purge tant que l'une est dépassée) ;
 * - l'archive `protectedName` (celle qui vient d'être créée) n'est jamais supprimée,
 *   même si elle dépasse seule la limite de volume.
 * Tri : horodatage du nom, puis date de modification, puis nom.
 */
export function selectArchivesToDelete(
  archives: ArchiveEntry[],
  policy: RetentionPolicy,
  protectedName: string | null,
  pattern: RegExp
): ArchiveEntry[] {
  if (policy.maxFiles === null && policy.maxBytes === null) return []
  const stamp = (a: ArchiveEntry) => pattern.exec(a.name)?.[1] ?? ''
  const sorted = archives
    .filter(a => pattern.test(a.name))
    .sort((a, b) => stamp(a).localeCompare(stamp(b)) || a.mtimeMs - b.mtimeMs || a.name.localeCompare(b.name))

  let count = sorted.length
  let total = sorted.reduce((sum, a) => sum + a.size, 0)
  const toDelete: ArchiveEntry[] = []
  for (const archive of sorted) {
    const overFiles = policy.maxFiles !== null && count > policy.maxFiles
    const overBytes = policy.maxBytes !== null && total > policy.maxBytes
    if (!overFiles && !overBytes) break
    if (archive.name === protectedName) continue
    toDelete.push(archive)
    count--
    total -= archive.size
  }
  return toDelete
}

/** Liste les fichiers réguliers de la destination correspondant au motif (liens et dossiers ignorés) */
async function listArchives(destination: string, pattern: RegExp): Promise<ArchiveEntry[]> {
  // realpath : un lien symbolique pour la destination elle-même est suivi
  const dir = await fs.realpath(destination)
  const entries: ArchiveEntry[] = []
  for (const name of await fs.readdir(dir)) {
    if (!pattern.test(name)) continue
    // lstat : un lien symbolique (même nommé comme une archive) n'est jamais supprimé
    const stat = await fs.lstat(join(dir, name)).catch(() => null)
    if (stat?.isFile()) entries.push({ name, size: stat.size, mtimeMs: stat.mtimeMs })
  }
  return entries
}

/**
 * Applique la rétention de la tâche après un backup réussi. Ne lève jamais d'erreur :
 * tout problème est renvoyé sous forme d'avertissement pour ne pas faire échouer le backup.
 */
export async function applyRetention(task: BackupTask, createdArchivePath: string): Promise<RetentionOutcome> {
  const outcome: RetentionOutcome = { archivesPurged: 0, bytesPurged: 0, warning: null }
  const policy = { maxFiles: task.retentionMaxFiles, maxBytes: task.retentionMaxBytes }
  if (policy.maxFiles === null && policy.maxBytes === null) return outcome

  try {
    const pattern = archivePattern(task.name)
    const dir = await fs.realpath(resolve(task.destinationPath))
    const createdName = createdArchivePath.split(/[\\/]/).pop()!
    const archives = await listArchives(dir, pattern)
    const failures: string[] = []
    for (const archive of selectArchivesToDelete(archives, policy, createdName, pattern)) {
      try {
        await fs.unlink(join(dir, archive.name))
        outcome.archivesPurged++
        outcome.bytesPurged += archive.size
      } catch (error: any) {
        if (error?.code === 'ENOENT') continue
        failures.push(`${archive.name} (${error?.message ?? error})`)
      }
    }
    if (failures.length) outcome.warning = `Purge incomplète, ${failures.length} archive(s) non supprimée(s) : ${failures.join(' ; ')}`
  } catch (error: any) {
    outcome.warning = `Purge impossible : ${error?.message ?? error}`
  }
  return outcome
}
