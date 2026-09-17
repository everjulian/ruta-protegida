// -----------------------------------------------------------------------------
// Las 4 fases de la experiencia (reemplazan al "Paso X de 6").
// Navegación tipo ruta: Entender → Preparar → Conocer → Actuar.
// -----------------------------------------------------------------------------
export const phases = [
  { id: 'entender', label: 'Entender', icon: 'search', intro: '¿Qué está pasando?' },
  { id: 'preparar', label: 'Preparar', icon: 'folder', intro: 'Guarda lo importante.' },
  { id: 'conocer', label: 'Conocer', icon: 'shield', intro: 'Conoce tus protecciones.' },
  { id: 'actuar', label: 'Actuar', icon: 'message', intro: 'Tu siguiente paso.' },
];

/** Orden de las fases, para comparar avance. */
export const phaseOrder = phases.map((p) => p.id);

/** Devuelve la definición de una fase por su id. */
export const getPhase = (id) => phases.find((p) => p.id === id);
