// -----------------------------------------------------------------------------
// Contratos (JSDoc) de getGuidance. Sirven de documentación y de tipos para el
// editor. No generan código en tiempo de ejecución.
// -----------------------------------------------------------------------------

/**
 * @typedef {Object} Context
 * @property {string|null} caseId            Situación elegida (id de cases.js).
 * @property {Record<string,string>} answers Respuestas por id de pregunta.
 * @property {('entender'|'preparar'|'conocer'|'actuar')} phase  Fase actual.
 * @property {string[]} [flags]              Etiquetas ya derivadas (opcional; se recalculan).
 * @property {string} [locale]               Idioma, p. ej. 'es-EC' (para IA futura).
 */

/**
 * @typedef {Object} MicroFeedback
 * @property {string} questionId
 * @property {string} text
 */

/**
 * @typedef {Object} GuidanceSummary
 * @property {string[]} facts   Solo hechos seleccionados (sin concluir).
 * @property {string[]} review  Qué conviene revisar.
 */

/**
 * @typedef {Object} GuidanceAction
 * @property {string} id
 * @property {string} label
 * @property {string} detail
 * @property {number} priority
 * @property {boolean} urgent
 * @property {boolean} cta
 */

/**
 * @typedef {Object} GuidanceEvidence
 * @property {string} id
 * @property {string} icon
 * @property {string} label
 * @property {string} help
 * @property {number} priority   0 = más prioritario.
 */

/**
 * @typedef {Object} GuidanceLegal
 * @property {string} code
 * @property {string} plainWhy
 * @property {string} url
 */

/**
 * @typedef {Object} GuidanceCta
 * @property {boolean} visible
 * @property {('normal'|'high')} urgency
 * @property {string|null} reason
 */

/**
 * @typedef {Object} GuidanceResult
 * @property {MicroFeedback[]} micro
 * @property {GuidanceSummary|null} summary
 * @property {GuidanceAction[]} actions
 * @property {GuidanceEvidence[]} evidence
 * @property {GuidanceLegal[]} legal
 * @property {GuidanceCta} cta
 * @property {{source:('local-rules'|'ai'), version:string}} meta
 */

/**
 * Contrato que debe cumplir cualquier proveedor de orientación.
 * El proveedor local resuelve al instante; uno de IA podría hacer red.
 * @typedef {Object} GuidanceProvider
 * @property {(ctx: Context) => Promise<GuidanceResult>} getGuidance
 */

export {};
