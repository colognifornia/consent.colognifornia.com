import pino from '@/utils/pino';
import { pinoLogger } from 'hono-pino';

export default pinoLogger({
  pino: pino,
  http: {
    reqId: () => crypto.randomUUID(),
  },
});
