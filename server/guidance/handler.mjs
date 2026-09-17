// -----------------------------------------------------------------------------
// Orquestador del endpoint /api/guidance (agnóstico de plataforma).
// Firma web estándar: (Request) -> Promise<Response>.
//
// Flujo: CORS → método → tamaño → rate limit → validación de entrada →
// base determinística → (si hay clave) IA con timeout → validación de salida →
// merge o fallback. Nunca ejecuta acciones ni registra contenido sensible.
// -----------------------------------------------------------------------------
import { questions, actions as allActions, allowedLegalForCase } from './data.mjs';
import { validateInput, validateModelOutput, allowedForContext, buildOutputSchema } from './schema.mjs';
import { cleanUserText, withinSizeLimit } from './sanitize.mjs';
import { buildMessages } from './prompt.mjs';
import { callModel as defaultCallModel } from './openai.mjs';
import { deterministicGuidance } from './fallback.mjs';
import { createRateLimiter, clientKey } from './ratelimit.mjs';

const INFORMATIVE_NOTE =
  'Esta orientación es informativa y puede complementarse con IA. No reemplaza la asesoría jurídica profesional; cada caso requiere revisión individual.';

// Registro técnico sin contenido del usuario (solo códigos).
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

// Aplica el texto validado de la IA sobre la base determinística.
function mergeGuidance(base, ai) {
  const result = { ...base, note: INFORMATIVE_NOTE, meta: { source: 'ai', version: base.meta.version } };
  if (ai.intro) result.intro = ai.intro;

  if (ai.micro?.length) {
    const byId = new Map(ai.micro.map((m) => [m.questionId, m.text]));
    result.micro = base.micro.map((m) => (byId.has(m.questionId) ? { ...m, text: byId.get(m.questionId) } : m));
  }
  if (ai.review?.length && result.summary) {
    result.summary = { ...result.summary, review: ai.review };
  }
  if (ai.actionOrder?.length) {
    const order = ai.actionOrder;
    const rank = (id) => {
      const i = order.indexOf(id);
      return i === -1 ? order.length : i;
    };
    result.actions = [...base.actions].sort((a, b) => rank(a.id) - rank(b.id));
  }
  return result;
}

/**
 * Crea el handler.
 * @param {object} cfg
 * @param {object} cfg.env         Variables de entorno (process.env o similar).
 * @param {Function} [cfg.callModel] Inyectable para pruebas.
 * @param {object} [cfg.rateLimiter] Inyectable para pruebas.
 */
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
    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405, origin);
    }

    // Tamaño de entrada.
    const raw = await request.text();
    if (!withinSizeLimit(raw)) return json({ error: 'payload_too_large' }, 413, origin);

    // Rate limiting.
    const key = clientKey(request.headers, undefined);
    const rl = limiter.check(key);
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'rate_limited' }), {
        status: 429,
        headers: { 'content-type': 'application/json', 'retry-after': String(rl.retryAfter), ...corsHeaders(origin) },
      });
    }

    // Parseo + validación estricta de entrada.
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

    // Base determinística (siempre disponible).
    const base = deterministicGuidance({ caseId: ctx.caseId, answers: ctx.answers, phase: ctx.phase });

    // Sin clave configurada → responder con el motor local.
    if (!apiKey) {
      return json({ ...base, note: INFORMATIVE_NOTE }, 200, origin);
    }

    // Minimización final del texto libre (redacción de PII).
    const cleaned = ctx.userText ? cleanUserText(ctx.userText) : null;
    if (cleaned?.redacted?.length) logError('pii_redacted', cleaned.redacted.join(','));

    try {
      const messages = buildMessages({
        caseId: ctx.caseId,
        phase: ctx.phase,
        answers: ctx.answers,
        userText: cleaned?.text ?? null,
        preguntas: questions
          .filter((q) => ctx.answers[q.id])
          .map((q) => ({ id: q.id, prompt: q.prompt })),
        acciones: base.actions.map((a) => ({ id: a.id, label: a.label })),
        fuentes: allowedLegalForCase(ctx.caseId),
      });

      const allowed = allowedForContext(ctx.answers);
      const modelOut = await callModel({
        messages,
        apiKey,
        model,
        timeoutMs,
        schema: buildOutputSchema(allowed),
      });
      const valid = validateModelOutput(modelOut, allowed);
      if (!valid.ok) {
        logError('output_schema_invalid');
        return json({ ...base, note: INFORMATIVE_NOTE }, 200, origin); // fallback
      }
      return json(mergeGuidance(base, valid.value), 200, origin);
    } catch (err) {
      // Timeout, error de red o cualquier fallo → fallback determinístico.
      logError('model_call_failed', err?.message);
      return json({ ...base, note: INFORMATIVE_NOTE }, 200, origin);
    }
  };
}

export { INFORMATIVE_NOTE };
