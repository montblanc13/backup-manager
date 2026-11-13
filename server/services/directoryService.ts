import { promises as fs } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import type { DirectoryListing } from '#shared/types/backup'

export class DirectoryError extends Error {
  constructor(message: string, readonly statusCode: 400 | 403 | 404) {
    super(message)
  }
}

// Vrai si `target` est la racine ou se trouve dedans
function isInside(root: string, target: string): boolean {
  const rel = relative(root, target)
  return rel === '' || (!rel.startsWith('..') && !rel.startsWith(sep))
}

/**
 * Liste les sous-dossiers d'un dossier du serveur.
 * La navigation est limitée à `root` (config `browseRoot`).
 */
export async function listDirectories(root: string, requested?: string): Promise<DirectoryListing> {
  const rootPath = resolve(root)
  const target = resolve(requested || rootPath)

  if (!isInside(rootPath, target)) {
    throw new DirectoryError('Dossier hors de la zone autorisée', 403)
  }
  const stat = await fs.stat(target).catch(() => null)
  if (!stat?.isDirectory()) throw new DirectoryError('Dossier introuvable', 404)

  let entries
  try {
    entries = await fs.readdir(target, { withFileTypes: true })
  } catch {
    throw new DirectoryError('Dossier illisible (permissions)', 403)
  }

  const directories: DirectoryListing['directories'] = []
  for (const entry of entries) {
    const path = join(target, entry.name)
    // Suit les liens symboliques pour savoir s'ils pointent vers un dossier
    const isDir = entry.isDirectory()
      || (entry.isSymbolicLink() && (await fs.stat(path).catch(() => null))?.isDirectory())
    if (isDir) directories.push({ name: entry.name, path })
  }
  directories.sort((a, b) => a.name.localeCompare(b.name))

  return { path: target, parent: target === rootPath ? null : dirname(target), directories }
}
