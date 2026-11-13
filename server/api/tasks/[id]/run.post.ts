import { startTaskInBackground } from '../../../services/backupService'
import { getIdParam, toHttpError } from '../../../utils/http'

// Déclenche une exécution manuelle (asynchrone, retourne l'exécution en cours)
export default defineEventHandler((event) => {
  try {
    setResponseStatus(event, 202)
    return startTaskInBackground(getIdParam(event))
  } catch (error) {
    toHttpError(error)
  }
})
