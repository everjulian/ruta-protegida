// -----------------------------------------------------------------------------
// Preguntas del recorrido (antes estaban escritas a mano dentro de route.js).
//
// Cada pregunta:
//   id        -> clave de la respuesta en state.answers
//   phase     -> fase a la que pertenece
//   prompt    -> texto de la pregunta
//   appliesTo -> '*' (todas) o lista de caseId a los que aplica
//   required  -> si es obligatoria para avanzar
//   options[] -> cada opción con:
//        value -> texto visible / valor guardado
//        flags -> etiquetas que alimentan las reglas de getGuidance
//        micro -> microrespuesta contextual (1–3 líneas), lenguaje prudente
//        fact  -> (opcional) frase para el bloque "Lo que identificamos"
// -----------------------------------------------------------------------------
export const questions = [
  {
    id: 'known',
    phase: 'entender',
    prompt: '¿La empresa conocía tu diagnóstico?',
    appliesTo: '*',
    required: true,
    options: [
      {
        value: 'Sí',
        flags: ['empleador_conocia'],
        micro: 'Que el empleador conociera tu diagnóstico puede ser un dato relevante para revisar el contexto. Por sí solo no indica discriminación.',
        fact: 'El empleador conocía tu diagnóstico.',
      },
      {
        value: 'No',
        flags: ['empleador_no_conocia'],
        micro: 'Aunque no lo conocieran, pueden existir otras situaciones que conviene revisar.',
        fact: 'El empleador no conocía tu diagnóstico.',
      },
      {
        value: 'No estoy seguro',
        flags: [],
        micro: 'No pasa nada si no lo sabes con certeza; puedes explicarlo así en la consulta.',
      },
    ],
  },
  {
    id: 'timing',
    phase: 'entender',
    prompt: '¿Cuándo empezó el problema respecto a que lo conocieran?',
    appliesTo: '*',
    required: true,
    options: [
      {
        value: 'Antes',
        flags: ['pre_conocimiento'],
        micro: 'Si el problema venía de antes, conviene distinguir qué cambió y cuándo.',
        fact: 'El problema habría empezado antes de que conocieran el diagnóstico.',
      },
      {
        value: 'Después',
        flags: ['post_conocimiento'],
        micro: 'Que el problema apareciera después puede ser relevante para entender el orden de los hechos. No es, por sí mismo, una conclusión.',
        fact: 'El problema habría empezado después de que conocieran el diagnóstico.',
      },
      {
        value: 'Al mismo tiempo',
        flags: ['coincide_conocimiento'],
        micro: 'La coincidencia en el tiempo puede ser un dato a revisar junto con otros hechos.',
        fact: 'El problema coincidió con que conocieran el diagnóstico.',
      },
      {
        value: 'No lo conocían',
        flags: ['empleador_no_conocia'],
        micro: 'Si no lo conocían, conviene enfocar la revisión en otros aspectos de lo ocurrido.',
        fact: 'La empresa no conocía el diagnóstico.',
      },
      {
        value: 'No estoy seguro',
        flags: [],
        micro: 'Está bien no tener claras las fechas; se pueden reconstruir después.',
      },
    ],
  },
  {
    id: 'event',
    phase: 'entender',
    prompt: '¿Qué ocurrió concretamente?',
    appliesTo: '*',
    required: true,
    options: [
      {
        value: 'Comentarios o presión',
        flags: ['presion'],
        micro: 'Los comentarios o la presión merecen atención; guardar registro puede ayudar.',
        fact: 'Situación señalada: comentarios o presión.',
      },
      {
        value: 'Cambio de tareas o trato',
        flags: ['cambio_funciones'],
        micro: 'Un cambio de funciones o trato conviene compararlo con cómo era antes.',
        fact: 'Situación señalada: cambio de tareas o trato.',
      },
      {
        value: 'Aviso o despido',
        flags: ['despido'],
        micro: 'Ante un aviso o despido, conviene revisar motivos y plazos con orientación.',
        fact: 'Situación señalada: aviso o despido.',
      },
      {
        value: 'Difusión o solicitud de datos',
        flags: ['divulgacion'],
        micro: 'La difusión o solicitud de datos de salud toca tu intimidad; conviene revisarla.',
        fact: 'Situación señalada: difusión o solicitud de datos.',
      },
      {
        value: 'Dificultad por salud',
        flags: ['salud'],
        micro: 'Si hay limitaciones concretas, puede valorarse una adaptación o reubicación.',
        fact: 'Situación señalada: dificultad por salud.',
      },
      {
        value: 'Otro / no estoy seguro',
        flags: [],
        micro: 'Puedes describirlo con tus palabras en la consulta; no necesitas encuadrarlo.',
      },
    ],
  },
  {
    id: 'changed',
    phase: 'entender',
    prompt: '¿Hubo cambios en funciones, trato, evaluaciones o estabilidad?',
    appliesTo: '*',
    required: true,
    options: [
      {
        value: 'Sí',
        flags: ['hubo_cambios'],
        micro: 'Los cambios concretos (funciones, evaluaciones, trato) son útiles para revisar la situación.',
        fact: 'Se reportaron cambios en funciones, trato, evaluaciones o estabilidad.',
      },
      {
        value: 'No',
        flags: [],
        micro: 'Aun sin cambios visibles, otros hechos pueden ser relevantes.',
        fact: 'No se reportaron cambios en funciones o trato.',
      },
      {
        value: 'No estoy seguro',
        flags: [],
        micro: 'Puedes anotar lo que recuerdes; no hace falta certeza total.',
      },
    ],
  },
];

/** Devuelve las preguntas aplicables a un caso dado (o todas si no hay caso). */
export function questionsForCase(caseId) {
  return questions.filter((q) => q.appliesTo === '*' || q.appliesTo.includes(caseId));
}

/** Busca la opción elegida de una pregunta por su valor. */
export function findOption(question, value) {
  return question.options.find((o) => o.value === value) || null;
}
