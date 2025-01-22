import { Hono } from 'hono';
import { notFound, onError } from 'stoker/middlewares';
import type { HttpBindings } from '@hono/node-server';
import pinoLogger from '@/middlewares/pino-logger';
import logConsent from '@/routes/logConsent/logConsent.route';
import { cors } from 'hono/cors';
import env from '@/env';
import { secureHeaders } from 'hono/secure-headers';
import { rateLimiter } from 'hono-rate-limiter';
import RedisStore from 'rate-limit-redis';
import redis from '@/utils/redis';
import crypto from 'node:crypto';
import { bearerAuth } from 'hono/bearer-auth';
import { HTTPException } from 'hono/http-exception';

export function createApp() {
  return new Hono<{ Bindings: HttpBindings }>();
}

const origin =
  env.NODE_ENV === 'development'
    ? ['https://colognifornia.test', 'https://colognifornia.com']
    : 'https://colognifornia.com';

const app = createApp();

app.use(pinoLogger);
app.use(secureHeaders());
app.use(
  rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    limit: 6,
    keyGenerator: (c) => {
      const ip = (c.env as HttpBindings).incoming.socket.remoteAddress;
      return ip
        ? crypto.createHash('sha256').update(ip).digest('hex')
        : 'unknown';
    },
    // @ts-expect-error incompatible types for RedisStore
    store: redis.isReady
      ? new RedisStore({
          sendCommand: (...args: string[]) => redis.sendCommand(args),
        })
      : undefined,
  })
);
app.use(
  '/*',
  cors({
    origin,
    allowMethods: ['POST', 'GET', 'OPTIONS', 'HEAD'],
    credentials: true,
  })
);
app.use(
  bearerAuth({
    token: env.API_KEY,
    invalidTokenMessage: {
      error: 'Invalid API key',
      success: false,
    },
    invalidAuthenticationHeaderMessage: {
      error: 'Invalid authentication header',
      success: false,
    },
    noAuthenticationHeaderMessage: {
      error: 'No authentication header provided',
      success: false,
    },
  })
);
app.notFound(notFound);
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return onError(err, c);
});

const routes = [logConsent];

routes.forEach((route) => {
  app.route('/', route);
});

export default app;
