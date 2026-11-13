import { z } from 'zod'
import { CronSuggestionError, suggestCron } from '../../services/cronSuggestionService'

const bodySchema = z.object({ description: z.string().trim().min(3).max(500) })

// Convertit une description en langage naturel en expression cron
export default defineEventHandler(async (event) => {
  const { description } = await readValidatedBody(event, bodySchema.parse)
  try {
    return await suggestCron(description)
  } catch (error) {
    if (error instanceof CronSuggestionError) {
      throw createError({ statusCode: error.statusCode, statusMessage: error.message })
    }
    throw error
  }
})
