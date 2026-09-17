// -----------------------------------------------------------------------------
// Preguntas del recorrido, ESPECÍFICAS por caso.
//
// Cada pregunta:
//   id        -> clave única (prefijo del caso) usada en state.answers
//   phase     -> fase a la que pertenece (siempre 'entender')
//   prompt    -> texto de la pregunta
//   appliesTo -> lista de caseId a los que aplica
//   required  -> si es obligatoria para avanzar
//   options[] -> cada opción con:
//        value -> texto visible / valor guardado
//        flags -> etiquetas que alimentan las reglas de getGuidance
//        micro -> microrespuesta contextual (1–3 líneas), lenguaje prudente
// -----------------------------------------------------------------------------

const q = (id, prompt, appliesTo, options) => ({
  id,
  phase: 'entender',
  prompt,
  appliesTo,
  required: true,
  options,
});

export const questions = [
  // === 1. Me tratan diferente desde que conocen mi diagnóstico (trato) =======
  q('trato_known', '¿La empresa conocía tu diagnóstico cuando cambió el trato?', ['trato'], [
    { value: 'Sí', flags: ['empleador_conocia'], micro: 'Que lo conocieran puede ser relevante para revisar el contexto. Por sí solo no indica discriminación.' },
    { value: 'No', flags: ['empleador_no_conocia'], micro: 'Aunque no lo conocieran, otros hechos pueden ser relevantes.' },
    { value: 'No estoy seguro', flags: [], micro: 'Está bien no saberlo; puedes explicarlo así en la consulta.' },
  ]),
  q('trato_que', '¿Qué cambió principalmente?', ['trato'], [
    { value: 'Mis funciones o tareas', flags: ['cambio_funciones'], micro: 'Un cambio de funciones conviene compararlo con cómo era antes.' },
    { value: 'El trato de jefes o compañeros', flags: ['cambio_trato'], micro: 'Los cambios en el trato pueden registrarse con fechas y testigos.' },
    { value: 'Mis evaluaciones o reconocimiento', flags: ['cambio_evaluaciones'], micro: 'Comparar evaluaciones antes y después puede ayudar.' },
    { value: 'Mi horario o condiciones', flags: ['cambio_condiciones'], micro: 'Los cambios de horario o condiciones conviene documentarlos.' },
    { value: 'Varias cosas', flags: ['cambio_funciones', 'cambio_trato'], micro: 'Si cambiaron varias cosas, anótalas por separado con sus fechas.' },
  ]),
  q('trato_timing', '¿Cuándo empezó el cambio respecto a que conocieran tu diagnóstico?', ['trato'], [
    { value: 'Antes', flags: ['pre_conocimiento'], micro: 'Si venía de antes, conviene distinguir qué cambió y cuándo.' },
    { value: 'Después', flags: ['post_conocimiento'], micro: 'Que empezara después puede ser relevante para el orden de los hechos. No es una conclusión.' },
    { value: 'Al mismo tiempo', flags: ['coincide_conocimiento'], micro: 'La coincidencia en el tiempo es un dato a revisar junto con otros.' },
    { value: 'No lo conocían', flags: ['empleador_no_conocia'], micro: 'Si no lo conocían, conviene enfocar la revisión en otros aspectos.' },
    { value: 'No estoy seguro', flags: [], micro: 'Está bien no tener claras las fechas; se pueden reconstruir.' },
  ]),
  q('trato_registro', '¿El cambio quedó registrado de alguna forma?', ['trato'], [
    { value: 'Sí, por escrito (correo/memo)', flags: ['registro_escrito'], micro: 'Tener algo por escrito facilita mucho la revisión.' },
    { value: 'Solo verbal', flags: ['registro_verbal'], micro: 'Aunque sea verbal, anota fecha, lugar y quién estuvo presente.' },
    { value: 'No estoy seguro', flags: [], micro: 'Puedes empezar por anotar lo que recuerdes.' },
  ]),

  // === 2. Me están acosando o presionando (presion) =========================
  q('presion_tipo', '¿Qué tipo de presión estás viviendo?', ['presion'], [
    { value: 'Comentarios o burlas sobre mi salud', flags: ['presion', 'comentarios'], micro: 'Los comentarios sobre tu salud merecen atención; guardar registro puede ayudar.' },
    { value: 'Presión para renunciar', flags: ['presion', 'presion_renuncia'], micro: 'No tienes que decidir una renuncia bajo presión ni sin orientación.' },
    { value: 'Amenazas o sanciones', flags: ['presion', 'amenaza'], micro: 'Las amenazas o sanciones conviene documentarlas con fecha y detalle.' },
    { value: 'Aislamiento o exclusión', flags: ['presion', 'aislamiento'], micro: 'El aislamiento también es un hecho que puede registrarse.' },
    { value: 'Varias', flags: ['presion', 'presion_renuncia', 'comentarios'], micro: 'Anota cada situación por separado, con su fecha.' },
  ]),
  q('presion_firmar', '¿Te han pedido que firmes algo (renuncia, acuerdo)?', ['presion'], [
    { value: 'Sí, ya me lo pidieron', flags: ['firma_proxima'], micro: 'Antes de firmar, puedes pedir una copia y revisarla con orientación.' },
    { value: 'Me lo insinuaron', flags: ['firma_posible'], micro: 'Si te insinúan firmar, conviene prepararte antes.' },
    { value: 'No', flags: [], micro: 'Si te piden firmar algo, guárdalo y no lo firmes sin entenderlo.' },
    { value: 'No estoy seguro', flags: [], micro: 'Ante cualquier documento para firmar, pide una copia primero.' },
  ]),
  q('presion_registro', '¿Guardas algún registro de esos hechos?', ['presion'], [
    { value: 'Sí, tengo mensajes o correos', flags: ['registro_escrito'], micro: 'Consérvalos sin alterarlos, en un lugar seguro.' },
    { value: 'Hay personas que lo presenciaron', flags: ['tiene_testigos'], micro: 'Anota quiénes estuvieron presentes en cada hecho.' },
    { value: 'No tengo registro aún', flags: ['sin_registro'], micro: 'Puedes empezar hoy anotando fechas y lo que recuerdes.' },
  ]),
  q('presion_fecha', '¿Hay una reunión o fecha límite próxima?', ['presion'], [
    { value: 'Sí, muy pronto', flags: ['reunion_proxima'], micro: 'Si hay algo muy próximo, conviene buscar orientación cuanto antes.' },
    { value: 'En los próximos días/semanas', flags: ['reunion_proxima'], micro: 'Con una fecha cerca, prepararte con tiempo ayuda.' },
    { value: 'No', flags: [], micro: 'Aun sin fecha próxima, puedes ir ordenando lo ocurrido.' },
    { value: 'No estoy seguro', flags: [], micro: 'Si aparece una fecha, indícalo al equipo de CEPVVS.' },
  ]),

  // === 3. Me quieren despedir (despido) =====================================
  q('despido_motivo', '¿Te comunicaron un motivo?', ['despido'], [
    { value: 'Sí, por escrito', flags: ['motivo_escrito'], micro: 'Guarda ese documento; el motivo por escrito es importante.' },
    { value: 'Sí, solo verbal', flags: ['motivo_verbal'], micro: 'Puedes pedir que te comuniquen el motivo por escrito.' },
    { value: 'No me han dado motivo', flags: ['sin_motivo'], micro: 'La falta de un motivo claro es un dato que conviene anotar.' },
    { value: 'No estoy seguro', flags: [], micro: 'Puedes pedir por escrito la razón que te comunicaron.' },
  ]),
  q('despido_known', '¿La empresa conoce tu diagnóstico?', ['despido'], [
    { value: 'Sí', flags: ['empleador_conocia'], micro: 'Que lo conozcan puede ser relevante para revisar el contexto.' },
    { value: 'No', flags: ['empleador_no_conocia'], micro: 'Aunque no lo conozcan, otros hechos pueden ser relevantes.' },
    { value: 'No estoy seguro', flags: [], micro: 'No necesitas confirmarlo para pedir orientación.' },
  ]),
  q('despido_firma', '¿Hay algo pendiente de firmar o una reunión próxima?', ['despido'], [
    { value: 'Sí, una firma o renuncia', flags: ['firma_proxima'], micro: 'No firmes una renuncia o acuerdo sin revisarlo con orientación.' },
    { value: 'Una reunión', flags: ['reunion_proxima'], micro: 'Puedes prepararte antes de esa reunión.' },
    { value: 'No por ahora', flags: [], micro: 'Aun así, conviene reunir tus documentos por si acaso.' },
    { value: 'No estoy seguro', flags: [], micro: 'Si aparece una firma o reunión, indícalo al equipo.' },
  ]),
  q('despido_docs', '¿Tienes tu contrato y comunicaciones a la mano?', ['despido'], [
    { value: 'Sí', flags: ['tiene_contrato'], micro: 'Tenerlos ordenados facilita la revisión.' },
    { value: 'Parcialmente', flags: ['tiene_contrato_parcial'], micro: 'Reúne lo que puedas; no necesitas todo para consultar.' },
    { value: 'No', flags: ['sin_registro'], micro: 'Puedes solicitar copia de tu contrato y comunicaciones.' },
    { value: 'No estoy seguro', flags: [], micro: 'Empieza por juntar lo que tengas a mano.' },
  ]),

  // === 4. Ya me despidieron (despedido) =====================================
  q('despedido_cuando', '¿Hace cuánto te despidieron?', ['despedido'], [
    { value: 'Esta semana', flags: ['despido_reciente'], micro: 'Los plazos pueden importar; conviene consultar pronto.' },
    { value: 'Este mes', flags: ['despido_reciente'], micro: 'Aún es reciente; hay pasos que conviene no demorar.' },
    { value: 'Hace más de un mes', flags: ['despido_antiguo'], micro: 'Aunque haya pasado tiempo, consultar sigue siendo útil.' },
    { value: 'No recuerdo exacto', flags: [], micro: 'Anota la fecha aproximada; se puede precisar después.' },
  ]),
  q('despedido_motivo', '¿Te dieron un motivo?', ['despedido'], [
    { value: 'Por escrito', flags: ['motivo_escrito'], micro: 'Guarda ese documento en un lugar seguro.' },
    { value: 'Solo verbal', flags: ['motivo_verbal'], micro: 'Anota qué te dijeron, cuándo y quién.' },
    { value: 'Ninguno', flags: ['sin_motivo'], micro: 'La ausencia de motivo es un dato que conviene registrar.' },
    { value: 'No estoy seguro', flags: [], micro: 'Puedes reconstruir lo que recuerdes de la notificación.' },
  ]),
  q('despedido_known', '¿La empresa conocía tu diagnóstico antes del despido?', ['despedido'], [
    { value: 'Sí', flags: ['empleador_conocia'], micro: 'Que lo conocieran antes puede ser relevante para el análisis.' },
    { value: 'No', flags: ['empleador_no_conocia'], micro: 'Aunque no lo conocieran, otros hechos pueden importar.' },
    { value: 'No estoy seguro', flags: [], micro: 'No necesitas confirmarlo para consultar.' },
  ]),
  q('despedido_finiquito', '¿Firmaste el finiquito o algún documento?', ['despedido'], [
    { value: 'Ya firmé', flags: ['firmo_finiquito'], micro: 'Haber firmado no cierra, por sí solo, la posibilidad de orientarte.' },
    { value: 'Me lo dieron, pero no firmé', flags: ['no_firmo'], micro: 'Antes de firmar, conviene revisarlo con orientación.' },
    { value: 'No', flags: ['sin_finiquito'], micro: 'Guarda cualquier documento que te entreguen.' },
    { value: 'No estoy seguro', flags: [], micro: 'Revisa si te entregaron algún documento para firmar.' },
  ]),

  // === 5. Mi salud está afectando algunas tareas (salud) ====================
  q('salud_que', '¿Qué está pasando con tus tareas?', ['salud'], [
    { value: 'Algunas me cuestan por mi salud', flags: ['tareas_dificiles'], micro: 'Identificar qué tareas te cuestan ayuda a buscar una adaptación.' },
    { value: 'Necesito permisos para citas o tratamiento', flags: ['necesita_permisos'], micro: 'Los permisos para tu salud pueden gestionarse; guarda las solicitudes.' },
    { value: 'Me cambiaron tareas por mi salud', flags: ['cambio_funciones'], micro: 'Un cambio de tareas por salud conviene revisar cómo se decidió.' },
    { value: 'No estoy seguro', flags: [], micro: 'Puedes describir con tus palabras lo que notas.' },
  ]),
  q('salud_ajuste', '¿Pediste algún ajuste o permiso?', ['salud'], [
    { value: 'Sí, y me respondieron', flags: ['pidio_ajuste'], micro: 'Guarda tu solicitud y la respuesta que recibiste.' },
    { value: 'Sí, sin respuesta', flags: ['pidio_ajuste', 'sin_respuesta'], micro: 'La falta de respuesta también es un dato para anotar.' },
    { value: 'Todavía no', flags: [], micro: 'Puedes consultar cómo pedir una adaptación adecuada.' },
    { value: 'No estoy seguro', flags: [], micro: 'Podemos ver juntos cómo plantear una solicitud.' },
  ]),
  q('salud_reco', '¿Tienes recomendaciones de tu equipo de salud?', ['salud'], [
    { value: 'Sí, por escrito', flags: ['recomendacion_escrita'], micro: 'Una recomendación por escrito ayuda a pedir ajustes.' },
    { value: 'Verbales', flags: ['recomendacion_verbal'], micro: 'Puedes pedir a tu equipo de salud algo por escrito.' },
    { value: 'Todavía no', flags: [], micro: 'Consultar a tu equipo de salud sobre límites puede ayudar.' },
    { value: 'No estoy seguro', flags: [], micro: 'Podemos ver qué conviene pedir a tu equipo de salud.' },
  ]),
  q('salud_sabe', '¿Qué sabe la empresa de tu situación?', ['salud'], [
    { value: 'Conoce mi diagnóstico', flags: ['empleador_conocia'], micro: 'Recuerda: no existe obligación general de revelar el diagnóstico.' },
    { value: 'Sabe que necesito ajustes, sin diagnóstico', flags: ['sabe_ajuste_sin_diagnostico'], micro: 'Puedes pedir ajustes resguardando tu información de salud.' },
    { value: 'No sabe nada', flags: ['empleador_no_conocia'], micro: 'Puedes plantear una adaptación sin revelar tu diagnóstico.' },
    { value: 'No estoy seguro', flags: [], micro: 'Podemos ver cómo proteger tu información al pedir ajustes.' },
  ]),

  // === 6. Compartieron mi diagnóstico sin mi permiso (privacidad) ===========
  q('priv_como', '¿Cómo se difundió tu diagnóstico?', ['privacidad'], [
    { value: 'Alguien lo comentó a terceros', flags: ['divulgacion_verbal'], micro: 'Anota quién lo comentó, a quién y cuándo.' },
    { value: 'Se envió por escrito (correo/chat)', flags: ['divulgacion_escrita', 'registro_escrito'], micro: 'Guarda ese mensaje sin reenviarlo a más personas.' },
    { value: 'Se publicó o quedó visible', flags: ['divulgacion_publica'], micro: 'Guarda una captura y consulta cómo pedir que se retire.' },
    { value: 'No estoy seguro', flags: [], micro: 'Puedes describir cómo te enteraste de la difusión.' },
  ]),
  q('priv_quien', '¿Sabes quién accedió o lo compartió?', ['privacidad'], [
    { value: 'Sí, sé quién fue', flags: ['sabe_quien'], micro: 'Anótalo; es un dato relevante para revisar lo ocurrido.' },
    { value: 'Tengo una sospecha', flags: ['sospecha_quien'], micro: 'Distingue lo que sabes de lo que supones.' },
    { value: 'No lo sé', flags: [], micro: 'No pasa nada; se puede revisar cómo pudo ocurrir.' },
  ]),
  q('priv_prueba', '¿Tienes forma de mostrar lo que pasó?', ['privacidad'], [
    { value: 'Tengo el mensaje o la publicación', flags: ['tiene_prueba', 'registro_escrito'], micro: 'Consérvalo en un lugar seguro, sin difundirlo más.' },
    { value: 'Me lo contaron', flags: ['sin_prueba'], micro: 'Anota quién te lo contó y cuándo.' },
    { value: 'No tengo prueba aún', flags: ['sin_prueba'], micro: 'Puedes empezar por anotar lo que sabes.' },
  ]),
  q('priv_cuando', '¿Cuándo ocurrió?', ['privacidad'], [
    { value: 'Esta semana', flags: ['reciente'], micro: 'Si es reciente, conviene actuar pronto para frenar la difusión.' },
    { value: 'Este mes', flags: ['reciente'], micro: 'Aún es reciente; consultar pronto puede ayudar.' },
    { value: 'Hace tiempo', flags: [], micro: 'Aunque haya pasado tiempo, conviene revisarlo.' },
    { value: 'No estoy seguro', flags: [], micro: 'Anota una fecha aproximada.' },
  ]),

  // === 7. Me pidieron información o pruebas sobre VIH (prueba) ===============
  q('prueba_que', '¿Qué te pidieron exactamente?', ['prueba'], [
    { value: 'Una prueba de VIH', flags: ['solicitud_prueba'], micro: 'Conviene revisar el propósito antes de realizar una prueba.' },
    { value: 'Que revele mi diagnóstico', flags: ['solicitud_revelar'], micro: 'No existe una obligación general de revelar el diagnóstico al empleador.' },
    { value: 'Resultados o historia médica', flags: ['solicitud_historia'], micro: 'Tu información de salud es íntima; conviene revisar la solicitud.' },
    { value: 'No estoy seguro', flags: [], micro: 'Puedes anotar cómo te hicieron la solicitud.' },
  ]),
  q('prueba_quien', '¿Quién lo pidió?', ['prueba'], [
    { value: 'La empresa o RR.HH.', flags: ['pidio_empresa'], micro: 'Anota de qué área vino la solicitud.' },
    { value: 'Un jefe directo', flags: ['pidio_jefe'], micro: 'Registra quién te lo pidió y en qué contexto.' },
    { value: 'Un médico de la empresa', flags: ['pidio_medico'], micro: 'Puedes preguntar con qué finalidad se solicita.' },
    { value: 'No estoy seguro', flags: [], micro: 'Anota lo que recuerdes de quién lo pidió.' },
  ]),
  q('prueba_motivo', '¿Te dijeron para qué la necesitan?', ['prueba'], [
    { value: 'Sí, por escrito', flags: ['motivo_escrito'], micro: 'Guarda esa solicitud por escrito.' },
    { value: 'Solo verbal', flags: ['motivo_verbal'], micro: 'Puedes pedir la solicitud y su finalidad por escrito.' },
    { value: 'No dieron motivo', flags: ['sin_motivo'], micro: 'La falta de finalidad clara es un dato para revisar.' },
    { value: 'No estoy seguro', flags: [], micro: 'Puedes preguntar por escrito para qué se necesita.' },
  ]),
  q('prueba_entregue', '¿Ya entregaste esa información?', ['prueba'], [
    { value: 'Sí', flags: ['ya_entregue'], micro: 'Aun así, puedes consultar cómo proteger tus datos de ahora en más.' },
    { value: 'Todavía no', flags: ['no_entregue'], micro: 'Consulta antes de entregar resultados o autorizar su difusión.' },
    { value: 'Me niego, pero insisten', flags: ['insisten'], micro: 'Si insisten, conviene buscar orientación cuanto antes.' },
    { value: 'No estoy seguro', flags: [], micro: 'Podemos ver cómo responder y proteger tus datos.' },
  ]),

  // === 8. No estoy seguro de si lo que pasó es discriminación (duda) =========
  q('duda_preocupa', '¿Qué es lo que más te preocupa?', ['duda'], [
    { value: 'Un cambio en el trato', flags: ['cambio_trato'], micro: 'Anota qué cambió y desde cuándo.' },
    { value: 'Comentarios o presión', flags: ['presion'], micro: 'Los comentarios o la presión conviene registrarlos.' },
    { value: 'Mi continuidad en el trabajo', flags: ['posible_despido'], micro: 'Si temes por tu continuidad, conviene prepararte con tiempo.' },
    { value: 'Mi privacidad', flags: ['divulgacion'], micro: 'Tu información de salud es íntima y merece protección.' },
    { value: 'No sé cómo nombrarlo', flags: [], micro: 'No necesitas ponerle un nombre para pedir ayuda.' },
  ]),
  q('duda_known', '¿La empresa conoce tu diagnóstico?', ['duda'], [
    { value: 'Sí', flags: ['empleador_conocia'], micro: 'Que lo conozcan puede ser relevante para revisar el contexto.' },
    { value: 'No', flags: ['empleador_no_conocia'], micro: 'Aunque no lo conozcan, otros hechos pueden importar.' },
    { value: 'No estoy seguro', flags: [], micro: 'No necesitas confirmarlo para consultar.' },
  ]),
  q('duda_cuando', '¿Cuándo notaste que algo cambió?', ['duda'], [
    { value: 'Recientemente', flags: ['reciente'], micro: 'Si es reciente, ordenar los hechos ahora ayuda.' },
    { value: 'Hace semanas o meses', flags: [], micro: 'Puedes reconstruir una línea de tiempo de lo ocurrido.' },
    { value: 'Siempre ha sido así', flags: [], micro: 'Anota ejemplos concretos de lo que notas.' },
    { value: 'No estoy seguro', flags: [], micro: 'Empieza por lo que recuerdes con más claridad.' },
  ]),
  q('duda_registro', '¿Tienes algún registro de lo ocurrido?', ['duda'], [
    { value: 'Sí, algo tengo', flags: ['registro_escrito'], micro: 'Consérvalo en un lugar seguro.' },
    { value: 'Solo mi recuerdo', flags: ['registro_verbal'], micro: 'Escribir una secuencia de lo ocurrido ya es un buen inicio.' },
    { value: 'No estoy seguro', flags: [], micro: 'Puedes empezar anotando fechas y hechos concretos.' },
  ]),
];

/** Devuelve las preguntas aplicables a un caso dado. */
export function questionsForCase(caseId) {
  return questions.filter((qq) => qq.appliesTo === '*' || qq.appliesTo.includes(caseId));
}

/** Busca la opción elegida de una pregunta por su valor. */
export function findOption(question, value) {
  return question.options.find((o) => o.value === value) || null;
}
