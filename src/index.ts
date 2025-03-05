import { serve } from '@hono/node-server';
import app from '@/app';
import env from '@/env';
import pino from '@/utils/pino';
import { checkDBConnection } from '@/utils/db';

const port = env.PORT;
console.log(`Server is running on http://localhost:${port}`);

if (!(await checkDBConnection())) {
  pino.error('Exiting due to failed db connection...');
  process.exit(1);
}

serve({
  fetch: app.fetch,
  port,
});
