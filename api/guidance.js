// -----------------------------------------------------------------------------
// Función serverless de Vercel (runtime Node) que expone POST /api/guidance.
// Reutiliza el handler agnóstico de server/. La clave OPENAI_API_KEY se
// configura en el panel de Vercel (Environment Variables), nunca en el repo.
// -----------------------------------------------------------------------------
import { createHandler } from '../server/guidance/handler.mjs';

const handler = createHandler({ env: process.env });

async function readRawBody(req) {
  if (typeof req.body === 'string') return req.body;
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}

export default async function vercelHandler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const url = new URL(req.url, `${proto}://${req.headers.host}`);
  const method = req.method || 'GET';
  const body = ['GET', 'HEAD'].includes(method) ? undefined : await readRawBody(req);

  const request = new Request(url, { method, headers: req.headers, body });
  const response = await handler(request);

  res.statusCode = response.status;
  response.headers.forEach((v, k) => res.setHeader(k, v));
  res.end(Buffer.from(await response.arrayBuffer()));
}
