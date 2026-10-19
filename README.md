# Habita · Prototipo inmobiliario

**[Noveno: tres departamentos en un piso 9](https://geroo03.github.io/inmobiliaria-c-rdoba-3D/noveno/)** · **[Casa Patio: construcción y recorrido](https://geroo03.github.io/inmobiliaria-c-rdoba-3D/)**

**Noveno** presenta un edificio ilustrativo con tres unidades: 9A (un dormitorio), 9B (dos) y 9C (tres). Permite ver el edificio, comparar el piso completo, abrir cada departamento, recorrer sus ambientes y salir al balcón con una ciudad recreada debajo. Cada unidad y modo de vista tienen un enlace público para compartir. [Ver alcance y detalles](DEMO_NOVENO_PISO.md).

Ambas demos usan modelos creados por código. Para representar una propiedad existente hay que incorporar sus planos, capturas o fotografías; estas experiencias no son levantamientos de inmuebles reales.

Demo de una propiedad ficticia con dos experiencias que usan el mismo modelo 3D:

- **Ver construcción:** secuencia de 48 segundos y nueve etapas, con excavación ilustrativa, armaduras, hormigón, ladrillos por hiladas, cubierta, instalaciones y terminaciones. Permite pausar, reiniciar y recorrer el progreso en ambas direcciones.
- **Explorar la casa:** maqueta que se puede girar, desplazar y acercar; plano superior; siete ambientes seleccionables y recorrido a pie entre ellos, con colisiones contra paredes, vidrios y muebles principales.

Incluye texturas procedurales, muebles con bordes suavizados, techo opcional, iluminación de día o atardecer, un plano de ubicación y pantalla completa cuando el navegador la admite. Las superficies, la distribución y la secuencia constructiva son ilustrativas.

## Controles

| Vista | PC | Celular |
| --- | --- | --- |
| Maqueta | Arrastrar para girar; botón derecho para desplazar; rueda para acercar | Un dedo para girar; dos dedos para desplazar y acercar |
| Plano superior | Arrastrar para desplazar; seleccionar un ambiente | Arrastrar el plano y tocar un ambiente |
| Dentro de la casa | Arrastrar para mirar; **WASD o flechas** para caminar | Arrastrar para mirar; mantener pulsadas las flechas del visor para caminar |
| Cambiar de ambiente | Lista o pequeño plano de ubicación | Lista o pequeño plano de ubicación |
| Volver al plano | **Escape**, botón Plano o Volver al plano | Botón Plano o Volver al plano |

La abertura de la galería permite caminar al patio. Para moverse con el teclado, entrar primero a un ambiente. Durante la transición de cámara el movimiento se habilita al llegar.

## Documentación

- [Por dónde empezar](POR_DONDE_EMPEZAR.md): pasos y ficha para elegir y preparar la primera propiedad real.
- [Guía de producción real](GUIA_PRODUCCION_REAL.md): fotos comunes, panoramas 360°, captura espacial, alternativas y arquitectura propuesta.
- [Informe del prototipo](INFORME_DEL_PROTOTIPO.md): qué se construyó, cómo funciona, archivos entregados y verificaciones realizadas.
- [Mejoras de construcción y recorrido](MEJORAS_CONSTRUCCION_Y_RECORRIDO.md): cambios de esta versión, controles y alcance del realismo.
- [Demo del noveno piso](DEMO_NOVENO_PISO.md): tres unidades, vistas desde altura, enlaces y preparación de una propiedad real.

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
- `dist/construction.js`: etapas, armaduras, estructura, mampostería y elementos temporales de obra.
- `dist/walk-navigation.js` y `dist/movement.js`: controles interiores y colisiones.
- `dist/scene-materials.js`: texturas generadas localmente.
- `dist/noveno/`: experiencia del edificio y los tres departamentos, con datos, modelos, entorno e interfaz propios.
- `dist/vendor/`: Three.js 0.164.1 (licencia MIT) y DM Sans (licencia OFL); licencias incluidas.

Las pruebas de colisión se ejecutan con `npm test` (Node.js 20 o posterior, sin instalar dependencias). GitHub Actions comprueba la sintaxis de los módulos y ejecuta esas pruebas antes de publicar.

La casa es un modelo geométrico creado para esta demostración. Para una versión de una propiedad real, reemplazar la distribución y el mobiliario por un modelo construido a partir del plano y las referencias de esa propiedad. El acabado actual es una maqueta estilizada, no un render fotográfico ni un levantamiento arquitectónico.
