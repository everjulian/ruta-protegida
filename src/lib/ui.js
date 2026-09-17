import { icon } from '../data/icons.js';

// -----------------------------------------------------------------------------
// Pequeños helpers de presentación que devuelven cadenas HTML.
// Mantener libres de efectos: solo construyen markup.
// -----------------------------------------------------------------------------

export function button(label, action, style = 'primary', extra = '') {
  return `<button class="button ${style}" data-action="${action}" ${extra}>${label}</button>`;
}

export function hint(text, warm = false) {
  return `<div class="hint ${warm ? 'warm' : ''}">${icon(warm ? 'alert' : 'shield')}<span>${text}</span></div>`;
}

export function legalNote() {
  return `<p class="legal-note">Esta herramienta brinda información general, no reemplaza asesoría jurídica. Cada caso requiere revisión individual. <button data-action="notice">Conoce el alcance de esta guía.</button></p>`;
}
