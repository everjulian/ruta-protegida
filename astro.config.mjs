// @ts-check
import { defineConfig } from 'astro/config';

// -----------------------------------------------------------------------------
// Configuración del sitio
// -----------------------------------------------------------------------------
// Para publicar en GitHub Pages ajusta estos dos valores:
//
//   site  -> https://<usuario-u-organizacion>.github.io
//   base  -> '/<nombre-del-repositorio>'   (déjalo en '/' si usas dominio propio
//            o si el repo es <usuario>.github.io)
//
// Estos valores también pueden inyectarse por variables de entorno en el
// workflow de despliegue (SITE_URL / BASE_PATH) sin tocar este archivo.
// -----------------------------------------------------------------------------
const SITE = process.env.SITE_URL ?? 'https://cepvvs.github.io';
const BASE = process.env.BASE_PATH ?? '/ruta-protegida';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  compressHTML: true,
  build: {
    // Nombres de assets con hash: permite cache-busting seguro en cada deploy.
    assets: 'assets',
    inlineStylesheets: 'never',
  },
});
