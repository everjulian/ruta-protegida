// -----------------------------------------------------------------------------
// Proveedor determinístico local de orientación (fuente de verdad + fallback).
// Produce SIEMPRE la forma unificada v2 que también genera la IA, para que la
// interfaz renderice igual venga de reglas o del modelo.
//
// No hace red ni envía datos: todo se calcula en el dispositivo.
// -----------------------------------------------------------------------------
import { cases } from '../../data/cases.js';
import { questions, findOption } from '../../data/questions.js';
import { judgments } from '../../data/judgments.js';
import {
  evidenceRules,
  evidenceDefault,
  evidenceCatalog,
  findEvidence,
} from '../../data/evidence.js';
import { actions } from '../../data/actions.js';

const VERSION = '2.0.0';
export const DISCLAIMER =
  'Esta orientación es informativa y no reemplaza asesoría jurídica profesional.';
const CTA_MESSAGE =
  'Cuéntanos tu situación y te orientamos gratis; no necesitas tener todos los documentos.';

// Etiquetas que aporta el caso elegido (además de las respuestas).
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

// Título + explicación de cada posible "indicio" (para la sección de señales).
const signalByFlag = {
  empleador_conocia: {
    title: 'El empleador conocía el diagnóstico',
    explanation:
      'Puede ser relevante para revisar el contexto. Por sí solo no indica discriminación.',
  },
  post_conocimiento: {
    title: 'El problema empezó después de que lo conocieran',
    explanation: 'El orden de los hechos puede ser relevante para el análisis.',
  },
  coincide_conocimiento: {
    title: 'El problema coincidió con que conocieran el diagnóstico',
    explanation: 'Conviene revisar los hechos cercanos a ese momento junto con otros datos.',
  },
  cambio_funciones: {
    title: 'Hubo un cambio de funciones o trato',
    explanation: 'Conviene comparar tus funciones y evaluaciones antes y después.',
  },
  despido: {
    title: 'Se produjo un despido',
    explanation: 'Conviene revisar los motivos comunicados y los plazos aplicables.',
  },
  posible_despido: {
    title: 'Hay un posible despido en curso',
    explanation: 'Conviene prepararse antes de cualquier reunión o firma.',
  },
  presion: {
    title: 'Hubo presión o comentarios',
    explanation: 'Guardar registro de mensajes y reuniones puede ayudar.',
  },
  divulgacion: {
    title: 'Se difundió o solicitó información de salud',
    explanation: 'Toca tu intimidad; conviene documentar cómo ocurrió.',
  },
  solicitud_datos: {
    title: 'Te solicitaron datos de salud',
    explanation: 'Conviene revisar con qué finalidad se pidió esa información.',
  },
  salud: {
    title: 'La salud afecta algunas tareas',
    explanation: 'Puede valorarse una adaptación o reubicación adecuada.',
  },
  hubo_cambios: {
    title: 'Hubo cambios en trato o evaluaciones',
    explanation: 'Detallar qué cambió y desde cuándo ayuda a revisarlo.',
  },
};

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

function buildSignals(flags, answered) {
  if (answered < 2) return [];
  const ordered = [
    ...urgentFlags.filter((f) => flags.includes(f)),
    ...flags.filter((f) => !urgentFlags.includes(f)),
  ];
  const out = [];
  for (const f of ordered) {
    const s = signalByFlag[f];
    if (s) out.push({ title: s.title, explanation: s.explanation, sourceId: null, sourceUrl: null });
    if (out.length >= 3) break;
  }
  return out;
}

function priorityLabel(a) {
  if (a.urgent) return 'alta';
  if (a.priority >= 70) return 'media';
  return 'baja';
}

function buildActions(flags, caseId) {
  return actions
    .filter((a) => matchWhen(a.when, flags, caseId))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4)
    .map((a) => ({ priority: priorityLabel(a), text: a.label, detail: a.detail, cta: Boolean(a.cta) }));
}

function buildEvidence(flags, caseId) {
  const rule = evidenceRules.find((r) => matchWhen(r.when, flags, caseId));
  const ids = rule ? rule.prioritize : evidenceDefault;
  const ordered = uniq([...ids, ...evidenceCatalog.map((e) => e.id)]);
  return ordered
    .map((id) => findEvidence(id))
    .filter(Boolean)
    .map((e, i) => ({ id: e.id, icon: e.icon, label: e.label, help: e.help, priority: i }));
}

function buildLegal(caseId) {
  const c = cases.find((x) => x.id === caseId);
  return (c?.legal || [])
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
    message: CTA_MESSAGE,
  };
}

/**
 * Genera la orientación (forma v2) a partir del contexto.
 * @param {import('./types.js').Context} context
 */
export function buildGuidance(context) {
  const caseId = context?.caseId ?? null;
  const answers = context?.answers ?? {};
  const answered = Object.keys(answers).filter((k) => answers[k]).length;
  const flags = deriveFlags(caseId, answers);

  return {
    intro:
      answered >= 2
        ? 'Con lo que compartiste podemos ordenar algunos hechos y ver qué conviene revisar. Es orientación informativa, no una conclusión.'
        : null,
    signals: buildSignals(flags, answered),
    actions: buildActions(flags, caseId),
    evidence: buildEvidence(flags, caseId),
    legal: buildLegal(caseId),
    cta: buildCta(flags),
    note: DISCLAIMER,
    meta: { source: 'local-rules', version: VERSION },
  };
}

/** Proveedor local que cumple el contrato GuidanceProvider (asíncrono). */
export const localRulesProvider = {
  async getGuidance(context) {
    return buildGuidance(context);
  },
};
