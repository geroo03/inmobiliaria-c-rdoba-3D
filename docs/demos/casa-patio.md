# Casa Patio: construcción por etapas y recorrido 3D

**Demo:** https://geroo03.github.io/inmobiliaria-c-rdoba-3D/ · **Contenido:** modelo 3D ficticio · **Tecnología:** Three.js sobre WebGL · **Dispositivos:** PC y celular

![Casa Patio: maqueta 3D con los siete ambientes seleccionables](../img/casa-patio.jpg)

## En una frase

Una casa ficticia que el visitante primero ve **construirse en nueve etapas** y después **recorre a pie**, ambiente por ambiente, con el mismo modelo 3D.

**Casa Patio** tiene una distribución de ejemplo: 120 m² interiores, dos dormitorios, un baño y un patio de 36 m². Las superficies, la distribución y la secuencia de obra son ilustrativas.

## Ver construcción

La obra avanza en una secuencia de **48 segundos** (duración nominal) dividida en nueve etapas:

1. Replanteo y excavación.
2. Armaduras y cimientos.
3. Estructura y contrapiso.
4. Mampostería por hiladas.
5. Losa y cubierta.
6. Instalaciones y revoques.
7. Pisos y aberturas.
8. Equipamiento interior.
9. Patio y jardín.

Se puede reproducir, pausar, reiniciar, mover la barra de progreso en ambas direcciones y saltar al cierre de cada etapa. Al retroceder, la escena se reconstruye en el estado que corresponde. Desde el final se pasa directamente a explorar la casa terminada.

La animación incluye armaduras, hormigón, columnas, vigas, andamios, apuntalamiento, encofrado de cubierta y cañerías. Los ladrillos se colocan por hiladas alternadas y respetan los huecos de puertas y ventanas; el revoque los recubre a medida que avanza la obra. La cubierta se oculta durante las terminaciones, con un aviso en pantalla, para que se vea lo que pasa adentro.

> [!NOTE]
> La secuencia es una explicación visual. No es una planificación de obra, un cálculo estructural ni el registro de cómo se construyó una vivienda real. Si el equipo renderiza con lentitud, la reproducción puede durar más de 48 segundos.

## Explorar la casa

El visitante alterna entre una **maqueta 3D** que se gira, desplaza y acerca, y una **vista superior** del mismo modelo. Hay siete ambientes: living, cocina, comedor, dormitorio principal, segundo dormitorio, baño y patio con terraza.

Un ambiente se elige desde la lista, desde su etiqueta sobre la maqueta, tocándolo en el plano o desde el pequeño plano de ubicación. La cámara viaja hasta ese ambiente (las paredes se ocultan durante el viaje para no tapar el movimiento) y desde ahí se puede mirar y caminar:

- El movimiento es horizontal, a 1,7 m de altura de observación. No hay escaleras, saltos ni cambios de nivel.
- Paredes, vidrios cerrados y muebles principales bloquean el paso. Las puertas y la salida de vidrio entre comedor y patio están abiertas.
- El nombre del ambiente y el plano de ubicación (posición y dirección de la mirada) se actualizan al caminar.
- Opciones: techo visible u oculto, luz de día o atardecer, restablecer la cámara y pantalla completa cuando el navegador la admite.

### Controles

| Vista | PC | Celular |
| --- | --- | --- |
| Maqueta | Arrastrar para girar; botón derecho para desplazar; rueda para acercar | Un dedo para girar; dos dedos para desplazar y acercar |
| Plano superior | Arrastrar para desplazar; clic en un ambiente para entrar | Arrastrar el plano y tocar un ambiente |
| Dentro de la casa | Arrastrar para mirar; **WASD** o **flechas** para caminar | Arrastrar para mirar; mantener pulsadas las flechas del visor |
| Cambiar de ambiente | Lista o plano de ubicación | Lista o plano de ubicación |
| Volver al plano | **Escape**, botón Plano o Volver al plano | Botón Plano o Volver al plano |

