import pino from 'pino';
import pretty from 'pino-pretty';
import env from '@/env';

export default pino(
  {
    level: env.LOG_LEVEL,
  },
  env.NODE_ENV === 'development' ? pretty() : undefined
);
