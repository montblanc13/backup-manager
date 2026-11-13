import { z } from 'zod'
import { DirectoryError, listDirectories } from '../../services/directoryService'

const querySchema = z.object({ path: z.string().optional() })

// Liste les sous-dossiers d'un dossier du serveur (sélecteur de dossier)
export default defineEventHandler(async (event) => {
  const { path } = await getValidatedQuery(event, querySchema.parse)
  try {
    return await listDirectories(useRuntimeConfig().browseRoot, path)
  } catch (error) {
    if (error instanceof DirectoryError) {
      throw createError({ statusCode: error.statusCode, statusMessage: error.message })
    }
    throw error
  }
})
