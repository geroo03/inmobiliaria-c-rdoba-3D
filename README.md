# Habita · Prototipo inmobiliario

**[Abrir la demo en GitHub Pages](https://geroo03.github.io/inmobiliaria-c-rdoba-3D/)**

Demo de una propiedad ficticia con dos experiencias que usan el mismo modelo 3D:

- **Ver construcción:** secuencia de 22 segundos, seis etapas, pausa, reinicio y control manual del progreso.
- **Explorar la casa:** maqueta giratoria, plano superior y siete ambientes seleccionables, con transición a su interior y vista que se puede girar.

Incluye techo opcional, iluminación de día o atardecer, controles por teclado y una interfaz adaptable a celular. `Escape` vuelve del interior al plano. Las superficies y la distribución son ilustrativas.

## Documentación

- [Por dónde empezar](POR_DONDE_EMPEZAR.md): pasos y ficha para elegir y preparar la primera propiedad real.
- [Guía de producción real](GUIA_PRODUCCION_REAL.md): fotos comunes, panoramas 360°, captura espacial, alternativas y arquitectura propuesta.
- [Informe del prototipo](INFORME_DEL_PROTOTIPO.md): qué se construyó, cómo funciona, archivos entregados y verificaciones realizadas.

## Publicación en GitHub Pages

El sitio se publica desde `dist/` mediante el workflow [pages.yml](.github/workflows/pages.yml). Se ejecuta al subir cambios de esa carpeta a `main` y también se puede iniciar desde **Actions → Publicar en GitHub Pages → Run workflow**.

GitHub Pages debe tener **GitHub Actions** como origen en **Settings → Pages → Build and deployment**. No hace falta instalar dependencias ni ejecutar un compilador: la aplicación es estática y ya incluye sus recursos.

La publicación sirve únicamente la aplicación de `dist/`. Los documentos se consultan desde este repositorio. El resultado de cada publicación queda en la [pestaña Actions](https://github.com/geroo03/inmobiliaria-c-rdoba-3D/actions).

Configuración basada en el [flujo oficial de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Abrir en tu computadora

Desde esta carpeta:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Abrir **http://127.0.0.1:4173** en Chrome, Edge o Safari con WebGL habilitado. En Mac también se puede ejecutar `ABRIR_PROTOTIPO.command` con doble clic.

El prototipo se sirve por HTTP porque usa módulos JavaScript. Todas las dependencias, incluida la tipografía, están en `dist/vendor`: no necesita claves, una cuenta ni descargas de recursos externos al navegar.

## Archivos

- `dist/index.html`: interfaz y contenido.
- `dist/styles.css`: diseño y adaptación a pantallas pequeñas.
- `dist/app.js`: modelo 3D, construcción, selección y cámaras.
- `dist/vendor/`: Three.js 0.164.1 (licencia MIT) y DM Sans (licencia OFL); licencias incluidas.

La casa es un modelo geométrico creado para esta demostración. Para una versión de una propiedad real, reemplazar la distribución y el mobiliario por un modelo construido a partir del plano y las referencias de esa propiedad. El acabado actual es una maqueta estilizada, no un render fotográfico ni un levantamiento arquitectónico.
