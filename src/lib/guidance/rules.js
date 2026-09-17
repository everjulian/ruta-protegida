// -----------------------------------------------------------------------------
// Proveedor determinístico local de orientación.
// Toma un Context y arma un GuidanceResult a partir de los datos declarativos.
// No hace red ni envía datos: todo se calcula en el dispositivo.
//
// Para sustituirlo/complementarlo por IA en el futuro, basta con crear otro
// proveedor con la misma firma (ver types.js: GuidanceProvider) y elegirlo en
// index.js. La interfaz de usuario no cambia.
// -----------------------------------------------------------------------------
import { cases } from '../../data/cases.js';
import { questions, findOption } from '../../data/questions.js';
import { judgments } from '../../data/judgments.js';
import {
  evidenceCatalog,
  evidenceRules,
  evidenceDefault,
  findEvidence,
} from '../../data/evidence.js';
import { actions } from '../../data/actions.js';

const VERSION = '1.0.0';

// Etiquetas que aporta el propio caso elegido (además de las respuestas).
const caseFlags = {
  trato: ['trato'],
  presion: ['presion'],
  despido: ['posible_despido'],
  despedido: ['despido'],
  salud: ['salud'],
  privacidad: ['divulgacion'],
  prueba: ['solicitud_datos'],
  duda: [],
};

// Frase de "qué conviene revisar" por etiqueta.
const reviewByFlag = {
  empleador_conocia: 'Conviene revisar qué se sabía del diagnóstico y desde cuándo.',
  post_conocimiento:
    'Conviene revisar el orden de los hechos respecto al conocimiento del diagnóstico.',
  coincide_conocimiento:
    'Conviene revisar los hechos cercanos al momento en que conocieron el diagnóstico.',
  cambio_funciones: 'Conviene comparar funciones, trato y evaluaciones antes y después.',
  presion: 'Conviene conservar mensajes y no firmar documentos sin orientación.',
  despido: 'Conviene revisar los motivos comunicados y los plazos aplicables.',
  posible_despido: 'Conviene prepararse antes de cualquier reunión o firma.',
  divulgacion: 'Conviene documentar cómo se difundió la información de salud.',
  solicitud_datos: 'Conviene revisar con qué finalidad se solicitó la información.',
  salud: 'Conviene reunir recomendaciones médicas sobre tus tareas.',
  hubo_cambios: 'Conviene detallar qué cambió exactamente y desde cuándo.',
};

// Etiquetas que elevan la urgencia del CTA de contacto.
const urgentFlags = ['despido', 'posible_despido', 'presion', 'divulgacion', 'solicitud_datos'];
const urgentReason = {
  despido: 'Hay un despido de por medio; conviene orientación pronto.',
  posible_despido: 'Puede haber un despido o una firma próxima.',
  presion: 'Hay presión o acoso; no tienes que manejarlo sin apoyo.',
  divulgacion: 'Se difundió información de tu salud; conviene actuar pronto.',
  solicitud_datos: 'Te solicitaron datos de salud; conviene revisarlo antes de responder.',
};

const uniq = (arr) => [...new Set(arr)];

function matchWhen(when, flags, caseId) {
  if (!when) return true;
  if (when.any) return true;
  if (when.case && when.case === caseId) return true;
  if (when.anyFlag && when.anyFlag.some((f) => flags.includes(f))) return true;
  return false;
}

/** Deriva las etiquetas (flags) a partir del caso y las respuestas. */
export function deriveFlags(caseId, answers = {}) {
  const flags = [...(caseFlags[caseId] || [])];
  for (const q of questions) {
    const value = answers[q.id];
    if (!value) continue;
    const opt = findOption(q, value);
    if (opt?.flags?.length) flags.push(...opt.flags);
  }
  return uniq(flags);
}

function buildMicro(answers) {
  const micro = [];
  for (const q of questions) {
    const value = answers[q.id];
    if (!value) continue;
    const opt = findOption(q, value);
    if (opt?.micro) micro.push({ questionId: q.id, text: opt.micro });
  }
  return micro;
}

function buildSummary(answers, flags) {
  const answered = Object.keys(answers).filter((k) => answers[k]);
  // Requisito: el resumen aparece tras 2–3 respuestas, no antes.
  if (answered.length < 2) return null;

  const facts = [];
  for (const q of questions) {
    const value = answers[q.id];
    if (!value) continue;
    const opt = findOption(q, value);
    if (opt?.fact) facts.push(opt.fact);
  }

  const review = uniq(flags.map((f) => reviewByFlag[f]).filter(Boolean));
  return { facts, review };
}

function buildActions(flags, caseId) {
  return actions
    .filter((a) => matchWhen(a.when, flags, caseId))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4)
    .map((a) => ({
      id: a.id,
      label: a.label,
      detail: a.detail,
      priority: a.priority,
      urgent: Boolean(a.urgent),
      cta: Boolean(a.cta),
    }));
}

function buildEvidence(flags, caseId) {
  const rule = evidenceRules.find((r) => matchWhen(r.when, flags, caseId));
  const ids = rule ? rule.prioritize : evidenceDefault;
  // Completa con el resto del catálogo, mantediendo el orden priorizado primero.
  const ordered = uniq([...ids, ...evidenceCatalog.map((e) => e.id)]);
  return ordered
    .map((id) => findEvidence(id))
    .filter(Boolean)
    .map((e, i) => ({ id: e.id, icon: e.icon, label: e.label, help: e.help, priority: i }));
}

function buildLegal(caseId) {
  const c = cases.find((x) => x.id === caseId);
  const idxs = c?.legal || [];
  return idxs
    .map((i) => judgments[i])
    .filter(Boolean)
    .map((j) => ({ code: j.code, plainWhy: j.why, url: j.url }));
}

function buildCta(flags) {
  const hit = urgentFlags.find((f) => flags.includes(f));
  return {
    visible: true,
    urgency: hit ? 'high' : 'normal',
    reason: hit ? urgentReason[hit] : null,
  };
}

/**
 * Genera la orientación a partir del contexto (síncrono internamente).
 * @param {import('./types.js').Context} context
 * @returns {import('./types.js').GuidanceResult}
 */
export function buildGuidance(context) {
  const caseId = context?.caseId ?? null;
  const answers = context?.answers ?? {};
  const flags = deriveFlags(caseId, answers);

  return {
    micro: buildMicro(answers),
    summary: buildSummary(answers, flags),
    actions: buildActions(flags, caseId),
    evidence: buildEvidence(flags, caseId),
    legal: buildLegal(caseId),
    cta: buildCta(flags),
    meta: { source: 'local-rules', version: VERSION },
  };
}

/** Proveedor local que cumple el contrato GuidanceProvider (asíncrono). */
export const localRulesProvider = {
  async getGuidance(context) {
    return buildGuidance(context);
  },
};
