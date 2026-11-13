import { taskService } from '../../services/taskService'

export default defineEventHandler(() => taskService.list())
