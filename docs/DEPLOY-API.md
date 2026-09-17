# Activar la IA (desplegar /api/guidance en Vercel)

La ruta funciona sin IA. Estos pasos la **activan** cuando tengas una
`OPENAI_API_KEY` con crédito. El sitio sigue en GitHub Pages; en Vercel vive
**solo** la función.

## Requisitos previos

- Cuenta de OpenAI con crédito y una **API key** (platform.openai.com → API keys).
- Cuenta de GitHub (ya la tienes).

## Paso 1 · Desplegar la función en Vercel (gratis)

1. Entra a **vercel.com** → **Continue with GitHub** (crea la cuenta gratis).
2. **Add New… → Project** → importa el repo **`everjulian/ruta-protegida`**.
3. Vercel leerá `vercel.json` (no compila el sitio, solo la función).
4. En **Environment Variables** agrega:
   - `OPENAI_API_KEY` = tu clave (secreta).
   - `ALLOWED_ORIGIN` = `https://everjulian.github.io`
   - *(opcional)* `OPENAI_MODEL` = `gpt-4o-mini`
5. **Deploy**. Al terminar copia la URL, p. ej. `https://ruta-protegida.vercel.app`.
6. Prueba: debería responder a
   `POST https://<tu-url>.vercel.app/api/guidance`.

## Paso 2 · Conectar el front (GitHub Pages)

1. En el repo de GitHub: **Settings → Secrets and variables → Actions → Variables**
   → **New repository variable**:
   - Nombre: `PUBLIC_GUIDANCE_API`
   - Valor: la URL de Vercel (sin barra final), p. ej. `https://ruta-protegida.vercel.app`
2. Cuando esos cambios estén en `main`, el despliegue de Pages inyecta esa URL y
   el sitio empezará a usar la IA. Si la función falla, cae al motor local solo.

## Seguridad

- La `OPENAI_API_KEY` vive **solo** en Vercel (Environment Variables), nunca en el
  repo ni en el navegador.
- `PUBLIC_GUIDANCE_API` es solo una URL pública (no es secreto).
- Todo lo demás (validación, rate limiting, anti-inyección, fallback) ya está en
  `server/`. Ver [`SECURITY.md`](SECURITY.md).

## Alternativas equivalentes

El mismo código sirve en **Cloudflare Workers** o **Netlify** vía
`server/adapters/serverless.mjs`. Vercel es la vía más simple para empezar.
