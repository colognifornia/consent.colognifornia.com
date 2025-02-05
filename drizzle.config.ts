import env from '@/env';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
