import { executionRepository } from '../repositories/executionRepository'
import { taskService } from '../services/taskService'

// Au démarrage : nettoie les exécutions interrompues puis planifie les tâches
export default defineNitroPlugin(() => {
  executionRepository.failInterrupted()
  taskService.scheduleAll()
})
