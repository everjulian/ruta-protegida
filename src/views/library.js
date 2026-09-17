import { icon } from '../data/icons.js';
import { judgments } from '../data/judgments.js';
import { button, hint, legalNote } from '../lib/ui.js';

// Vista de biblioteca / respaldo jurídico.
export function library() {
  return `<section class="library">${button(icon('back') + ' Volver a mi ruta', 'route', 'text')}<span class="eyebrow">BIBLIOTECA · ECUADOR</span><h1>Los derechos tienen respaldo.</h1><p>Cuatro sentencias para comprender las protecciones laborales relacionadas con VIH. Aquí encontrarás una explicación breve y su fuente oficial.</p><div class="library-grid">${judgments
    .map(
      (j, n) =>
        `<article class="judgment" id="sentencia-${n}"><span class="tag">CORTE CONSTITUCIONAL · ${j.year}</span><h2>${j.code}</h2><h3>${j.theme}</h3><p>${j.body}</p><p><b>Por qué es relevante</b><br>${j.why}</p><a href="${j.url}" target="_blank" rel="noopener noreferrer">${j.label} ${icon('external')}</a>${j.note ? `<p class="source-note">${j.note}</p>` : ''}</article>`,
    )
    .join(
      '',
    )}</div>${hint('Estas decisiones no garantizan el resultado de otro caso. CEPVVS puede ayudarte a revisar qué criterios son relevantes para ti.')}<p class="source-note">Fuentes consultadas el 16 de septiembre de 2026. La información de esta guía se actualiza periódicamente. Los enlaces abren sitios externos.</p>${button('Hablar con CEPVVS', 'contact')}${legalNote()}</section>`;
}
