import { executionRepository } from '../repositories/executionRepository'
import { taskService } from '../services/taskService'

// Au démarrage : nettoie les exécutions interrompues puis planifie les tâches
export default defineNitroPlugin(() => {
  // Pas de planification ni d'accès à la base pendant le prérendu du build (dump SQL de Nuxt Content)
  if (import.meta.prerender) return
  executionRepository.failInterrupted()
  taskService.scheduleAll()
})
