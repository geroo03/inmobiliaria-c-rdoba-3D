# Habita: qué se construyó y cómo funciona

Fecha del informe: 18 de octubre de 2026.

## 1. La idea que se convirtió en prototipo

Se construyó una aplicación web para demostrar dos experiencias inmobiliarias: ver cómo se arma una casa y explorar su distribución desde arriba, seleccionando un ambiente para entrar a verlo.

La propiedad se llama **Casa Patio**. Es ficticia y tiene una distribución de ejemplo: 120 m² interiores, dos dormitorios, un baño y un patio de 36 m². Estas superficies son ilustrativas.

La demo de este repositorio se publica en **[Habita · GitHub Pages](https://geroo03.github.io/inmobiliaria-c-rdoba-3D/)**, con acceso público. La primera versión también se alojó en un sitio privado de Sites para revisar el prototipo.

## 2. Experiencia de construcción

El modelo se construye siguiendo nueve etapas:

1. Replanteo y excavación.
2. Armaduras y cimientos.
3. Estructura y contrapiso.
4. Mampostería por hiladas.
5. Losa y cubierta.
6. Instalaciones y revoques.
7. Pisos y aberturas.
8. Equipamiento interior.
9. Patio y jardín.

La secuencia está programada con una duración nominal de 48 segundos. Tiene reproducción, pausa, reinicio, una barra para recorrer el progreso y botones para ir al cierre de cada etapa. Desde ahí se puede pasar a explorar la casa terminada.

La animación incorpora armaduras, hormigón, columnas, vigas, andamios, apuntalamiento, encofrado de cubierta y cañerías. La mampostería se coloca por hiladas alternadas y respeta las puertas y ventanas del modelo final. La cubierta se oculta durante las terminaciones para permitir ver el interior. El progreso es reversible: al retroceder la barra se reconstruye el estado correspondiente.

La secuencia sigue siendo ilustrativa: no representa una planificación de obra, un cálculo estructural ni un registro de la construcción real de una propiedad. El tiempo efectivo de reproducción puede variar si el equipo renderiza con lentitud.

## 3. Experiencia de exploración

Se puede alternar entre una maqueta 3D giratoria y una vista superior del mismo modelo. Los siete ambientes disponibles son living, cocina, comedor, dormitorio principal, segundo dormitorio, baño y patio con terraza.

La selección funciona desde la lista, los nombres sobre la maqueta, las superficies seleccionables del plano y el plano de ubicación del recorrido. La cámara se desplaza a una posición inicial de ese ambiente. Después se puede mirar arrastrando y caminar con WASD, las flechas del teclado o los botones del visor. La tecla `Escape` vuelve al plano.

Se agregaron techo opcional en la vista general, iluminación de día o atardecer, un botón para restablecer la cámara y una ficha que identifica el ambiente seleccionado. Las paredes se ocultan durante la transición y se restauran al llegar, para evitar que tapen el movimiento de cámara.

El recorrido permite desplazamiento horizontal con colisiones contra paredes, vidrios cerrados y muebles principales. Se puede atravesar las puertas y la abertura al patio. El plano de ubicación y el nombre del ambiente se actualizan al caminar. La maqueta general también admite desplazamiento, y el visor se puede ampliar a pantalla completa cuando el navegador lo admite. Todavía no incluye fotografías reales ni panoramas 360° de una propiedad.

## 4. Cómo se hizo

| Parte | Implementación actual |
| --- | --- |
| Interfaz | HTML, CSS y JavaScript sin un framework de aplicación |
| Visualización | Three.js 0.164.1 sobre WebGL |
| Modelo | Geometría creada por código: paredes, pisos, aberturas, muebles y vegetación |
| Cámara general | OrbitControls, con giro, desplazamiento y acercamiento |
| Recorrido interior | Cámara a altura fija, teclado, arrastre táctil, botones y colisiones por subpasos |
| Selección | Botones y detección de superficies con raycasting |
| Animación | Nueve etapas, geometría temporal de obra y ladrillos instanciados |
| Materiales | Texturas procedurales de madera, revoque y hormigón; bordes suaves en muebles textiles |
| Adaptación de pantalla | CSS responsive, tamaño del lienzo y encuadres según el ancho |
| Recursos | Three.js y tipografía DM Sans guardados localmente, con sus licencias |
| Alojamiento de este repositorio | GitHub Pages, con publicación automática mediante GitHub Actions |

La animación, el plano y los interiores usan **un mismo modelo**. Por eso, las posiciones de los ambientes se mantienen al cambiar de vista.

La aplicación no requiere una base de datos, un servidor de negocio ni claves de API para funcionar. Su contenido está definido en el código y representa una sola propiedad.

## 5. Archivos entregados

| Archivo | Para qué sirve |
| --- | --- |
| [README.md](../README.md) | Instrucciones de uso y ejecución local |
| [dist/index.html](../dist/index.html) | Estructura, textos y controles de la interfaz |
| [dist/styles.css](../dist/styles.css) | Estilo visual y adaptación a pantallas pequeñas |
| [dist/app.js](../dist/app.js) | Modelo, cámaras, selección, iluminación y animación |
| [dist/construction.js](../dist/construction.js) | Secuencia constructiva y piezas temporales de obra |
| [dist/walk-navigation.js](../dist/walk-navigation.js) | Recorrido con teclado, ratón y controles táctiles |
| [dist/movement.js](../dist/movement.js) | Colisiones y deslizamiento junto a obstáculos |
| [dist/scene-materials.js](../dist/scene-materials.js) | Materiales y texturas locales |
| [tests/movement.test.mjs](../tests/movement.test.mjs) | Pruebas automatizadas de colisión |
| [dist/favicon.svg](../dist/favicon.svg) | Icono de Habita |
| `dist/vendor/` | Librería 3D, controles, tipografía y licencias |
| [ABRIR_PROTOTIPO.command](../scripts/ABRIR_PROTOTIPO.command) | Lanzador local para Mac |
| [.github/workflows/pages.yml](../.github/workflows/pages.yml) | Verificación de archivos y publicación de `dist/` en GitHub Pages |
| [Descargar el repositorio](https://github.com/geroo03/inmobiliaria-c-rdoba-3D/archive/refs/heads/main.zip) | Copia descargable de la aplicación y su documentación |

Esta copia reúne la aplicación y los documentos de producción. El despliegue de GitHub Pages publica únicamente el contenido de `dist/`; la documentación permanece disponible en el repositorio.

## 6. Comprobaciones realizadas

En la versión inicial se ejecutaron las siguientes comprobaciones con Playwright y Chrome. La ampliación del recorrido y de la construcción se documenta por separado en [Mejoras de construcción y recorrido](MEJORAS_CONSTRUCCION_Y_RECORRIDO.md):

| N.º | Comprobación | Resultado observado |
| --- | --- | --- |
| 1 | Cambio a vista superior | Se activó el plano |
| 2 | Giro de la vista interior | Cambió la imagen renderizada al arrastrar |
| 3 | Entrada a los siete ambientes | Se seleccionó el ambiente correspondiente |
| 4 | Tecla `Escape` | Regresó al plano |
| 5 | Botón de techo | Cambió su estado |
| 6 | Iluminación | Se activó el modo atardecer |
| 7 | Reproducción y pausa | El progreso avanzó y se detuvo |
| 8 | Control manual de la construcción | Funcionaron los valores de inicio, intermedios y final |
| 9 | Paso de construcción a exploración | Se activó la experiencia de exploración |
| 10 | Ancho de escritorio | No hubo desbordamiento horizontal |
| 11 | Vista móvil y controles táctiles emulados | Funcionaron selección, regreso y construcción |
| 12 | Errores del navegador | No se registraron errores JavaScript ni errores de consola en esas pruebas |

Se comprobaron tamaños de 1440 × 1050 y 390 × 844 píxeles. La vista móvil se probó mediante emulación en Chrome: queda pendiente la validación en teléfonos físicos, Safari de iPhone y otros navegadores. Tampoco se hizo una prueba de carga con clientes concurrentes ni una auditoría completa de accesibilidad.

Estas pruebas corresponden al prototipo desarrollado; no sustituyen las pruebas de una futura versión con fotografías, modelos y servicios nuevos.

## 7. Cómo abrirlo localmente

Desde la raíz de este repositorio:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Abrir `http://127.0.0.1:4173`. También se puede usar el lanzador para Mac. El servidor de la prueba de desarrollo ya fue detenido: hay que iniciarlo para usar el enlace local.

## 8. Qué se puede aprovechar para el producto real

Se pueden conservar la identidad visual de ejemplo, la organización de controles y el flujo «vista general → elegir ambiente → entrar → volver». La interfaz deberá ajustarse a la marca de la inmobiliaria y a las pruebas con sus clientes.

Para pasar a propiedades reales, el trabajo principal es conseguir y preparar el contenido: plano, fotografías, panoramas o captura espacial. Después hay que incorporar varias propiedades, carga y actualización de contenido, publicación para visitantes y pruebas con equipos reales.

El punto de partida operativo está en [POR_DONDE_EMPEZAR.md](POR_DONDE_EMPEZAR.md). Las alternativas y la arquitectura propuesta están en [GUIA_PRODUCCION_REAL.md](GUIA_PRODUCCION_REAL.md).
