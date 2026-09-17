// -----------------------------------------------------------------------------
// Esquemas y validación estricta de ENTRADA y SALIDA.
// - Entrada: solo contexto estructurado (enums controlados). Se rechaza todo
//   campo desconocido y todo valor fuera de catálogo.
// - Salida del modelo: se valida contra un esquema estricto y un filtro de
//   frases fuera de alcance (conclusiones jurídicas, fuga de secretos, enlaces).
//   Si no cumple, el llamador usa el fallback determinístico.
// -----------------------------------------------------------------------------
import {
  caseIds,
  phaseIds,
  actionIds,
  questionIds,
  questionOptionValues,
} from './data.mjs';
import { LIMITS } from './sanitize.mjs';

// --- Frases prohibidas en la salida del modelo (fuera de alcance) ------------
const FORBIDDEN = [
  /s[ií]\s+hubo\s+discriminaci[oó]n/i,
  /es\s+un\s+caso\s+de\s+discriminaci[oó]n/i,
  /tienes?\s+un\s+caso\b/i,
  /vas?\s+a\s+ganar/i,
  /te\s+garantiz/i,
  /con\s+seguridad\s+(ganar|proceder)/i,
  /system\s*prompt/i,
  /api[_\s-]?key|clave\s+de\s+api/i,
  /instrucciones\s+internas/i,
];

const hasForbidden = (s) => typeof s === 'string' && FORBIDDEN.some((re) => re.test(s));
const hasUrl = (s) => typeof s === 'string' && /https?:\/\//i.test(s);
const badText = (s, max) =>
  typeof s !== 'string' || s.length === 0 || s.length > max || hasForbidden(s) || hasUrl(s);

/**
 * Valida la ENTRADA. Devuelve { ok, value|errors }.
 * Estructura permitida: { caseId, phase, answers, userText? }.
 */
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
      const keys = Object.keys(answers);
      if (keys.length > LIMITS.maxAnswers) errors.push('demasiadas respuestas');
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

/**
 * Valida la SALIDA del modelo. `allowed` trae los ids/preguntas válidos.
 * Devuelve { ok, value } o { ok:false }.
 */
export function validateModelOutput(obj, allowed) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false };

  // intro (opcional pero, si viene, debe ser texto sano)
  if (obj.intro !== undefined && badText(obj.intro, 280)) return { ok: false };

  // micro: [{ questionId ∈ preguntas respondidas, text sano }]
  const micro = [];
  if (obj.micro !== undefined) {
    if (!Array.isArray(obj.micro) || obj.micro.length > 12) return { ok: false };
    for (const m of obj.micro) {
      if (!m || typeof m !== 'object') return { ok: false };
      if (!allowed.questionIds.has(m.questionId)) return { ok: false };
      if (badText(m.text, 300)) return { ok: false };
      micro.push({ questionId: m.questionId, text: m.text });
    }
  }

  // review: [string sano]
  const review = [];
  if (obj.review !== undefined) {
    if (!Array.isArray(obj.review) || obj.review.length > 6) return { ok: false };
    for (const r of obj.review) {
      if (badText(r, 200)) return { ok: false };
      review.push(r);
    }
  }

  // actionOrder: subconjunto de ids de acciones permitidas
  const actionOrder = [];
  if (obj.actionOrder !== undefined) {
    if (!Array.isArray(obj.actionOrder) || obj.actionOrder.length > 8) return { ok: false };
    for (const id of obj.actionOrder) {
      if (typeof id !== 'string' || !allowed.actionIds.has(id)) return { ok: false };
      actionOrder.push(id);
    }
  }

  return { ok: true, value: { intro: obj.intro, micro, review, actionOrder } };
}

/** Conjuntos permitidos para validar una salida en el contexto actual. */
export function allowedForContext(answers) {
  return {
    questionIds: new Set(Object.keys(answers || {})),
    actionIds,
  };
}

// Esquema JSON estricto para "structured outputs" de OpenAI.
export const OUTPUT_JSON_SCHEMA = {
  name: 'ruta_protegida_guidance',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      intro: { type: 'string' },
      micro: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            questionId: { type: 'string' },
            text: { type: 'string' },
          },
          required: ['questionId', 'text'],
        },
      },
      review: { type: 'array', items: { type: 'string' } },
      actionOrder: { type: 'array', items: { type: 'string' } },
    },
    required: ['intro', 'micro', 'review', 'actionOrder'],
  },
};

export { FORBIDDEN };
