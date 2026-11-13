import Anthropic from '@anthropic-ai/sdk'
import { isValidCron, nextRuns } from '#shared/utils/cron'
import type { CronSuggestion } from '#shared/types/backup'

export class CronSuggestionError extends Error {
  constructor(message: string, readonly statusCode: 422 | 502 | 503) {
    super(message)
  }
}

const SYSTEM_PROMPT = `Tu convertis la description d'une planification (en français ou en anglais) en expression cron standard à 5 champs : minute heure jour-du-mois mois jour-de-semaine (dimanche = 0, lundi = 1).
Règles :
- Les heures sont exprimées dans le fuseau horaire du serveur, sans conversion.
- Si la description est ambiguë, choisis l'interprétation la plus raisonnable et précise-la dans l'explication.
- Si la description ne décrit pas une planification, renvoie un cron vide et explique pourquoi.
- L'explication est une phrase courte en français décrivant l'expression produite.`

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    cron: { type: 'string', description: 'Expression cron à 5 champs, ou chaîne vide' },
    explanation: { type: 'string', description: 'Phrase courte en français' }
  },
  required: ['cron', 'explanation'],
  additionalProperties: false
} as const

let client: Anthropic | null = null

/** Propose une expression cron à partir d'une description en langage naturel */
export async function suggestCron(description: string): Promise<CronSuggestion> {
  const config = useRuntimeConfig()
  if (!config.anthropicApiKey) {
    throw new CronSuggestionError('Suggestion IA indisponible : NUXT_ANTHROPIC_API_KEY non configurée', 503)
  }
  client ??= new Anthropic({ apiKey: config.anthropicApiKey })

  let response
  try {
    response = await client.beta.messages.create({
      model: config.anthropicModel,
      max_tokens: 1024,
      // Repli serveur automatique si le modèle décline la requête
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM_PROMPT,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: RESPONSE_SCHEMA } },
      messages: [{ role: 'user', content: description }]
    })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new CronSuggestionError('Clé API Anthropic invalide', 503)
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new CronSuggestionError('Limite de requêtes atteinte, réessayez plus tard', 503)
    }
    throw new CronSuggestionError('Le service IA a échoué', 502)
  }

  if (response.stop_reason === 'refusal') {
    throw new CronSuggestionError('La demande a été refusée par le modèle', 422)
  }
  const text = response.content.find(block => block.type === 'text')
  let parsed: { cron: string, explanation: string }
  try {
    parsed = JSON.parse(text?.type === 'text' ? text.text : '')
  } catch {
    throw new CronSuggestionError('Réponse du modèle illisible', 502)
  }

  const cron = parsed.cron.trim()
  if (!cron) throw new CronSuggestionError(parsed.explanation || 'Aucune planification détectée', 422)
  // Ne jamais faire confiance à la sortie du modèle : on revalide l'expression
  if (!isValidCron(cron)) throw new CronSuggestionError(`Expression proposée invalide : ${cron}`, 502)

  return { cron, explanation: parsed.explanation, nextRuns: nextRuns(cron) }
}
