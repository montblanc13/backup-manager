import { taskInputSchema } from '#shared/schemas/task'
import { taskService } from '../../services/taskService'

export default defineEventHandler(async (event) => {
  const input = await readValidatedBody(event, taskInputSchema.parse)
  setResponseStatus(event, 201)
  return taskService.create(input)
})
