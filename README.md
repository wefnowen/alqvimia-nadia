# Alqvimia Lleida · Nadia Elcacho — landing web

Landing bilingüe (ES/CA) de dos centros de estética, construida en HTML/CSS/JS vanilla puro. Sin frameworks, sin dependencias de build para el front-end. La única pieza no estática es la tarjeta regalo, que usa dos funciones serverless mínimas para cobrar con Stripe de forma segura.

## Cómo verla en local

El sitio no necesita servidor para navegarlo: es HTML/CSS/JS estático con rutas relativas.

1. **VS Code + extensión "Live Server"** (recomendado): clic derecho sobre `index.html` → "Open with Live Server". Recarga automática al guardar cambios.
2. **Node.js, si se instala más adelante**: desde esta carpeta, `npx serve` (o `npx http-server`) y abrir la URL que indique en consola.
3. **Doble clic directo en `index.html`**: funciona para navegar toda la web salvo el paso de pago de la tarjeta regalo (necesita las funciones serverless, ver más abajo).

Esta máquina no tiene Python ni Node.js instalados globalmente — cualquiera de las opciones de arriba funciona sin instalar nada más (la opción 3 no requiere nada en absoluto).

## Estructura del proyecto

```
index.html          Markup semántico de toda la web (header, páginas, footer). Sin CSS ni JS inline (salvo el JSON-LD de datos estructurados, que debe vivir en <head>).
css/
  base.css           Reset, variables :root, tipografía base, .container, utilidades i18n (.i18n-es/.i18n-ca), focus-visible, "typo utils", sistema de botones (.btn*) y el sistema de páginas compartido.
  header.css         Cabecera fija, tabs de navegación, selector de idioma, menú móvil (#mobile-menu) y su responsive.
  hero.css           Hero de la página de Inicio (imagen de fondo, scrim, CTAs, métricas).
  about.css          Sección "Sobre nosotros" (foto + badge + copy) y el "brand strip" (pills de marca), reutilizado también en Opiniones.
  diagnostico.css    Bloque "Pide cita para tu diagnóstico gratuito" de la home (vídeo + texto).
  quick-links.css    Accesos rápidos de la home (tarjetas .quick-card).
  services.css       Sistema de tabs por centro + acordeón de categorías + filas de precio, compartido entre las páginas Servicios y Precios.
  team.css           Tarjetas del equipo (página Profesionales).
  quiz.css           Asesor de piel: progreso, pasos, opciones y tarjetas de resultado.
  testimonials.css   Opiniones: flag de verificación, grid de reseñas, CTA a Google.
  gift-card.css      Asistente de la tarjeta regalo (pasos, resumen, diseño de la tarjeta imprimible).
  contact.css        Tarjetas de ubicación + mapas embebidos + formulario de contacto.
  footer.css         Pie de página.
  wa-float.css       Botón flotante de WhatsApp y su selector de centro.
js/
  lang.js            Cambio de idioma ES/CA. Expone App.htmlEl y App.setLang.
  mobile-menu.js     Abrir/cerrar el menú móvil. Expone App.closeMobileMenu.
  nav.js             Navegación entre "páginas" (data-goto), historial y estado activo de tabs.
  reveal.js          Animación reveal-on-scroll vía IntersectionObserver.
  services-tabs.js   Cambio de panel Alqvimia/Nadia Elcacho en Servicios y Precios.
  accordion.js       Acordeón de categorías de servicios/precios.
  whatsapp.js        Números y plantillas de mensaje, apertura de WhatsApp, botón flotante. Expone App.openWhatsapp y App.currentLang.
  contact-form.js    Envío del formulario de contacto como mensaje de WhatsApp.
  quiz.js            Lógica completa del Asesor de piel (test de 4 preguntas y recomendación).
  gift-card.js       Asistente de la tarjeta regalo: pasos, lectura de precios reales desde la página Precios, llamada a Stripe y render de la tarjeta descargable.
img/
  hero-inicio.jpg      Imagen de fondo del hero de Inicio.
  sobre-nosotros.jpg   Foto de la sección "Sobre nosotros".
video/
  diagnostico-piel.mp4 Vídeo del analizador de piel, junto al bloque de diagnóstico gratuito.
netlify/functions/
  create-checkout-session.js  Crea la sesión de pago de Stripe Checkout para la tarjeta regalo.
  verify-gift-session.js      Verifica contra Stripe que el pago se completó antes de mostrar la tarjeta descargable.
netlify.toml         Configuración de despliegue (carpeta publicada = raíz del proyecto, funciones = netlify/functions).
```

## Notas técnicas

- Los `<script>` se cargan al final de `<body>` con `defer`, en el mismo orden en que dependen unos de otros. Las variables/funciones compartidas entre módulos ya no son globales sueltas: viven namespaceadas bajo un único objeto `window.App` (`App.htmlEl`, `App.setLang`, `App.closeMobileMenu`, `App.currentLang`, `App.openWhatsapp`), cada módulo envuelto en su propia función para no ensuciar el scope global.
- Ningún nombre de clase, id o atributo `data-*` fue renombrado respecto al artefacto original — el HTML y el JS siguen usando exactamente los mismos selectores.
- El artefacto original (`alqvimia-nadia-elcacho_8.html`) se conserva intacto en la raíz del proyecto como referencia histórica; no forma parte del sitio activo.
- La lista de tratamientos del paso 3 de la tarjeta regalo **no está duplicada a mano**: `gift-card.js` la lee en tiempo real de las filas de precio de la página Precios (`#precios-panel-alqvimia` / `#precios-panel-nadia`). Si cambias un precio o un tratamiento en la página Precios, el selector de la tarjeta regalo se actualiza solo. Solo se ofrecen como regalo los tratamientos con un precio único y claro (se excluyen automáticamente rangos como "70/80€" y precios "a consultar").

## Poner en marcha el pago de la tarjeta regalo (pendiente por tu parte)

El front-end de la tarjeta regalo ya está terminado y probado. Para que el botón "Pagar" funcione de verdad en producción, quedan tres pasos que solo tú puedes hacer (no puedo crear cuentas ni tocar credenciales de pago en tu nombre):

1. **Crear una cuenta de Stripe** en [stripe.com](https://stripe.com) (gratis, cobra una comisión ~1,4% + 0,25€ por pago con tarjeta europea). Activa el modo "Live" cuando quieras cobrar de verdad; mientras pruebas, usa el modo "Test" y sus tarjetas de prueba.
2. **Desplegar este proyecto en Netlify** (gratis para este uso):
   - Sube esta carpeta a un repositorio de GitHub (o arrastra la carpeta directamente en [app.netlify.com/drop](https://app.netlify.com/drop) para una primera prueba rápida).
   - En Netlify, "Add new site" → conecta el repositorio. Netlify detecta `netlify.toml` solo — no hace falta configurar nada más ahí.
3. **Añadir la clave secreta de Stripe** en Netlify: Site settings → Environment variables → añade `STRIPE_SECRET_KEY` con el valor de tu clave secreta de Stripe (Developers → API keys, la que empieza por `sk_`). Nunca la pegues en el código ni me la envíes a mí — solo va en esa variable de entorno de Netlify.

Una vez desplegado con esa variable configurada, el flujo completo funciona solo: el botón "Pagar" crea una sesión de Stripe Checkout, el cliente paga en la página segura de Stripe, y al volver la web verifica el pago antes de generar la tarjeta descargable — así nadie puede conseguir una tarjeta regalo sin pagar de verdad.
