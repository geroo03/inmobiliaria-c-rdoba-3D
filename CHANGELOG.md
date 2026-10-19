# Historial de cambios

Cambios de cada versión, de la más reciente a la más antigua, con las verificaciones hechas al cerrarla. Cada versión corresponde a un commit de `main`.

## Documentación integral · 18/10/2026

### Cambiado
- Documentación reorganizada en `docs/demos/`, `docs/producto/` y `docs/tecnico/`, con un [índice](docs/README.md) y un glosario.
- El informe del prototipo y el documento de mejoras se unificaron en la [ficha de Casa Patio](docs/demos/casa-patio.md); sus verificaciones históricas pasaron a este archivo.
- README con capturas de las tres demos, inicio rápido y estructura del repositorio.
- `package.json`: nuevo script `npm start` y versión mínima de Node.js declarada.

### Agregado
- [Ficha de la Visita real](docs/demos/visita-real.md), con una guía para adaptarla a una propiedad propia.
- [Documentación técnica](docs/tecnico/arquitectura.md): módulos, enlaces públicos, pruebas, publicación y estado de calidad.
- [Créditos y licencias](docs/creditos-y-licencias.md): atribución por foto (CC BY-SA 4.0), DM Sans y Three.js. Reemplaza la referencia a un archivo de créditos que no existía.

## Visita real con fotografías · `f366f0f` · 18/10/2026

### Agregado
- Demo [`/visita-real/`](https://geroo03.github.io/inmobiliaria-c-rdoba-3D/visita-real/): un departamento de Brisbane en 5 ambientes y 8 fotos reales de Wikimedia Commons, con plano orientativo, puntos de enlace entre ambientes, zoom hasta 3×, pantalla completa, progreso de la visita, enlaces por ambiente y foto, y créditos por imagen.
- Aviso de la nueva demo en Casa Patio y Noveno.
- 4 pruebas automatizadas de la Visita real.
- Comprobaciones de la Visita real en el workflow de publicación.

### Cambiado
- Documentación movida a `docs/` y lanzador para Mac a `scripts/`.

### Verificado
- 17 pruebas automatizadas con `npm test` (7 de colisión, 6 de Noveno y 4 de la Visita real).

## Noveno: tres departamentos en altura · `56506cc` · 18/10/2026

### Agregado
- Demo [`/noveno/`](https://geroo03.github.io/inmobiliaria-c-rdoba-3D/noveno/): edificio ficticio con tres unidades (9A, 9B y 9C) en un piso 9 a unos 27 m de altura, 18 ambientes recorribles, balcón transitable con barandas y ciudad recreada debajo.
- Vistas de edificio, piso, unidad y recorrido; iluminación de día o atardecer.
- Enlaces públicos por unidad y vista (`?unidad=9c&vista=recorrido`).
- 6 pruebas automatizadas de Noveno.

### Cambiado
- `walk-navigation.js` acepta límites de movimiento distintos por unidad.

### Verificado
- 13 pruebas automatizadas con Node: colisiones, lectura de enlaces, puntos iniciales, puertas y separación de unidades.
- 12 comprobaciones funcionales con Chrome y Playwright: selección, planos, entrada y movimiento en los 18 ambientes, recorridos continuos de las tres unidades, límites del balcón, plano de ubicación, enlaces, iluminación, pantalla completa, gestos táctiles, funcionamiento de Casa Patio y ausencia de errores JavaScript o HTTP.
- Revisión visual en 1512 × 1120 y 390 × 844 píxeles (celular emulado en Chrome).

## Construcción por etapas y recorrido a pie · `be689ac` · 18/10/2026

### Cambiado
- La construcción pasó de seis grupos que crecían en altura a **nueve etapas en 48 segundos**: excavación, armaduras, cimientos de hormigón, columnas, vigas, andamios, ladrillos por hiladas alternadas que respetan las aberturas, apuntalamiento, encofrado de cubierta, instalaciones, revoques, pisos, aberturas, equipamiento y jardín.
- La cubierta se oculta durante las terminaciones, con un aviso en pantalla. La barra de progreso permite avanzar, retroceder y detenerse en cualquier etapa.
- Se reubicaron el sofá y las mesadas para dejar pasos libres.

### Agregado
- Recorrido a pie con WASD, flechas o botones táctiles; colisiones contra paredes, vidrios cerrados y muebles principales; salida abierta del comedor al patio.
- Plano de ubicación con posición y dirección de la mirada; desplazamiento de la maqueta y pantalla completa.
- Texturas generadas localmente (madera, hormigón y revoque), bordes redondeados en almohadones y colchones, y vidrios sin sombras opacas.
- 7 pruebas automatizadas de colisión, que también corren en el workflow junto con la comprobación de sintaxis.

### Verificado
- 7 pruebas de colisión: puerta abierta, pared en un desplazamiento largo, deslizamiento lateral, separación del marco, muebles, límites del terreno y regreso por la misma puerta.
- 14 comprobaciones funcionales con Chrome y Playwright: desplazamiento de la maqueta, selección y mirada, entrada y movimiento en los siete ambientes, paso al patio en ambos sentidos, recorrido continuo entre habitaciones, colisión con una pared real del modelo, selección desde el plano de ubicación, botones de movimiento y detención, regreso, techo e iluminación, pantalla completa, etapas y retroceso de obra, gestos táctiles, preferencia de movimiento reducido y ausencia de errores JavaScript o HTTP.
- Pantallas de 1440 × 1100 y 390 × 844 píxeles sin desbordamiento horizontal (celular con emulación táctil).

## Primera publicación · `1e5b7d6` · 18/10/2026

### Agregado
- Casa Patio: construcción animada, maqueta 3D giratoria, vista superior y siete ambientes seleccionables con vista interior; techo opcional, día o atardecer, restablecer cámara y ficha del ambiente.
- Primeras versiones de la guía de producción real, la guía de inicio y el informe del prototipo.
- Publicación automática en GitHub Pages. Esta versión también se alojó en un sitio privado para revisión.

### Verificado
12 comprobaciones con Chrome y Playwright:

| N.º | Comprobación | Resultado |
| --- | --- | --- |
| 1 | Cambio a vista superior | Se activó el plano |
| 2 | Giro de la vista interior | Cambió la imagen al arrastrar |
| 3 | Entrada a los siete ambientes | Se seleccionó cada ambiente |
| 4 | Tecla Escape | Regresó al plano |
| 5 | Botón de techo | Cambió su estado |
| 6 | Iluminación | Se activó el atardecer |
| 7 | Reproducción y pausa | El progreso avanzó y se detuvo |
| 8 | Control manual de la construcción | Funcionaron inicio, valores intermedios y final |
| 9 | Paso de construcción a exploración | Se activó la exploración |
| 10 | Ancho de escritorio | Sin desbordamiento horizontal |
| 11 | Celular con controles táctiles emulados | Funcionaron selección, regreso y construcción |
| 12 | Errores del navegador | Sin errores JavaScript ni de consola |

Tamaños: 1440 × 1050 y 390 × 844 píxeles. Quedaron pendientes las pruebas en teléfonos físicos y Safari de iPhone, una prueba de carga y una auditoría de accesibilidad (seguimiento en la [documentación técnica](docs/tecnico/arquitectura.md#estado-de-calidad)).
