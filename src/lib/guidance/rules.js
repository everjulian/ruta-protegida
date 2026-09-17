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
  empleador_conocia: { title: 'El empleador conocía el diagnóstico', explanation: 'Puede ser relevante para revisar el contexto. Por sí solo no indica discriminación.' },
  pre_conocimiento: { title: 'El problema venía de antes de que lo conocieran', explanation: 'Conviene distinguir qué cambió y cuándo.' },
  post_conocimiento: { title: 'El problema empezó después de que lo conocieran', explanation: 'El orden de los hechos puede ser relevante para el análisis.' },
  coincide_conocimiento: { title: 'El problema coincidió con que conocieran el diagnóstico', explanation: 'Conviene revisar los hechos cercanos a ese momento.' },
  cambio_funciones: { title: 'Hubo un cambio de funciones o tareas', explanation: 'Conviene compararlas con cómo eran antes.' },
  cambio_trato: { title: 'Cambió el trato de jefes o compañeros', explanation: 'Conviene registrarlo con fechas y testigos.' },
  cambio_evaluaciones: { title: 'Cambiaron tus evaluaciones o reconocimiento', explanation: 'Comparar antes y después puede ayudar.' },
  cambio_condiciones: { title: 'Cambiaron tu horario o condiciones', explanation: 'Conviene documentar cómo y cuándo.' },
  comentarios: { title: 'Hubo comentarios sobre tu salud', explanation: 'Merecen atención; guardar registro puede ayudar.' },
  presion_renuncia: { title: 'Hay presión para renunciar', explanation: 'No tienes que decidir una renuncia bajo presión ni sin orientación.' },
  amenaza: { title: 'Hubo amenazas o sanciones', explanation: 'Conviene documentarlas con fecha y detalle.' },
  aislamiento: { title: 'Hay aislamiento o exclusión', explanation: 'También es un hecho que puede registrarse.' },
  firma_proxima: { title: 'Hay un documento pendiente de firma', explanation: 'No conviene firmar sin revisarlo con orientación.' },
  reunion_proxima: { title: 'Hay una reunión o fecha próxima', explanation: 'Prepararte con tiempo ayuda.' },
  motivo_escrito: { title: 'Te comunicaron un motivo por escrito', explanation: 'Ese documento es importante; consérvalo.' },
  motivo_verbal: { title: 'El motivo fue solo verbal', explanation: 'Puedes pedir que te lo comuniquen por escrito.' },
  sin_motivo: { title: 'No te dieron un motivo claro', explanation: 'La ausencia de motivo es un dato que conviene registrar.' },
  despido: { title: 'Se produjo un despido', explanation: 'Conviene revisar los motivos y los plazos aplicables.' },
  despido_reciente: { title: 'El despido es reciente', explanation: 'Los plazos pueden importar; conviene consultar pronto.' },
  posible_despido: { title: 'Hay un posible despido en curso', explanation: 'Conviene prepararte antes de una reunión o firma.' },
  firmo_finiquito: { title: 'Ya firmaste el finiquito', explanation: 'Haberlo firmado no cierra, por sí solo, la posibilidad de orientarte.' },
  no_firmo: { title: 'Te dieron un documento y no lo firmaste', explanation: 'Antes de firmar, conviene revisarlo con orientación.' },
  divulgacion: { title: 'Se difundió o solicitó información de tu salud', explanation: 'Toca tu intimidad; conviene documentar cómo ocurrió.' },
  divulgacion_publica: { title: 'Tu diagnóstico quedó visible o se publicó', explanation: 'Guarda una captura y consulta cómo pedir que se retire.' },
  divulgacion_escrita: { title: 'La difusión quedó por escrito', explanation: 'Consérvalo sin reenviarlo a más personas.' },
  sabe_quien: { title: 'Sabes quién compartió la información', explanation: 'Es un dato relevante para revisar lo ocurrido.' },
  solicitud_datos: { title: 'Te solicitaron datos de salud', explanation: 'Conviene revisar con qué finalidad se pidió.' },
  solicitud_prueba: { title: 'Te pidieron una prueba de VIH', explanation: 'Conviene revisar el propósito antes de realizarla.' },
  solicitud_revelar: { title: 'Te pidieron revelar tu diagnóstico', explanation: 'No existe una obligación general de revelarlo al empleador.' },
  insisten: { title: 'Insisten pese a tu negativa', explanation: 'Conviene buscar orientación cuanto antes.' },
  salud: { title: 'Tu salud afecta algunas tareas', explanation: 'Puede valorarse una adaptación o reubicación.' },
  necesita_permisos: { title: 'Necesitas permisos para tu tratamiento', explanation: 'Pueden gestionarse; guarda las solicitudes.' },
  sabe_ajuste_sin_diagnostico: { title: 'Pediste ajustes sin revelar el diagnóstico', explanation: 'Puedes proteger tu información de salud al pedirlos.' },
  sin_respuesta: { title: 'No hubo respuesta a tu solicitud', explanation: 'La falta de respuesta también es un dato para anotar.' },
  reciente: { title: 'Los hechos son recientes', explanation: 'Ordenar lo ocurrido ahora ayuda a revisarlo con claridad.' },
};

// Orden = prioridad: el primero presente define el motivo de urgencia del CTA.
const urgentFlags = [
  'firma_proxima',
  'despido_reciente',
  'despido',
  'presion_renuncia',
  'amenaza',
  'presion',
  'divulgacion',
  'solicitud_revelar',
  'solicitud_prueba',
  'solicitud_datos',
  'insisten',
  'reunion_proxima',
  'posible_despido',
];
const urgentReason = {
  firma_proxima: 'Hay un documento pendiente de firma; conviene orientación antes de firmar.',
  despido_reciente: 'El despido es reciente; conviene orientación pronto por los plazos.',
  despido: 'Hay un despido de por medio; conviene orientación pronto.',
  presion_renuncia: 'Hay presión para renunciar; no tienes que decidirlo sin apoyo.',
  amenaza: 'Hay amenazas o sanciones; conviene orientación pronto.',
  presion: 'Hay presión o acoso; no tienes que manejarlo sin apoyo.',
  divulgacion: 'Se difundió información de tu salud; conviene actuar pronto.',
  solicitud_revelar: 'Te piden revelar tu diagnóstico; conviene revisarlo antes de responder.',
  solicitud_prueba: 'Te piden una prueba de VIH; conviene revisar el propósito.',
  solicitud_datos: 'Te solicitaron datos de salud; conviene revisarlo antes de responder.',
  insisten: 'Insisten pese a tu negativa; conviene orientación cuanto antes.',
  reunion_proxima: 'Hay una reunión o fecha próxima; conviene prepararte con tiempo.',
  posible_despido: 'Puede haber un despido o una firma próxima.',
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
