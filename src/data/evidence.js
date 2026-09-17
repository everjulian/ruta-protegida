// -----------------------------------------------------------------------------
// Evidencia: catálogo + reglas de priorización adaptativa por caso/flags.
// (Sustituye a la lista global fija; ahora se adapta a la situación.)
// -----------------------------------------------------------------------------

// Catálogo de tipos de evidencia. `id` estable; `icon` en src/data/icons.js.
export const evidenceCatalog = [
  { id: 'correos', icon: 'mail', label: 'Correos', help: 'Comunicaciones por correo con la empresa.' },
  { id: 'mensajes', icon: 'message', label: 'Mensajes', help: 'Chats o mensajes relevantes (sin alterarlos).' },
  { id: 'memorandos', icon: 'file', label: 'Memorandos', help: 'Avisos o comunicados internos que recibiste.' },
  { id: 'evaluaciones', icon: 'briefcase', label: 'Evaluaciones de desempeño', help: 'Para comparar antes y después del cambio.' },
  { id: 'descripcion_puesto', icon: 'file', label: 'Descripción del puesto', help: 'Funciones formales de tu cargo.' },
  { id: 'comunicaciones_cambio', icon: 'mail', label: 'Comunicaciones del cambio', help: 'Dónde y cómo te informaron el cambio.' },
  { id: 'fechas', icon: 'calendar', label: 'Fechas importantes', help: 'Cuándo ocurrió cada hecho.' },
  { id: 'testigos', icon: 'users', label: 'Testigos', help: 'Quiénes presenciaron los hechos.' },
  { id: 'permisos_medicos', icon: 'health', label: 'Permisos médicos', help: 'Solicitudes de permisos o ajustes y sus respuestas.' },
  { id: 'documentos_despido', icon: 'folder', label: 'Documentos de despido', help: 'Aviso de terminación y notificaciones.' },
  { id: 'finiquito', icon: 'file', label: 'Finiquito y pagos', help: 'Finiquito y comprobantes de pago.' },
  { id: 'solicitud_datos', icon: 'lock', label: 'Solicitud de datos de salud', help: 'La solicitud o el registro de cómo te la hicieron.' },
  { id: 'recomendacion_medica', icon: 'health', label: 'Recomendaciones médicas', help: 'Indicaciones de tu equipo de salud sobre tus tareas.' },
];

// Reglas de priorización: la primera coincidencia ordena la lista.
// `when`: { any } | { anyFlag:[...] } | { case:'id' }
// Se evalúan en orden: la primera coincidencia define la prioridad.
export const evidenceRules = [
  {
    when: { anyFlag: ['despido'] },
    prioritize: ['documentos_despido', 'finiquito', 'correos', 'fechas'],
  },
  {
    when: { anyFlag: ['posible_despido'] },
    prioritize: ['memorandos', 'correos', 'comunicaciones_cambio', 'fechas'],
  },
  {
    when: { anyFlag: ['divulgacion', 'solicitud_datos', 'solicitud_prueba', 'solicitud_revelar', 'solicitud_historia'] },
    prioritize: ['mensajes', 'correos', 'solicitud_datos', 'testigos'],
  },
  {
    when: { anyFlag: ['presion', 'firma_proxima', 'amenaza'] },
    prioritize: ['mensajes', 'correos', 'testigos', 'fechas'],
  },
  {
    when: { anyFlag: ['cambio_evaluaciones'] },
    prioritize: ['evaluaciones', 'correos', 'fechas', 'testigos'],
  },
  {
    when: { anyFlag: ['cambio_trato'] },
    prioritize: ['testigos', 'mensajes', 'correos', 'fechas'],
  },
  {
    when: { anyFlag: ['cambio_funciones', 'cambio_condiciones'] },
    prioritize: ['evaluaciones', 'descripcion_puesto', 'comunicaciones_cambio', 'fechas'],
  },
  {
    when: { anyFlag: ['salud', 'necesita_permisos'] },
    prioritize: ['recomendacion_medica', 'permisos_medicos', 'fechas'],
  },
];

// Evidencia por defecto cuando ninguna regla coincide.
export const evidenceDefault = ['correos', 'mensajes', 'fechas', 'testigos'];

/** Busca un item del catálogo por id. */
export const findEvidence = (id) => evidenceCatalog.find((e) => e.id === id) || null;
