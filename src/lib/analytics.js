// -----------------------------------------------------------------------------
// Envoltorio de analítica (Umami). Único punto de contacto con la herramienta:
// si algún día se cambia, se toca solo este archivo.
//
// REGLA DE ORO: nunca enviar datos sensibles (caso, respuestas, salud, PII).
// Solo eventos neutros y, como mucho, valores agregados (útil=sí, rating=4).
//
// Es seguro ante adblockers o ausencia del script: nunca rompe la app.
// -----------------------------------------------------------------------------

/**
 * Registra un evento anónimo.
 * @param {string} event  nombre del evento (p. ej. 'flow_complete')
 * @param {Record<string, string|number>} [data]  datos neutros opcionales
 */
export function track(event, data) {
  try {
    const umami = typeof window !== 'undefined' ? window.umami : undefined;
    if (umami && typeof umami.track === 'function') {
      data ? umami.track(event, data) : umami.track(event);
    }
  } catch {
    /* silencioso: la analítica jamás debe interrumpir la experiencia */
  }
}
