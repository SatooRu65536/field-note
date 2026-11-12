import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/server/lib/db/schema.ts',
  dialect: 'sqlite',
})
