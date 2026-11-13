import { taskInputSchema } from '#shared/schemas/task'
import { taskService } from '../../../services/taskService'
import { getIdParam } from '../../../utils/http'

export default defineEventHandler(async (event) => {
  const id = getIdParam(event)
  const input = await readValidatedBody(event, taskInputSchema.parse)
  const task = taskService.update(id, input)
  if (!task) throw createError({ statusCode: 404, statusMessage: 'Tâche introuvable' })
  return task
})
