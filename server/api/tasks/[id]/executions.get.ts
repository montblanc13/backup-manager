import { executionRepository } from '../../../repositories/executionRepository'
import { getIdParam } from '../../../utils/http'

export default defineEventHandler((event) => executionRepository.findByTask(getIdParam(event)))
