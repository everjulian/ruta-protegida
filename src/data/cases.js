// -----------------------------------------------------------------------------
// Situaciones (casos) que puede elegir la persona en el paso 1.
//
// Cada caso:
//   id     -> identificador único (no cambiar sin actualizar referencias)
//   title  -> título mostrado en la tarjeta
//   icon   -> clave de icono (ver src/data/icons.js)
//   short  -> etiqueta breve usada en el paso 5
//   desc   -> descripción orientativa
//   list   -> pasos concretos sugeridos
//   next   -> siguiente paso recomendado
//   legal  -> índices de sentencias relacionadas (ver src/data/judgments.js)
// -----------------------------------------------------------------------------
export const cases = [
  {
    id: 'trato',
    title: 'Me tratan diferente desde que conocen mi diagnóstico',
    icon: 'users',
    short: 'Cambios en el trato',
    desc: 'Un cambio de trato puede ser una señal que conviene revisar. Identificar hechos y fechas ayuda a entender si existe una relación con tu diagnóstico.',
    list: [
      'Anota qué cambió y desde cuándo.',
      'Compara funciones y evaluaciones antes y después.',
      'Identifica a quienes presenciaron los hechos.',
    ],
    next: 'Pide orientación para revisar esos cambios y las posibles razones.',
    legal: [0, 1, 2],
  },
  {
    id: 'presion',
    title: 'Me están acosando o presionando',
    icon: 'alert',
    short: 'Acoso o presión',
    desc: 'La presión para renunciar, las amenazas o los comentarios sobre tu diagnóstico merecen atención. No tienes que manejarlo sin apoyo.',
    list: [
      'Guarda mensajes y solicitudes de renuncia.',
      'Anota palabras, fechas y personas presentes.',
      'Pide una copia de cualquier documento que te soliciten firmar.',
    ],
    next: 'Busca orientación antes de firmar una renuncia o un acuerdo que no comprendas.',
    legal: [0, 1],
  },
  {
    id: 'despido',
    title: 'Me quieren despedir',
    icon: 'briefcase',
    short: 'Posible despido',
    desc: 'Vivir con VIH no justifica por sí solo un despido. Los motivos, el conocimiento del empleador y las circunstancias deben revisarse individualmente.',
    list: [
      'Solicita por escrito el motivo que te comunicaron.',
      'Reúne tu contrato, evaluaciones y avisos recibidos.',
      'Conserva una copia y revisa los documentos antes de firmar.',
    ],
    next: 'Contacta a CEPVVS pronto, especialmente si hay una reunión o firma pendiente.',
    legal: [0, 1, 3],
  },
  {
    id: 'despedido',
    title: 'Ya me despidieron',
    icon: 'file',
    short: 'Despido ocurrido',
    desc: 'Un despido relacionado con el diagnóstico puede requerir protección jurídica. Haber recibido un finiquito no permite concluir, por sí solo, que no haya opciones.',
    list: [
      'Anota la fecha de notificación y el último día trabajado.',
      'Guarda el aviso, finiquito y comprobantes de pago.',
      'Ordena las comunicaciones anteriores al despido.',
    ],
    next: 'Solicita orientación cuanto antes para revisar las vías y los plazos aplicables. No necesitas tener toda la evidencia para consultar.',
    legal: [2, 3],
  },
  {
    id: 'salud',
    title: 'Mi salud está afectando algunas tareas',
    icon: 'health',
    short: 'Salud y tareas laborales',
    desc: 'Si existen limitaciones concretas, puede ser necesario revisar ajustes o una reubicación. Tener VIH no implica por sí mismo incapacidad para trabajar.',
    list: [
      'Identifica las tareas que te resultan difíciles.',
      'Consulta a tu equipo de salud sobre limitaciones y recomendaciones.',
      'Conserva solicitudes de permisos o ajustes y sus respuestas.',
    ],
    next: 'Consulta cómo pedir una adaptación adecuada resguardando tu información de salud.',
    legal: [0, 1],
  },
  {
    id: 'privacidad',
    title: 'Compartieron mi diagnóstico sin mi permiso',
    icon: 'eye',
    short: 'Diagnóstico compartido',
    desc: 'La información sobre tu salud es íntima. Su difusión sin autorización puede afectar tus derechos, aunque no exista un despido.',
    list: [
      'Anota quién compartió la información y con quién.',
      'Guarda la publicación o el mensaje en un lugar seguro.',
      'Evita reenviarlo a más personas; consulta cómo pedir que cese la difusión.',
    ],
    next: 'Pide orientación para proteger tu intimidad y revisar las medidas posibles.',
    legal: [1, 2],
  },
  {
    id: 'prueba',
    title: 'Me pidieron información o pruebas sobre VIH',
    icon: 'lock',
    short: 'Solicitud de diagnóstico o prueba',
    desc: 'La Corte ha señalado que no existe una obligación general de revelar al empleador el diagnóstico de VIH. Conviene revisar el propósito y contexto de la solicitud.',
    list: [
      'Guarda la solicitud o anota cómo te la hicieron.',
      'Pregunta por escrito para qué necesitan esa información.',
      'Busca orientación antes de entregar resultados o autorizar su difusión.',
    ],
    next: 'Consulta con CEPVVS cómo responder y proteger tus datos personales.',
    legal: [2],
  },
  {
    id: 'duda',
    title: 'No estoy seguro de si lo que pasó es discriminación',
    icon: 'help',
    short: 'Quiero entender lo que pasó',
    desc: 'No necesitas ponerle un nombre a lo que pasó para pedir ayuda. Empecemos por hechos concretos, sin sacar conclusiones anticipadas.',
    list: [
      'Escribe para ti una secuencia de lo ocurrido.',
      'Distingue lo que observaste de lo que supones.',
      'Identifica documentos o personas que ayuden a aclararlo.',
    ],
    next: 'Conversa con CEPVVS para entender la situación y valorar tus opciones.',
    legal: [0, 1, 2, 3],
  },
];
