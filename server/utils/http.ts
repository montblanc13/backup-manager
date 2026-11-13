import type { H3Event } from 'h3'
import { TaskAlreadyRunningError, TaskNotFoundError } from '../services/backupService'

/** Lit et valide l'identifiant numérique présent dans l'URL */
export function getIdParam(event: H3Event): number {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant invalide' })
  }
  return id
}

/** Convertit les erreurs métier en erreurs HTTP */
export function toHttpError(error: unknown): never {
  if (error instanceof TaskNotFoundError) throw createError({ statusCode: 404, statusMessage: error.message })
  if (error instanceof TaskAlreadyRunningError) throw createError({ statusCode: 409, statusMessage: error.message })
  throw error
}
