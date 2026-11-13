import { defineConfig } from 'drizzle-kit'

// Génération des migrations : `npm run db:generate`
export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/schema.ts',
  out: './server/database/migrations'
})
