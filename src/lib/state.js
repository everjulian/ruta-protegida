import { cases } from '../data/cases.js';

// -----------------------------------------------------------------------------
// Estado en memoria de la sesión.
// IMPORTANTE (privacidad): este estado vive solo en la pestaña del navegador,
// no se persiste ni se envía a ningún servidor. Se borra al recargar la página.
// -----------------------------------------------------------------------------
export const state = {
  view: 'home',
  step: 1,
  max: 1,
  caseId: null,
  answers: {},
  evidence: new Set(),
  tasks: new Set(),
  returnView: 'home',
};

/** Devuelve el caso actualmente seleccionado (o undefined). */
export const currentCase = () => cases.find((c) => c.id === state.caseId);

/** Genera el resumen orientativo del paso 2 a partir de las respuestas. */
export function signalsSummary() {
  const a = state.answers;
  let msg =
    a.known === 'Sí' && a.timing === 'Después'
      ? 'El orden de los hechos puede ser importante: señalaste que el empleador conocía el diagnóstico y el problema empezó después. Eso merece revisión; no prueba por sí solo discriminación.'
      : a.known === 'No'
        ? 'Señalaste que la empresa no conocía el diagnóstico. Eso no descarta otras vulneraciones; conviene revisar cómo ocurrieron los hechos.'
        : 'Si no sabes quién conocía tu diagnóstico o cuándo, puedes explicarlo así en la consulta. No necesitas completar los vacíos con suposiciones.';
  if (a.changed === 'Sí') msg += ' Compara las funciones, el trato o las evaluaciones que cambiaron.';
  return msg;
}

// Claves requeridas del paso 2 para poder avanzar.
export const REQUIRED_ANSWERS = ['known', 'timing', 'event', 'changed'];

/** ¿Están respondidas todas las preguntas obligatorias del paso 2? */
export const step2Complete = () => REQUIRED_ANSWERS.every((k) => state.answers[k]);
