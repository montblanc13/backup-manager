import { taskService } from '../../../services/taskService'
import { getIdParam } from '../../../utils/http'

export default defineEventHandler((event) => {
  const task = taskService.get(getIdParam(event))
  if (!task) throw createError({ statusCode: 404, statusMessage: 'Tâche introuvable' })
  return task
})
