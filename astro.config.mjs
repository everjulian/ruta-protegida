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
//
// En Vercel se detecta automáticamente: el sitio se sirve en la raíz (base '/')
// y la función vive en el mismo origen (/api/guidance), sin necesidad de
// configurar variables en el panel.
// -----------------------------------------------------------------------------
const onVercel = !!process.env.VERCEL;
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

const SITE =
  onVercel && vercelHost
    ? `https://${vercelHost}`
    : (process.env.SITE_URL ?? 'https://everjulian.github.io');
const BASE = onVercel ? '/' : (process.env.BASE_PATH ?? '/ruta-protegida');

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
