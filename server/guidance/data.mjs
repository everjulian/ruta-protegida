// -----------------------------------------------------------------------------
// Fuente única de verdad (compartida con el cliente): situaciones, preguntas,
// acciones y sentencias. El servidor deriva de aquí los conjuntos permitidos
// y las fuentes jurídicas que SÍ puede usar el modelo.
//
// Ninguno de estos módulos contiene secretos ni accede a la API de OpenAI.
// -----------------------------------------------------------------------------
import { cases } from '../../src/data/cases.js';
import { phaseOrder } from '../../src/data/phases.js';
import { questions } from '../../src/data/questions.js';
import { actions } from '../../src/data/actions.js';
import { judgments } from '../../src/data/judgments.js';

export const caseIds = new Set(cases.map((c) => c.id));
export const phaseIds = new Set(phaseOrder);
export const actionIds = new Set(actions.map((a) => a.id));
export const questionIds = new Set(questions.map((q) => q.id));

/** Map<questionId, Set<valoresPermitidos>> para validar respuestas (enums). */
export const questionOptionValues = new Map(
  questions.map((q) => [q.id, new Set(q.options.map((o) => o.value))]),
);

/** Fuentes jurídicas permitidas para un caso (las únicas que puede citar el modelo). */
export function allowedLegalForCase(caseId) {
  const c = cases.find((x) => x.id === caseId);
  return (c?.legal || [])
    .map((i) => judgments[i])
    .filter(Boolean)
    .map((j) => ({ code: j.code, theme: j.theme, why: j.why, url: j.url }));
}

export { cases, actions, judgments, questions };
