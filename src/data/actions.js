// -----------------------------------------------------------------------------
// Acciones concretas para el bloque "Qué puedes hacer ahora".
// getGuidance las filtra por contexto, las ordena por `priority` (mayor = antes)
// y devuelve las más relevantes.
//
//   when   -> condición: { any:true } | { anyFlag:[...] } | { case:'id' }
//   urgent -> resáltala y refuerza el CTA de contacto
//   cta    -> es la acción de "Hablar con CEPVVS"
// -----------------------------------------------------------------------------
export const actions = [
  {
    id: 'no_firmar',
    label: 'No firmes una renuncia o acuerdo que no comprendas',
    detail: 'Antes de firmar, puedes pedir una copia y revisarla con orientación.',
    priority: 95,
    urgent: true,
    when: { anyFlag: ['presion', 'posible_despido', 'despido'] },
  },
  {
    id: 'pedir_motivo_escrito',
    label: 'Pide por escrito el motivo que te comunicaron',
    detail: 'Tener el motivo por escrito ayuda a revisar la situación con claridad.',
    priority: 90,
    when: { anyFlag: ['despido', 'posible_despido'] },
  },
  {
    id: 'guardar_despido',
    label: 'Reúne el aviso, el finiquito y los comprobantes de pago',
    detail: 'Ordénalos junto con las comunicaciones previas al despido.',
    priority: 88,
    when: { anyFlag: ['despido'] },
  },
  {
    id: 'proteger_datos',
    label: 'Evita reenviar la información y consulta cómo pedir que cese la difusión',
    detail: 'Guarda una copia de dónde se difundió o de cómo se solicitó.',
    priority: 82,
    when: { anyFlag: ['divulgacion', 'solicitud_datos'] },
  },
  {
    id: 'guardar_mensajes',
    label: 'Guarda mensajes, correos y solicitudes',
    detail: 'Consérvalos sin alterarlos, en un lugar seguro al que solo tú accedas.',
    priority: 70,
    when: { anyFlag: ['presion', 'divulgacion', 'cambio_funciones'] },
  },
  {
    id: 'consultar_salud',
    label: 'Consulta a tu equipo de salud sobre límites y recomendaciones',
    detail: 'Puede ayudar a valorar una adaptación o reubicación adecuada.',
    priority: 65,
    when: { anyFlag: ['salud'] },
  },
  {
    id: 'ordenar_fechas',
    label: 'Anota fechas, hechos y personas presentes',
    detail: 'Una secuencia clara de lo ocurrido facilita la revisión posterior.',
    priority: 55,
    when: { any: true },
  },
  {
    id: 'contactar_cepvvs',
    label: 'Habla con CEPVVS para orientación jurídica gratuita',
    detail: 'No necesitas tener todos los documentos para consultar.',
    priority: 50,
    cta: true,
    when: { any: true },
  },
];
