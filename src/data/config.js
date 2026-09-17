// -----------------------------------------------------------------------------
// Configuración de contacto y textos globales de la ruta.
// -----------------------------------------------------------------------------

// Número de WhatsApp de orientación (formato internacional, sin signos).
export const WHATSAPP_NUMBER = '593984891602';

// Mensaje precargado del enlace de WhatsApp (general, sin datos personales).
export const WHATSAPP_MESSAGE =
  'Hola, quisiera recibir orientación jurídica gratuita sobre una situación laboral.';

// Enlace completo de WhatsApp ya codificado.
export const wa =
  'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_MESSAGE);

// Sitio oficial de la fundación.
export const CEPVVS_SITE = 'https://cepvvs.odoo.com/';

// Etiquetas de los 6 pasos de la ruta.
export const steps = [
  'Tu situación',
  'Señales importantes',
  'Guarda evidencia',
  'Tus protecciones',
  'Tu siguiente paso',
  'Acompañamiento',
];
