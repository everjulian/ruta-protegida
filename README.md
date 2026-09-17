# Ruta Protegida · Fundación CEPVVS

Guía web de orientación sobre **VIH y derechos laborales en Ecuador**. Acompaña a la persona a identificar señales, preparar evidencia, conocer sus protecciones y contactar a la Fundación CEPVVS.

Construida con [Astro](https://astro.build). Sin backend, sin bases de datos y **sin recolección de datos personales**: todo ocurre en el navegador y se borra al recargar.

---

## Puesta en marcha

Requisitos: [Node.js](https://nodejs.org) 18.20+ (recomendado 20).

```bash
npm install     # instala dependencias
npm run dev     # servidor local en http://localhost:4321
npm run build   # compila el sitio a dist/
npm run preview # previsualiza el sitio ya compilado
```

---

## Arquitectura

El proyecto separa **contenido**, **lógica** y **presentación** para que sea fácil de actualizar y de mantener por varias personas.

```
ruta protegida/
├── astro.config.mjs        # configuración del sitio y de GitHub Pages
├── public/                 # archivos servidos tal cual (robots.txt, seguridad…)
├── src/
│   ├── data/               # CONTENIDO editable (lo que se actualiza seguido)
│   │   ├── cases.js        #   situaciones del paso 1
│   │   ├── judgments.js    #   sentencias (respaldo jurídico)
│   │   ├── protections.js  #   protecciones + tipos de evidencia
│   │   ├── sources.js      #   enlaces oficiales
│   │   ├── config.js       #   WhatsApp, textos globales, pasos
│   │   └── icons.js        #   iconos SVG
│   ├── lib/                # estado y utilidades de interfaz
│   ├── views/              # vistas (inicio, ruta, biblioteca, contacto)
│   ├── scripts/main.js     # orquestador (render + eventos)
│   ├── components/         # piezas estáticas (Header, Footer, aviso)
│   ├── layouts/            # <head>, seguridad y estilos globales
│   ├── pages/index.astro   # página principal
│   └── styles/global.css   # estilos
└── .github/workflows/      # despliegue automático a GitHub Pages
```

### ¿Dónde toco para…?

- **Cambiar un texto de una situación** → `src/data/cases.js`
- **Agregar o corregir una sentencia** → `src/data/judgments.js` (+ enlace en `sources.js`)
- **Actualizar el número de WhatsApp** → `src/data/config.js`
- **Ajustar estilos** → `src/styles/global.css`
- **Cambiar la estructura de una vista** → `src/views/*.js`

---

## Publicar en GitHub Pages

1. Sube el proyecto a un repositorio de GitHub.
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada `push` a la rama `main` compila y publica automáticamente
   (`.github/workflows/deploy.yml`).

El `site` y el `base` se detectan solos desde el repositorio en el workflow, así que
no necesitas editar `astro.config.mjs` al cambiar de repo. Si trabajas con un
**dominio propio**, define `base: '/'` en `astro.config.mjs`.

---

## Seguridad y privacidad

- **No se recogen datos personales**: nombre, diagnóstico ni respuestas salen del navegador.
- **Content-Security-Policy** estricta en producción (solo recursos propios).
- Cabeceras de intención segura: `referrer: no-referrer`, `frame-ancestors 'none'`, `upgrade-insecure-requests`.
- Todos los enlaces externos usan `rel="noopener noreferrer"`.
- `public/.well-known/security.txt` con el canal de contacto para reportes.

---

## Nota legal

Esta herramienta brinda **información general** y no reemplaza la asesoría jurídica
profesional. Cada caso requiere revisión individual.
