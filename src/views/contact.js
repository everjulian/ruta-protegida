import { icon } from '../data/icons.js';
import { wa } from '../data/config.js';
import { button, hint, legalNote } from '../lib/ui.js';

// Vista de contacto (WhatsApp de orientación).
export function contact() {
  return `<section class="contact-view">${button(icon('back') + ' Volver', 'return', 'text')}<div class="big-icon">${icon('message')}</div><span class="eyebrow">EL SIGUIENTE PASO ES CONVERSAR</span><h1>Estamos para orientarte.</h1><p>No tienes que resolverlo solo. Puedes pedir orientación jurídica gratuita a CEPVVS, aunque todavía no tengas todos los documentos.</p><div class="contact-panel"><h3>Hablar con CEPVVS</h3><p>Empieza con un mensaje sencillo. El equipo podrá orientarte sobre tu situación y los siguientes pasos.</p><a class="button primary" href="${wa}" target="_blank" rel="noopener noreferrer">${icon('message')} Hablar con orientación jurídica ${icon('external')}</a><small>WhatsApp oficial · +593 98 489 1602</small></div>${hint('WhatsApp se abrirá con un saludo general, sin tus respuestas ni tu diagnóstico. Revisa el mensaje y decide si quieres enviarlo.')}<p class="micro">Este canal no confirma una cita ni ofrece una respuesta inmediata. Si hay una firma o fecha próxima, indícalo al equipo.</p><div class="actions">${button('Volver a la ruta', 'route', 'secondary')}${button('Ver sentencias clave', 'library', 'text')}</div><p class="source-note">Contacto y servicio consultados en el <a href="https://cepvvs.odoo.com/" target="_blank" rel="noopener noreferrer">sitio oficial de CEPVVS</a>.</p>${legalNote()}</section>`;
}
