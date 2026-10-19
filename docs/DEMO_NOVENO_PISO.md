# Noveno: edificio y tres departamentos

**Demo pública:** https://geroo03.github.io/inmobiliaria-c-rdoba-3D/noveno/

## Qué se puede probar

Se representa un noveno piso situado aproximadamente 27 m sobre la calle, con tres unidades seleccionables y una galería común de acceso. Las unidades se muestran como disponibles dentro de una oferta ficticia; no se publican precios ni direcciones reales.

| Unidad | Dormitorios | Superficie cubierta ilustrativa | Balcón | Total aproximado |
| --- | --- | --- | --- | --- |
| 9A | 1 | 76,8 m² | 10,2 m² | 87 m² |
| 9B | 2 | 96 m² | 12,8 m² | 108,8 m² |
| 9C | 3 | 120 m² | 16 m² | 136 m² |

Las superficies parten de las dimensiones generales del modelo e incluyen espesores y circulación. No son superficies de escritura ni de mensura.

La experiencia incluye:

- **Edificio:** volumen de las plantas inferiores, balcones, acceso común y ciudad a nivel de calle.
- **Piso 9:** las tres distribuciones juntas, con selección sobre la maqueta o desde la lista.
- **Unidad 3D:** vista del departamento elegido; también se puede mirar desde arriba.
- **Recorrido:** movimiento con teclado o botones táctiles, mirada mediante arrastre, selección de ambientes y plano de ubicación.
- **Balcón:** salida transitable desde el living, barandas que limitan el movimiento y vista hacia el entorno situado debajo.
- **Compartir:** un enlace público conserva el departamento y el modo de vista. Ejemplo: `noveno/?unidad=9c&vista=recorrido`.
- **Iluminación:** día y atardecer, materiales con texturas, reflejos y luces interiores.

En PC: WASD o flechas para caminar, arrastrar para mirar y Escape para volver al plano de la unidad. En celular: arrastrar para mirar y mantener pulsadas las flechas para caminar. Fuera del recorrido, un dedo gira la maqueta y dos dedos permiten desplazarla y acercarla.

Los enlaces de esta demo son públicos. No son invitaciones privadas ni comprueban la identidad del visitante. Para ese producto se necesita el control de usuarios, permisos por propiedad y protección de los archivos descritos en la guía de producción.

## Qué significa “real” en este caso

La demo es una recreación arquitectónica navegable. El edificio, sus tres distribuciones, el mobiliario, la disponibilidad y la ciudad se crearon como ejemplo. No se usaron fotografías de una propiedad existente y las vistas del balcón no corresponden a una dirección real. La página lo indica junto a la experiencia.

Para mostrar un departamento real existen dos caminos:

1. **Fotos 360° vinculadas al plano.** El visitante ve fotografías del inmueble y pasa entre puntos de captura. Puede mirar alrededor de cada punto; la traslación continua requiere otra técnica. Es una opción adecuada para mostrar el estado actual con fidelidad fotográfica.
2. **Modelo o captura espacial del departamento.** Permite desplazarse dentro del espacio y verlo desde arriba. Hay que obtener o modelar sus medidas, aberturas, materiales y mobiliario, y optimizar el archivo para web. Las fotos comunes sirven como referencias; por sí solas no garantizan una reconstrucción fiel.

Para que la vista desde un noveno piso sea real, también hace falta capturar desde sus ventanas y balcones. Una ciudad inventada no permite evaluar las vistas, los edificios vecinos ni la orientación verdadera.

## Con qué empezar para un edificio concreto

1. Elegir una sola unidad real para el piloto.
2. Obtener el plano medido, identificar planta y unidad, y confirmar la autorización para publicar las imágenes.
3. Capturar todos los ambientes y el balcón; usar panoramas 360° si se elige el recorrido fotográfico.
4. Incorporar ese material y ajustar los accesos, pasos, alturas y superficies del modelo.
5. Verificar que lo publicado corresponde al inmueble y probarlo en PC, Android e iPhone.
6. Una vez aprobado el piloto, sumar las otras dos unidades al plano del piso.

La reconstrucción de una propiedad real requiere ese material; cambiar nombres o cargar una foto sobre estos modelos no convierte las unidades de ejemplo en esa propiedad.

## Organización del código

| Archivo | Función |
| --- | --- |
| `dist/noveno/units.js` | Datos, distribución, huecos de puertas y lectura de enlaces |
| `dist/noveno/model.js` | Departamentos, mobiliario, edificio y obstáculos de movimiento |
| `dist/noveno/city.js` | Entorno urbano ficticio a nivel de calle |
| `dist/noveno/app.js` | Selección de unidad, cámaras, recorrido, planos y compartir |
| `dist/noveno/index.html` / `styles.css` | Interfaz adaptable a PC y celular |
| `dist/walk-navigation.js` | Control de movimiento compartido con Casa Patio; acepta límites por unidad |
| `tests/noveno.test.mjs` | Enlaces, posiciones iniciales, puertas, balcón y separación entre unidades |

El sitio funciona con los recursos incluidos en el repositorio, sin claves ni servicios externos durante la navegación. La ruta `noveno/` se publica junto con Casa Patio mediante GitHub Pages. La documentación permanece en el repositorio.

Más detalle: [Guía de producción real](GUIA_PRODUCCION_REAL.md) y [Por dónde empezar](POR_DONDE_EMPEZAR.md).

## Verificaciones de esta versión

- **13 pruebas automatizadas con Node:** colisiones compartidas, lectura de enlaces, puntos iniciales, puertas y separación de unidades. Se ejecutan con `npm test` y también antes de publicar en GitHub Actions.
- **12 comprobaciones funcionales con Chrome y Playwright:** selección, planos, entrada y movimiento en los 18 ambientes, recorridos continuos de las tres unidades, límites de balcón, plano de ubicación, enlaces, iluminación, pantalla completa, gestos táctiles, funcionamiento de Casa Patio y ausencia de errores JavaScript/HTTP.
- **Revisión visual:** capturas del edificio, piso completo, interiores y balcón en escritorio; selección y recorrido en pantalla móvil. Tamaños usados: 1512 × 1120 y 390 × 844 píxeles.

Las pruebas móviles usan emulación de Chrome. Queda pendiente la comprobación en dispositivos físicos, Safari de iPhone y con conexiones móviles lentas. El desempeño de una futura propiedad capturada con fotos o modelos externos debe medirse con ese material real.
