// -----------------------------------------------------------------------------
// Punto de entrada de la orientación. La interfaz de usuario SOLO importa desde
// aquí: `import { getGuidance } from '../lib/guidance'`.
//
// Hoy usa el proveedor determinístico local. Para pasar (o combinar) con IA,
// se crea otro proveedor con la misma firma y se cambia esta única línea; las
// vistas no se tocan.
// -----------------------------------------------------------------------------
import { remoteProvider } from './remote.js';

// Proveedor activo: el remoto. Internamente llama al endpoint /api/guidance
// (absoluto si hay PUBLIC_GUIDANCE_API, o relativo del mismo origen en Vercel)
// solo cuando corresponde, y cae al motor determinístico local ante cualquier
// fallo o si no hay endpoint disponible.
const provider = remoteProvider;

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
