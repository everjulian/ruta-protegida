// -----------------------------------------------------------------------------
// Protecciones mostradas en el paso 4.
// Estructura de cada fila (arreglo posicional):
//   [0] icon   -> clave de icono
//   [1] title  -> título
//   [2] desc   -> descripción
//   [3] why    -> "por qué es importante"
//   [4] action -> "qué podrías hacer"
//   [5] legal  -> índice de sentencia relacionada (-1 = enlaza al servicio CEPVVS)
// -----------------------------------------------------------------------------
export const protections = [
  [
    'scale',
    'No discriminación',
    'Tu diagnóstico no debe ser la razón de un trato laboral perjudicial.',
    'Permite revisar decisiones que puedan estar relacionadas con tu salud.',
    'Anota hechos, fechas y cambios concretos.',
    3,
  ],
  [
    'lock',
    'Confidencialidad',
    'Tu información de salud pertenece a tu vida privada.',
    'Compartirla puede afectar tu intimidad y requiere un análisis del contexto.',
    'Conserva evidencia de cómo se obtuvo o difundió.',
    1,
  ],
  [
    'shield',
    'Estabilidad laboral reforzada',
    'Existen protecciones frente a desvinculaciones relacionadas con el VIH.',
    'No equivale a una garantía absoluta de permanencia; deben revisarse los motivos.',
    'Pide orientación para evaluar tu situación.',
    3,
  ],
  [
    'briefcase',
    'Adaptación o reubicación',
    'Si la salud limita tareas, puede ser necesario valorar alternativas laborales.',
    'Ayuda a revisar si se consideró una reubicación antes de desvincular.',
    'Reúne recomendaciones médicas sobre tus tareas.',
    0,
  ],
  [
    'heart',
    'Atención prioritaria',
    'La jurisprudencia reconoce protección especial en situaciones de vulnerabilidad por salud.',
    'Tus necesidades deben valorarse en su contexto.',
    'Consulta qué protección corresponde en tu caso.',
    2,
  ],
  [
    'message',
    'Orientación jurídica',
    'CEPVVS ofrece apoyo legal gratuito.',
    'Puedes revisar tus opciones con acompañamiento.',
    'No esperes a tener todos los documentos para consultar.',
    -1,
  ],
];

// -----------------------------------------------------------------------------
// Tipos de evidencia sugeridos en el paso 3: [icono, etiqueta].
// -----------------------------------------------------------------------------
export const evidence = [
  ['mail', 'Correos'],
  ['message', 'Mensajes'],
  ['file', 'Memorandos'],
  ['briefcase', 'Evaluaciones'],
  ['calendar', 'Fechas importantes'],
  ['users', 'Testigos'],
  ['health', 'Permisos médicos'],
  ['folder', 'Documentos de despido'],
];
