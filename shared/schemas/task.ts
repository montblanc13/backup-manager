import { z } from 'zod'
import { isValidCron } from '../utils/cron'

export const taskInputSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(100),
  sourcePath: z.string().trim().min(1, 'Le dossier source est requis'),
  destinationPath: z.string().trim().min(1, 'La destination est requise'),
  cron: z.string().trim().refine(isValidCron, 'Expression cron invalide'),
  exclusions: z.array(z.string().trim().min(1)).default([]),
  enabled: z.boolean().default(true),
  // Rétention : null = pas de limite ; si les deux sont renseignées, les deux s'appliquent
  retentionMaxFiles: z.number({ error: 'Nombre invalide' }).int('Entier requis').positive('Doit être supérieur à 0')
    .max(1_000_000, 'Valeur trop grande').nullable().default(null),
  // Volume maximal en octets (converti depuis M / G par shared/utils/retention.ts)
  retentionMaxBytes: z.number({ error: 'Volume invalide' }).int('Entier requis').positive('Doit être supérieur à 0')
    .max(Number.MAX_SAFE_INTEGER, 'Valeur trop grande').nullable().default(null)
})

export type TaskInput = z.infer<typeof taskInputSchema>
