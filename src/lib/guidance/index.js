// -----------------------------------------------------------------------------
// Punto de entrada de la orientación. La interfaz de usuario SOLO importa desde
// aquí: `import { getGuidance } from '../lib/guidance'`.
//
// Hoy usa el proveedor determinístico local. Para pasar (o combinar) con IA,
// se crea otro proveedor con la misma firma y se cambia esta única línea; las
// vistas no se tocan.
// -----------------------------------------------------------------------------
import { localRulesProvider } from './rules.js';

/** Proveedor activo. Cambiar aquí para enchufar IA en el futuro. */
const provider = localRulesProvider;

/**
 * Devuelve la orientación para un contexto dado.
 * Asíncrono a propósito: así el cambio a un proveedor de IA no altera la UI.
 * @param {import('./types.js').Context} context
 * @returns {Promise<import('./types.js').GuidanceResult>}
 */
export function getGuidance(context) {
  return provider.getGuidance(context);
}

export { buildGuidance, deriveFlags } from './rules.js';
