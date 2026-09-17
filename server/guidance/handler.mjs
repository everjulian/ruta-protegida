// -----------------------------------------------------------------------------
// Orquestador del endpoint /api/guidance (agnóstico de plataforma).
// Firma web estándar: (Request) -> Promise<Response>.
//
// Flujo: CORS → método → tamaño → rate limit → validación de entrada →
// base determinística → (si hay clave y ≥2 respuestas) IA con timeout →
// validación de salida → merge o fallback. Nunca ejecuta acciones ni registra
// contenido sensible.
// -----------------------------------------------------------------------------
import { questions, allowedLegalForCase } from './data.mjs';
import { validateInput, validateModelOutput, allowedForContext, buildOutputSchema } from './schema.mjs';
import { cleanUserText, withinSizeLimit } from './sanitize.mjs';
import { buildMessages } from './prompt.mjs';
import { callModel as defaultCallModel } from './openai.mjs';
import { deterministicGuidance } from './fallback.mjs';
import { createRateLimiter, clientKey } from './ratelimit.mjs';
import { DISCLAIMER } from '../../src/lib/guidance/rules.js';

const logError = (code, detail) =>
  console.error(`[guidance] ${code}${detail ? ' :: ' + detail : ''}`);

function corsHeaders(origin) {
  return {
    'access-control-allow-origin': origin || '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '600',
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
  });
}

// Fusiona la salida validada de la IA sobre la base determinística.
// La ley, la evidencia, la urgencia y el disclaimer los manda el SERVIDOR.
function mergeGuidance(base, ai, urlBySource) {
  return {
    ...base,
    intro: ai.summary || base.intro,
    signals: ai.signals.map((s) => ({
      title: s.title,
      explanation: s.explanation,
      sourceId: s.source_id,
      sourceUrl: s.source_id ? urlBySource[s.source_id] || null : null,
    })),
    actions: ai.actions.map((a) => ({ priority: a.priority, text: a.action, detail: '', cta: false })),
    cta: { ...base.cta, message: ai.ctaMessage || base.cta.message },
    note: DISCLAIMER,
    meta: { source: 'ai', version: base.meta.version },
  };
}

export function createHandler({ env = {}, callModel = defaultCallModel, rateLimiter } = {}) {
  const limiter =
    rateLimiter ||
    createRateLimiter({
      capacity: Number(env.GUIDANCE_RATE_CAPACITY) || 8,
      refillPerMinute: Number(env.GUIDANCE_RATE_PER_MIN) || 8,
    });
  const origin = env.ALLOWED_ORIGIN || '*';
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';
  const timeoutMs = Number(env.GUIDANCE_TIMEOUT_MS) || 8000;
  const apiKey = env.OPENAI_API_KEY;

  return async function handler(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin);

    const raw = await request.text();
    if (!withinSizeLimit(raw)) return json({ error: 'payload_too_large' }, 413, origin);

    const key = clientKey(request.headers, undefined);
    const rl = limiter.check(key);
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'rate_limited' }), {
        status: 429,
        headers: { 'content-type': 'application/json', 'retry-after': String(rl.retryAfter), ...corsHeaders(origin) },
      });
    }

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: 'invalid_json' }, 400, origin);
    }
    const parsed = validateInput(body);
    if (!parsed.ok) {
      logError('input_invalid');
      return json({ error: 'invalid_input' }, 422, origin);
    }
    const ctx = parsed.value;

    // Base determinística (siempre disponible, ya en forma v2).
    const base = deterministicGuidance({ caseId: ctx.caseId, answers: ctx.answers, phase: ctx.phase });
    const answered = Object.keys(ctx.answers).length;

    // Sin clave o con muy poca información → responder con el motor local.
    if (!apiKey || answered < 2) {
      return json(base, 200, origin);
    }

    const cleaned = ctx.userText ? cleanUserText(ctx.userText) : null;
    if (cleaned?.redacted?.length) logError('pii_redacted', cleaned.redacted.join(','));

    try {
      const fuentes = allowedLegalForCase(ctx.caseId);
      const urlBySource = Object.fromEntries(fuentes.map((f) => [f.source_id, f.url]));
      const hechos = questions
        .filter((q) => ctx.answers[q.id])
        .map((q) => ({ pregunta: q.prompt, respuesta: ctx.answers[q.id] }));

      const messages = buildMessages({
        caseId: ctx.caseId,
        phase: ctx.phase,
        answers: ctx.answers,
        userText: cleaned?.text ?? null,
        hechos,
        fuentes,
      });

      const modelOut = await callModel({
        messages,
        apiKey,
        model,
        timeoutMs,
        schema: buildOutputSchema(),
      });
      const valid = validateModelOutput(modelOut, allowedForContext(ctx.caseId, ctx.answers));
      if (!valid.ok) {
        logError('output_schema_invalid');
        return json(base, 200, origin); // fallback
      }
      return json(mergeGuidance(base, valid.value, urlBySource), 200, origin);
    } catch (err) {
      logError('model_call_failed', err?.message);
      return json(base, 200, origin); // fallback determinístico
    }
  };
}
