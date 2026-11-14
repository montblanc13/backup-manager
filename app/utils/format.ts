import type { BackupTask, ExecutionStatus } from '#shared/types/backup'

/** Formate un volume en octets (Ko, Mo, Go...) */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  const units = ['Ko', 'Mo', 'Go', 'To']
  let value = bytes / 1024
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`
}

/** Formate une date ISO au format local (fr) */
export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' })
}

/** Durée entre deux dates ISO, ex. "3,2 s" */
export function formatDuration(start: string, end: string | null): string {
  if (!end) return '—'
  const seconds = (new Date(end).getTime() - new Date(start).getTime()) / 1000
  if (seconds < 60) return `${seconds.toFixed(1).replace('.', ',')} s`
  return `${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} s`
}

/** Libellés de la politique de rétention d'une tâche (vide = aucune limite) */
export function formatRetention(task: Pick<BackupTask, 'retentionMaxFiles' | 'retentionMaxBytes'>): string[] {
  const labels: string[] = []
  if (task.retentionMaxFiles) {
    labels.push(`${task.retentionMaxFiles} archive${task.retentionMaxFiles > 1 ? 's' : ''} max`)
  }
  if (task.retentionMaxBytes) labels.push(`${formatBytes(task.retentionMaxBytes)} max`)
  return labels
}

export const statusLabels: Record<ExecutionStatus, string> = {
  running: 'En cours',
  success: 'Réussie',
  failed: 'Échouée'
}

export const statusColors: Record<ExecutionStatus, 'info' | 'success' | 'error'> = {
  running: 'info',
  success: 'success',
  failed: 'error'
}
