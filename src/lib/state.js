import { cases } from '../data/cases.js';
import { phaseOrder } from '../data/phases.js';
import { questionsForCase } from '../data/questions.js';

// -----------------------------------------------------------------------------
// Estado en memoria de la sesión.
// IMPORTANTE (privacidad): este estado vive solo en la pestaña del navegador,
// no se persiste ni se envía a ningún servidor. Se borra al recargar la página.
// -----------------------------------------------------------------------------
export const state = {
  view: 'home', // 'home' | 'route' | 'library' | 'contact'
  phase: 'entender', // fase actual (ver src/data/phases.js)
  maxPhase: 'entender', // fase máxima desbloqueada
  caseId: null,
  answers: {}, // { [questionId]: value }
  evidence: new Set(), // ids de evidencia marcados
  returnView: 'home',
  guidance: null, // último GuidanceResult calculado por getGuidance
};

/** Devuelve el caso actualmente seleccionado (o undefined). */
export const currentCase = () => cases.find((c) => c.id === state.caseId);

/** Índice de una fase dentro del orden Entender→Preparar→Conocer→Actuar. */
export const phaseIndex = (id) => phaseOrder.indexOf(id);

/** ¿La fase `id` ya está desbloqueada? */
export const phaseReachable = (id) => phaseIndex(id) <= phaseIndex(state.maxPhase);

/** ¿Están respondidas todas las preguntas obligatorias del caso actual? */
export function requiredAnswered() {
  if (!state.caseId) return false;
  return questionsForCase(state.caseId)
    .filter((q) => q.required)
    .every((q) => state.answers[q.id]);
}

/** Contexto que se pasa a getGuidance. */
export const guidanceContext = () => ({
  caseId: state.caseId,
  answers: state.answers,
  phase: state.phase,
});
