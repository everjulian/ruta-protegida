// -----------------------------------------------------------------------------
// Esquemas y validación estricta de ENTRADA y SALIDA (formato v2).
// - Entrada: solo contexto estructurado (enums controlados).
// - Salida del modelo: formato { summary, signals, actions, human_review,
//   human_review_reason, cta, disclaimer }. Validación PERMISIVA con el lenguaje
//   natural pero ESTRICTA en lo jurídico: source_id debe existir en LEGAL_CONTEXT,
//   sin conclusiones prohibidas, sin URLs inventadas. Si no cumple → fallback.
// -----------------------------------------------------------------------------
import {
  caseIds,
  phaseIds,
  actionIds,
  questionIds,
  questionOptionValues,
  allowedLegalForCase,
} from './data.mjs';
import { LIMITS } from './sanitize.mjs';

// Frases prohibidas: conclusiones jurídicas y fuga de secretos (no lenguaje común).
const FORBIDDEN = [
  /te\s+discriminaron/i,
  /s[ií]\s+hubo\s+discriminaci[oó]n/i,
  /es\s+un\s+caso\s+de\s+discriminaci[oó]n/i,
  /tu\s+despido\s+es\s+ilegal/i,
  /tienes?\s+un\s+caso\b/i,
  /vas?\s+a\s+ganar/i,
  /debes?\s+demandar/i,
  /te\s+garantiz/i,
  /system\s*prompt/i,
  /api[_\s-]?key|clave\s+de\s+api/i,
];

const hasForbidden = (s) => typeof s === 'string' && FORBIDDEN.some((re) => re.test(s));
const hasUrl = (s) => typeof s === 'string' && /https?:\/\//i.test(s);
const badText = (s, max) =>
  typeof s !== 'string' || s.trim().length === 0 || s.length > max || hasForbidden(s) || hasUrl(s);

// --- ENTRADA -----------------------------------------------------------------
export function validateInput(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: ['cuerpo inválido'] };
  }
  const allowedKeys = new Set(['caseId', 'phase', 'answers', 'userText']);
  for (const k of Object.keys(body)) {
    if (!allowedKeys.has(k)) errors.push(`campo no permitido: ${k}`);
  }
  const { caseId, phase, answers } = body;
  if (!caseIds.has(caseId)) errors.push('caseId inválido');
  if (!phaseIds.has(phase)) errors.push('phase inválida');

  const cleanAnswers = {};
  if (answers !== undefined) {
    if (typeof answers !== 'object' || answers === null || Array.isArray(answers)) {
      errors.push('answers inválido');
    } else {
      if (Object.keys(answers).length > LIMITS.maxAnswers) errors.push('demasiadas respuestas');
      for (const [qid, val] of Object.entries(answers)) {
        if (!questionIds.has(qid)) {
          errors.push(`pregunta desconocida: ${qid}`);
          continue;
        }
        const allowed = questionOptionValues.get(qid);
        if (!allowed || !allowed.has(val)) {
          errors.push(`respuesta fuera de catálogo: ${qid}`);
          continue;
        }
        cleanAnswers[qid] = val;
      }
    }
  }

  let userText;
  if (body.userText !== undefined) {
    if (typeof body.userText !== 'string') errors.push('userText inválido');
    else userText = body.userText;
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { caseId, phase, answers: cleanAnswers, userText } };
}

/** Conjuntos permitidos para validar la salida en el contexto actual. */
export function allowedForContext(caseId, answers) {
  return {
    questionIds: new Set(Object.keys(answers || {})),
    actionIds,
    legalCodes: new Set(allowedLegalForCase(caseId).map((s) => s.source_id)),
  };
}

// --- SALIDA DEL MODELO -------------------------------------------------------
export function validateModelOutput(obj, allowed) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false };

  if (badText(obj.summary, 500)) return { ok: false };

  // signals
  const signals = [];
  if (!Array.isArray(obj.signals) || obj.signals.length > 3) return { ok: false };
  for (const s of obj.signals) {
    if (!s || typeof s !== 'object') return { ok: false };
    if (badText(s.title, 140)) return { ok: false };
    if (badText(s.explanation, 400)) return { ok: false };
    let sourceId = s.source_id ?? null;
    if (sourceId !== null) {
      if (typeof sourceId !== 'string' || !allowed.legalCodes.has(sourceId)) return { ok: false };
    }
    signals.push({ title: s.title, explanation: s.explanation, source_id: sourceId });
  }

  // actions
  const actions = [];
  if (!Array.isArray(obj.actions) || obj.actions.length > 4) return { ok: false };
  for (const a of obj.actions) {
    if (!a || typeof a !== 'object') return { ok: false };
    if (!['alta', 'media', 'baja'].includes(a.priority)) return { ok: false };
    if (badText(a.action, 240)) return { ok: false };
    actions.push({ priority: a.priority, action: a.action });
  }

  // cta.message (label lo fija el servidor)
  if (!obj.cta || typeof obj.cta !== 'object') return { ok: false };
  if (badText(obj.cta.message, 240)) return { ok: false };

  return {
    ok: true,
    value: { summary: obj.summary, signals, actions, ctaMessage: obj.cta.message },
  };
}

/**
 * Esquema JSON estricto (structured outputs) según el formato del system prompt.
 * @param {{legalCodes?:Set<string>}} [allowed]
 */
export function buildOutputSchema() {
  return {
    name: 'ruta_protegida_guidance',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        summary: { type: 'string' },
        signals: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: { type: 'string' },
              explanation: { type: 'string' },
              source_id: { type: ['string', 'null'] },
            },
            required: ['title', 'explanation', 'source_id'],
          },
        },
        actions: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              priority: { type: 'string', enum: ['alta', 'media', 'baja'] },
              action: { type: 'string' },
            },
            required: ['priority', 'action'],
          },
        },
        human_review: { type: 'boolean' },
        human_review_reason: { type: ['string', 'null'] },
        cta: {
          type: 'object',
          additionalProperties: false,
          properties: {
            label: { type: 'string' },
            message: { type: 'string' },
          },
          required: ['label', 'message'],
        },
        disclaimer: { type: 'string' },
      },
      required: [
        'summary',
        'signals',
        'actions',
        'human_review',
        'human_review_reason',
        'cta',
        'disclaimer',
      ],
    },
  };
}

export const OUTPUT_JSON_SCHEMA = buildOutputSchema();
export { FORBIDDEN };
