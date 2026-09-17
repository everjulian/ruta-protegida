import { icon } from '../data/icons.js';
import { button, legalNote } from '../lib/ui.js';

// Vista de inicio (landing).
export function welcome() {
  return `<section class="welcome"><div class="welcome-copy"><span class="pill">${icon('shield')} ORIENTACIÓN JURÍDICA GRATUITA</span><h1>Ruta<br><em>Protegida.</em></h1><p class="intro">Tus derechos importan.<br>Vamos paso a paso.</p><p class="supporting">Una guía práctica si estás viviendo una situación laboral injusta relacionada con VIH. Te ayudamos a entender qué pasa y qué puedes hacer.</p><div class="actions">${button('Comenzar ' + icon('arrow'), 'start')}${button('Hablar con CEPVVS', 'contact', 'secondary')}</div><div class="micro privacy-note">${icon('lock')} Sin registro. Sin subir documentos.</div></div><div class="route-preview"><div class="route-preview-top"><strong>Tu camino, a tu ritmo</strong><span>Un paso a la vez</span></div><div class="path-list">${[
    ['search', 'Entiende qué está pasando', 'Identifica tu situación'],
    ['folder', 'Prepara lo importante', 'Guarda lo que tengas'],
    ['shield', 'Conoce tus protecciones', 'Información clara sobre tus derechos'],
    ['message', 'Encuentra acompañamiento', 'No tienes que resolverlo solo'],
  ]
    .map(
      (a, i) =>
        `<div class="path-step">${i === 0 ? `<button class="path-node" data-action="start" aria-label="Comenzar mi ruta">${icon(a[0])}</button>` : `<span class="path-node">${icon(a[0])}</span>`}<div><strong>${a[1]}</strong><p>${a[2]}</p>${i === 0 ? '<span class="start-tag">EMPIEZA AQUÍ</span>' : ''}</div></div>`,
    )
    .join('')}</div><div class="path-bottom">${icon('heart')} Tú decides cuánto compartir y cuándo avanzar.</div></div></section><section class="trust-row" aria-label="Cómo te acompañamos"><div class="trust">${icon('lock')}<div><strong>Tu privacidad primero</strong><p>No pedimos tu nombre ni tu diagnóstico.</p></div></div><div class="trust">${icon('book')}<div><strong>Con respaldo jurídico</strong><p>Basado en sentencias de Ecuador.</p></div></div><div class="trust">${icon('message')}<div><strong>Personas que te acompañan</strong><p>Orientación gratuita de CEPVVS.</p></div></div></section>${legalNote()}`;
}
