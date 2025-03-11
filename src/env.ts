import { config as dotenv } from 'dotenv';
import { z } from 'zod';
import * as Sentry from '@sentry/node';

dotenv();

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum([
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace',
    'silent',
  ]),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  API_KEY: z.string(),
  SENTRY_DSN: z.string(),
});

export type env = z.infer<typeof EnvSchema>;

const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error('❌ Invalid env:');
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  await Sentry.close(2000);
  process.exit(1);
}

export default env!;
