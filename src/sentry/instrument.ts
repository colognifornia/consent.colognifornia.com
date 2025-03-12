import env from '@/env';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { name as packageName } from '@/../package.json';

Sentry.init({
  dsn: env.SENTRY_DSN,

  integrations: [nodeProfilingIntegration()],

  // sampling rate for all errors
  sampleRate: 1.0,

  // Add Tracing by setting tracesSampleRate
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  profilesSampleRate: 1.0,

  registerEsmLoaderHooks: {
    onlyIncludeInstrumentedModules: true,
  },

  environment: env.NODE_ENV,
  release: env.RELEASE_VERSION
    ? `${packageName}@${env.RELEASE_VERSION}`
    : undefined,
});
