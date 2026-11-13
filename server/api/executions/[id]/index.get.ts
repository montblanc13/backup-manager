import { executionRepository } from '../../../repositories/executionRepository'
import { getIdParam } from '../../../utils/http'

export default defineEventHandler((event) => {
  const execution = executionRepository.findById(getIdParam(event))
  if (!execution) throw createError({ statusCode: 404, statusMessage: 'Exécution introuvable' })
  return execution
})
