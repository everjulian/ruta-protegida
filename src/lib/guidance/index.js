// -----------------------------------------------------------------------------
// Punto de entrada de la orientación. La interfaz de usuario SOLO importa desde
// aquí: `import { getGuidance } from '../lib/guidance'`.
//
// Hoy usa el proveedor determinístico local. Para pasar (o combinar) con IA,
// se crea otro proveedor con la misma firma y se cambia esta única línea; las
// vistas no se tocan.
// -----------------------------------------------------------------------------
import { localRulesProvider } from './rules.js';
import { remoteProvider } from './remote.js';

// Proveedor activo:
// - Si PUBLIC_GUIDANCE_API está configurado, usa el endpoint server-side
//   (con IA) y cae al motor local ante cualquier fallo.
// - Si no, usa solo el motor determinístico local.
const provider = import.meta.env.PUBLIC_GUIDANCE_API ? remoteProvider : localRulesProvider;

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
