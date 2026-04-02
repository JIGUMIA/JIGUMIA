let Sentry: any = null;
try { Sentry = require('@sentry/react-native'); } catch {}

export function initSentry() {
  if (__DEV__ || !Sentry) return;

  Sentry.init({
    dsn: '', // TODO: Replace with your Sentry DSN from https://sentry.io
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
  });
}

export { Sentry };
