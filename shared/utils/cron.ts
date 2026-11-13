import { Cron } from 'croner'

/** Vrai si l'expression est un cron valide (5 ou 6 champs) */
export function isValidCron(value: string): boolean {
  try {
    new Cron(value, { paused: true })
    return true
  } catch {
    return false
  }
}

/** Prochaines dates d'exécution (ISO) d'une expression cron valide */
export function nextRuns(expression: string, count = 3): string[] {
  const job = new Cron(expression, { paused: true })
  return job.nextRuns(count).map(date => date.toISOString())
}
