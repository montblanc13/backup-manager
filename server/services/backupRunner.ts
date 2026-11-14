import { promises as fs } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { create } from 'tar'
import picomatch from 'picomatch'
import type { BackupTask, ExecutionFile } from '#shared/types/backup'
import type { ExecutionResult } from '../repositories/executionRepository'

// Nombre de fichiers accumulés avant d'être transmis pour enregistrement
const FLUSH_SIZE = 5000

export interface RunOptions {
  /** Date de l'exécution, utilisée pour horodater l'archive */
  startedAt: Date
  /** Reçoit par lots les fichiers effectivement embarqués dans l'archive */
  onFiles: (files: ExecutionFile[]) => void
}

/**
 * Explique l'échec d'accès à la destination quand elle (ou un dossier parent) est un lien
 * symbolique cassé. Cas typique en Docker : le lien pointe hors des dossiers montés dans le conteneur.
 */
async function brokenLinkHint(path: string): Promise<string | null> {
  for (let current = path; current !== dirname(current); current = dirname(current)) {
    const link = await fs.lstat(current).catch(() => null)
    if (link?.isSymbolicLink() && !(await fs.stat(current).catch(() => null))) {
      const target = await fs.readlink(current).catch(() => '?')
      return `Le lien symbolique ${current} pointe vers ${target}, introuvable. `
        + 'Si l\'application tourne dans Docker, montez ce dossier dans le conteneur au même chemin (voir compose.override.example.yaml).'
    }
  }
  return null
}

/** Vérifie que la destination n'est pas située dans la source (l'archive s'y inclurait) */
function assertNotNested(source: string, destination: string): void {
  const rel = relative(source, destination)
  if (rel === '' || (!rel.startsWith('..') && !rel.startsWith(sep))) {
    throw new Error('La destination ne doit pas se trouver dans le dossier source')
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Nom de tâche simplifié (minuscules, sans accents, tirets), préfixe des archives */
export function taskSlug(taskName: string): string {
  return taskName.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'backup'
}

/** Nom d'archive horodaté (heure locale du serveur), ex. documents-20261114-030000.tar.gz */
export function archiveFileName(taskName: string, date: Date): string {
  const slug = taskSlug(taskName)
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
    + `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  return `${slug}-${stamp}.tar.gz`
}

/**
 * Crée une archive .tar.gz horodatée du dossier source dans la destination.
 * L'archive est écrite sous un nom temporaire puis renommée en fin de succès,
 * pour ne jamais laisser une archive partielle sous son nom définitif.
 */
export async function runBackup(task: BackupTask, options: RunOptions): Promise<ExecutionResult> {
  const result: ExecutionResult = {
    status: 'failed', filesCopied: 0, filesSkipped: 0, bytesCopied: 0,
    archivePath: null, archiveBytes: null, error: null,
    archivesPurged: 0, bytesPurged: 0, retentionWarning: null
  }
  const source = resolve(task.sourcePath)
  const destination = resolve(task.destinationPath)
  const finalPath = join(destination, archiveFileName(task.name, options.startedAt))
  const partialPath = `${finalPath}.partial`

  try {
    const stat = await fs.stat(source).catch(() => null)
    if (!stat?.isDirectory()) throw new Error(`Dossier source introuvable : ${source}`)
    assertNotNested(source, destination)
    try {
      await fs.mkdir(destination, { recursive: true })
    } catch (error) {
      throw new Error(await brokenLinkHint(destination) ?? (error instanceof Error ? error.message : String(error)))
    }
    // Refuse d'écraser une archive existante (même seconde)
    if (await fs.stat(finalPath).catch(() => null)) throw new Error(`L'archive existe déjà : ${finalPath}`)

    const isExcluded = picomatch(task.exclusions, { dot: true })
    let buffer: ExecutionFile[] = []
    const flush = () => {
      if (buffer.length) options.onFiles(buffer)
      buffer = []
    }

    await create({
      file: partialPath,
      cwd: source,
      gzip: true,
      portable: true,
      filter: (path, entry) => {
        // Les chemins arrivent sous la forme "./dossier/fichier"
        const relPath = path.replace(/^\.\//, '')
        if (relPath === '.' || relPath === '') return true
        if (isExcluded(relPath) || isExcluded(relPath.split('/').pop()!)) {
          result.filesSkipped++
          return false
        }
        // Seuls les fichiers réguliers sont tracés (dossiers et liens ignorés dans la liste)
        if ('isFile' in entry && entry.isFile()) {
          const size = (entry as { size: number }).size
          buffer.push({ path: relPath, size })
          result.filesCopied++
          result.bytesCopied += size
          if (buffer.length >= FLUSH_SIZE) flush()
        }
        return true
      }
    }, ['.'])
    flush()

    await fs.rename(partialPath, finalPath)
    result.status = 'success'
    result.archivePath = finalPath
    result.archiveBytes = (await fs.stat(finalPath)).size
  } catch (error) {
    await fs.rm(partialPath, { force: true }).catch(() => {})
    result.error = error instanceof Error ? error.message : String(error)
  }
  return result
}
