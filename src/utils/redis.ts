import env from '@/env';
import { createClient } from '@redis/client';
import pino from './pino';

const client = createClient({
  url: env.REDIS_URL,
});

try {
  await client.connect();
  pino.info('Connected to Redis');
} catch (e) {
  pino.error('Failed to connect to Redis');
  pino.error(e);
}

export default client;
