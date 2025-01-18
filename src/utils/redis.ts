import env from '@/env';
import { createClient } from '@redis/client';

const client = createClient({
  url: env.REDIS_URL,
});

await client.connect();

export default client;
