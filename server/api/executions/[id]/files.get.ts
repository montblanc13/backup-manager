import { z } from 'zod'
import { executionFileRepository } from '../../../repositories/executionFileRepository'
import { getIdParam } from '../../../utils/http'

const querySchema = z.object({
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50)
})

// Fichiers embarqués dans l'archive d'une exécution (paginé, filtrable par chemin)
export default defineEventHandler(async (event) => {
  const id = getIdParam(event)
  const { search, page, pageSize } = await getValidatedQuery(event, querySchema.parse)
  return executionFileRepository.findPage(id, { search: search || undefined, offset: (page - 1) * pageSize, limit: pageSize })
})
