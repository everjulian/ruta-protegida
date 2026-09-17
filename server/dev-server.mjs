// -----------------------------------------------------------------------------
// Servidor local para probar /api/guidance sin desplegar.
// Uso:  node --env-file=.env server/dev-server.mjs   (Node 20+)
//   o:  OPENAI_API_KEY=... node server/dev-server.mjs
// Sirve SOLO el endpoint; el front (Astro) se sirve aparte con `npm run dev`.
// -----------------------------------------------------------------------------
import http from 'node:http';
import { createHandler } from './guidance/handler.mjs';

const PORT = Number(process.env.GUIDANCE_PORT) || 8787;
const handler = createHandler({ env: process.env });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname !== '/api/guidance') {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end('{"error":"not_found"}');
    return;
  }

  // Cuerpo → texto
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const bodyText = Buffer.concat(chunks).toString('utf8');

  // Node req → Web Request
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : bodyText,
  });

  const response = await handler(request);
  const buf = Buffer.from(await response.arrayBuffer());
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(buf);
});

server.listen(PORT, () => {
  const withKey = process.env.OPENAI_API_KEY ? 'con clave OpenAI' : 'SIN clave (modo determinístico)';
  console.log(`[guidance] escuchando en http://localhost:${PORT}/api/guidance  (${withKey})`);
});
