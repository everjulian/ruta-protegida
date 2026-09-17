// -----------------------------------------------------------------------------
// Fallback determinístico: reutiliza EXACTAMENTE el mismo motor de reglas que
// el cliente (src/lib/guidance/rules.js). Es la fuente de verdad de evidencia,
// respaldo jurídico y CTA, y el respaldo cuando la IA falla o no cumple.
// -----------------------------------------------------------------------------
import { buildGuidance } from '../../src/lib/guidance/rules.js';

export function deterministicGuidance(context) {
  return buildGuidance(context);
}
