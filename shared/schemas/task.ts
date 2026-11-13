import { z } from 'zod'
import { isValidCron } from '../utils/cron'

export const taskInputSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(100),
  sourcePath: z.string().trim().min(1, 'Le dossier source est requis'),
  destinationPath: z.string().trim().min(1, 'La destination est requise'),
  cron: z.string().trim().refine(isValidCron, 'Expression cron invalide'),
  exclusions: z.array(z.string().trim().min(1)).default([]),
  enabled: z.boolean().default(true)
})

export type TaskInput = z.infer<typeof taskInputSchema>
