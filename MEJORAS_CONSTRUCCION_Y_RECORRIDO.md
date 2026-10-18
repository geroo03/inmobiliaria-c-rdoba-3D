# Construcción por etapas y recorrido a pie

Actualización del 18 de octubre de 2026.

**Demo:** https://geroo03.github.io/inmobiliaria-c-rdoba-3D/

## Qué cambió

La construcción pasó de seis grupos que crecían en altura a una secuencia de nueve etapas y 48 segundos. Se agregaron el trazado de excavaciones, armaduras, cimientos de hormigón, columnas, vigas, andamios, ladrillos por hiladas alternadas, apuntalamiento y encofrado de cubierta. Después aparecen instalaciones, revoques, pisos, aberturas, equipamiento y jardín.

Las hiladas conservan los huecos de puertas y ventanas. El revoque recubre la mampostería al avanzar la obra. La cubierta se oculta durante las terminaciones, con una explicación en pantalla, para poder observar lo que sucede adentro. La barra permite avanzar, retroceder y detenerse en cualquier etapa.

Se incorporaron texturas locales de madera, hormigón y revoque, bordes redondeados en almohadones y colchones, y un ajuste de iluminación. Los paños de vidrio dejan de proyectar sombras opacas. El modelo mantiene la estética de una maqueta arquitectónica.

## Cómo recorrer la casa

1. Abrir **Explorar la casa**.
2. Elegir un ambiente en la lista, sobre la maqueta o desde el plano superior.
3. Arrastrar sobre la imagen para mirar alrededor.
4. En PC, caminar con **WASD** o las **flechas**. En celular, mantener pulsados los botones de dirección del visor.
5. Pasar por las puertas para cambiar de ambiente. La salida de vidrio está abierta entre comedor y patio.
6. Usar el pequeño plano para ver la posición, la dirección de la mirada y cambiar directamente de ambiente.
7. Volver con **Escape**, **Plano** o **Volver al plano**.

La maqueta permite giro, zoom y desplazamiento: botón derecho en PC, dos dedos en celular. En la vista superior, arrastrar desplaza el plano. El botón de pantalla completa aparece en navegadores que ofrecen esa función.

El movimiento se limita al terreno transitable y evita paredes, paños de vidrio cerrados y mobiliario principal. Se ajustaron la ubicación del sofá y las mesadas para dejar pasos libres. La cámara mantiene una altura de observación de 1,7 m respecto del origen del modelo; no hay escaleras, saltos ni movimiento vertical.

## Archivos y mantenimiento

| Archivo | Responsabilidad |
| --- | --- |
| `dist/app.js` | Distribución de la propiedad, muebles, obstáculos y coordinación de las vistas |
| `dist/construction.js` | Etapas, duraciones, geometría temporal y colocación de ladrillos |
| `dist/walk-navigation.js` | Teclado, arrastre para mirar, botones táctiles y orientación |
| `dist/movement.js` | Colisión circular contra rectángulos y avance en subpasos |
| `dist/scene-materials.js` | Texturas generadas en el navegador, sin archivos remotos |
| `tests/movement.test.mjs` | Pruebas de puertas, paredes, deslizamiento, mobiliario y límites |

Las paredes aportan automáticamente sus segmentos al sistema de colisiones. Los obstáculos del mobiliario son aproximaciones rectangulares definidas en `app.js`: si se mueve un mueble, actualizar también su obstáculo. Al incorporar una propiedad nueva, comprobar que cada punto de entrada y cada paso queden libres.

La aplicación sigue siendo estática y compatible con GitHub Pages. No requiere claves ni servicios externos. El workflow comprueba los módulos y las pruebas antes de publicar `dist/`.

## Alcance del realismo y siguiente paso

La casa es ficticia y la secuencia de obra es una explicación visual. Los tamaños de armaduras y elementos estructurales no constituyen una especificación ejecutiva, y las etapas no prueban cómo se construyó una vivienda existente.

Para representar una propiedad real, comenzar con un plano medido, fotografías de cada ambiente y autorización para publicarlas. Construir o capturar el modelo de esa propiedad y ajustar puertas, recorridos, materiales y muebles a esas referencias. Para mostrar **cómo se construyó realmente**, sumar planos de obra y fotos o videos fechados de sus etapas, y validar la secuencia con el profesional responsable.

Si la prioridad es que el cliente vea el estado actual con apariencia fotográfica, el primer paso es un recorrido de panoramas 360° conectado con un plano. Si la prioridad es caminar libremente, hace falta un modelo 3D o una captura espacial optimizada. Las fotografías comunes por sí solas no garantizan una reconstrucción navegable fiel. Ver [Guía de producción real](GUIA_PRODUCCION_REAL.md) y [Por dónde empezar](POR_DONDE_EMPEZAR.md).

## Verificación

Se ejecutaron y pasaron **7 pruebas de colisión** con `npm test`: puerta abierta, pared con desplazamiento largo, deslizamiento lateral, separación del marco, muebles, límites del terreno y regreso por la misma puerta.

También pasaron **14 comprobaciones funcionales** con Playwright y Chrome: desplazamiento de la maqueta, selección y mirada, entrada y movimiento en los siete ambientes, paso al patio en ambos sentidos, recorrido continuo entre habitaciones, colisión con una pared real del modelo, selección desde el plano de ubicación, botones de movimiento y detención, regreso/techo/iluminación, pantalla completa, etapas y retroceso de obra, gestos táctiles, preferencia de movimiento reducido y ausencia de errores JavaScript/HTTP.

Se revisaron pantallas de 1440 × 1100 y 390 × 844 píxeles, sin desbordamiento horizontal. La prueba móvil usa emulación táctil: queda pendiente la comprobación en teléfonos físicos y Safari de iPhone. Las pruebas funcionales se ejecutaron durante esta revisión; el workflow de publicación ejecuta las siete pruebas de colisión y la comprobación de sintaxis.