Para caminar con el teclado hay que entrar primero a un ambiente; durante el viaje de la cámara el movimiento se habilita al llegar.

## Cómo está hecha

La animación, el plano y los interiores usan **un único modelo**, así que cada ambiente está en el mismo lugar en todas las vistas.

| Parte | Implementación |
| --- | --- |
| Interfaz | HTML, CSS y JavaScript, sin framework |
| Visualización | Three.js 0.164.1 sobre WebGL |
| Modelo | Geometría generada por código: paredes, pisos, aberturas, muebles y vegetación |
| Cámara general | OrbitControls: giro, desplazamiento y acercamiento |
| Recorrido | Cámara a altura fija; teclado, arrastre, botones táctiles y colisiones calculadas en subpasos |
| Selección | Botones y detección de superficies por *raycasting* |
| Construcción | Nueve etapas, geometría temporal de obra y ladrillos instanciados |
| Materiales | Texturas de madera, revoque y hormigón generadas en el navegador; bordes suaves en almohadones y colchones; los vidrios no proyectan sombras opacas |

No necesita base de datos, servidor ni claves: el contenido de la propiedad está escrito en el código.

### Código

| Archivo | Responsabilidad |
| --- | --- |
| [dist/index.html](../../dist/index.html) | Estructura, textos y controles de la interfaz |
| [dist/styles.css](../../dist/styles.css) | Estilo visual y adaptación a pantallas chicas |
| [dist/app.js](../../dist/app.js) | Distribución de la casa, muebles, obstáculos, cámaras, selección e iluminación |
| [dist/construction.js](../../dist/construction.js) | Etapas, duraciones, piezas temporales de obra y colocación de ladrillos |
| [dist/walk-navigation.js](../../dist/walk-navigation.js) | Recorrido a pie: teclado, arrastre para mirar, botones táctiles (compartido con Noveno) |
| [dist/movement.js](../../dist/movement.js) | Colisión de un círculo contra rectángulos y avance en subpasos (compartido con Noveno) |
| [dist/scene-materials.js](../../dist/scene-materials.js) | Texturas generadas localmente (compartido con Noveno) |
| [tests/movement.test.mjs](../../tests/movement.test.mjs) | 7 pruebas de colisión: puertas, paredes, deslizamiento, muebles y límites del terreno |

### Al modificar la casa

- Las paredes agregan solas sus segmentos al sistema de colisiones.
- Los obstáculos de los muebles son rectángulos aproximados definidos en `app.js`: **si se mueve un mueble, hay que mover también su obstáculo**.
- Después de cambiar la distribución, comprobar que el punto de entrada de cada ambiente y cada paso queden libres (`npm test` cubre la lógica de colisión, no la distribución concreta de la casa).

## Alcance del realismo

La casa es un modelo creado para esta demostración, con estética de maqueta arquitectónica: no es un render fotográfico ni un relevamiento. Las medidas de armaduras y elementos estructurales no son una especificación técnica.

- **Para mostrar una propiedad existente:** partir de su plano medido y de fotografías de cada ambiente con autorización para publicarlas; construir o capturar su modelo y ajustar puertas, recorridos, materiales y muebles a esas referencias.
- **Para mostrar cómo se construyó realmente una obra:** sumar planos de obra y fotos o videos fechados de cada etapa, y validar la secuencia con el profesional responsable. Si la secuencia se arma solo a partir del plano, hay que presentarla como conceptual.

El camino completo está en la [guía de producción real](../producto/guia-produccion-real.md).

## Qué se puede reutilizar en el producto real

- El flujo **vista general → elegir ambiente → entrar → volver**, que comparten las tres demos.
- La organización de controles y el plano de ubicación durante el recorrido.
- La animación de construcción, como módulo opcional para proyectos que tengan modelo por componentes o registro de obra.

La identidad visual es de ejemplo y debe adaptarse a la marca de la inmobiliaria.

---

Historial de versiones y verificaciones: [CHANGELOG](../../CHANGELOG.md) · Arquitectura y pruebas: [documentación técnica](../tecnico/arquitectura.md)
