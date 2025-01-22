import env from '@/env';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: env.SENTRY_DSN,
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  profilesSampleRate: 1.0,

  registerEsmLoaderHooks: {
    onlyIncludeInstrumentedModules: true,
  },

  environment: env.NODE_ENV,
});
