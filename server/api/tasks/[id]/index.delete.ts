import { taskService } from '../../../services/taskService'
import { getIdParam } from '../../../utils/http'

export default defineEventHandler((event) => {
  if (!taskService.delete(getIdParam(event))) {
    throw createError({ statusCode: 404, statusMessage: 'Tâche introuvable' })
  }
  setResponseStatus(event, 204)
  return null
})
