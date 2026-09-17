// -----------------------------------------------------------------------------
// Iconos SVG (trazos simples, sin dependencias externas).
// Para añadir un icono: agrega su `path` aquí y referéncialo por su clave.
// -----------------------------------------------------------------------------
export const paths = {
  shield: 'M12 3 3 7v5c0 6 9 10 9 10s9-4 9-10V7l-9-4Z M8 12l3 3 5-6',
  message: 'M21 11a8 8 0 0 1-8 8H7l-5 3 1-6a8 8 0 1 1 18-5Z M7 10h10 M7 14h6',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  back: 'M19 12H5 M11 6l-6 6 6 6',
  search: 'M20 20l-5-5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
  folder: 'M3 6h7l2 3h9v11H3V6Z',
  heart: 'M20 5c-3-3-7 0-8 2-1-2-5-5-8-2-4 5 5 11 8 15 3-4 12-10 8-15Z',
  check: 'm5 12 4 4L19 6',
  lock: 'M6 10h12v11H6z M8 10V7a4 4 0 0 1 8 0v3 M12 14v3',
  clock: 'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  book: 'M12 5v16 M12 5C8 2 4 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-2-1-6-2-10 1Z',
  briefcase: 'M3 8h18v13H3z M8 8V4h8v4 M3 12c6 4 12 4 18 0 M11 13h2v3h-2z',
  users: 'M16 21v-3a5 5 0 0 0-10 0v3 M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M18 4a4 4 0 0 1 0 7 M20 15c2 1 2 3 2 6',
  alert: 'M12 3 2 21h20L12 3Z M12 9v5 M12 18h.01',
  file: 'M5 2h9l5 5v15H5z M14 2v6h5 M8 13h8 M8 17h6',
  health: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  help: 'M9 8a3 3 0 1 1 5 3c-2 1-2 2-2 3 M12 18h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  mail: 'M3 5h18v14H3z m0 0 9 8 9-8',
  calendar: 'M4 5h16v16H4z M4 10h16 M8 3v4 M16 3v4',
  scale: 'M12 3v18 M6 21h12 M3 7h18 M6 7l-4 8h8L6 7Z M18 7l-4 8h8l-4-8Z',
  external: 'M14 3h7v7 M21 3l-11 11 M10 3H3v18h18v-7',
};

/**
 * Devuelve el markup de un icono SVG por su clave.
 * @param {string} n clave del icono en `paths`
 * @returns {string}
 */
export const icon = (n) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[n] || paths.shield}"/></svg>`;
