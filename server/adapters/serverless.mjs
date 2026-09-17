// -----------------------------------------------------------------------------
// Adaptador para plataformas serverless con firma web estándar
// (Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy).
// Todas invocan `fetch(request, env)` o `(request) => Response`.
//
// Ejemplo Vercel Edge (api/guidance.js):
//   export const config = { runtime: 'edge' };
//   export { default } from '../server/adapters/serverless.mjs';
//
// Ejemplo Cloudflare Workers:
//   import handler from './server/adapters/serverless.mjs';
//   export default { fetch: (req, env) => handler(req, env) };
// -----------------------------------------------------------------------------
import { createHandler } from '../guidance/handler.mjs';

let cached;

export default function handler(request, env) {
  // En Workers, `env` llega como 2º argumento; en Edge se usa process.env.
  const environment = env || (typeof process !== 'undefined' ? process.env : {});
  if (!cached) cached = createHandler({ env: environment });
  return cached(request);
}
