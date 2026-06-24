/**
 * Firebase Cloud Functions entry point.
 * The Express app from server/server.js is wrapped as a single
 * HTTPS Cloud Function called "api".
 *
 * All requests to https://<project>.web.app/api/** are routed here
 * by the rewrite rules in firebase.json.
 */
import { onRequest } from 'firebase-functions/v2/https';
import app from './server/server.js';

export const api = onRequest(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  app
);
