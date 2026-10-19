# Visita real: un departamento recorrido con fotografías

**Demo:** https://geroo03.github.io/inmobiliaria-c-rdoba-3D/visita-real/ · **Contenido:** 8 fotografías reales con licencia libre · **Tecnología:** HTML, CSS y JavaScript, sin WebGL · **Dispositivos:** PC y celular

![Visita real: visor de fotos con plano orientativo y lista de ambientes](../img/visita-real.jpg)
<sub>Captura de la demo. Foto del living: Chris Olszewski / Wikimedia Commons, CC BY-SA 4.0.</sub>

## En una frase

Un departamento que existe, mostrado **ambiente por ambiente con sus fotos**: el visitante elige un espacio en un plano orientativo, ve sus fotografías, las amplía y comparte el enlace exacto de lo que está mirando.

## Por qué importa esta demo

Casa Patio y Noveno muestran qué se puede hacer con un modelo 3D inventado. Esta demo muestra el **primer escalón del producto real**: con fotos comunes y un esquema de la distribución ya se puede armar una visita navegable. Es el caso «Fotos comunes → plano que abre galerías reales» de la [guía de producción real](../producto/guia-produccion-real.md#2-qué-material-permite-cada-resultado) y de [Por dónde empezar](../producto/por-donde-empezar.md#3-elegí-la-siguiente-acción-según-lo-que-tengas).

Además, es la demo que **ya separa los datos del visor** (`data.js` y `photos.js` por un lado, `app.js` por otro), por lo que es la base más directa para un piloto con una propiedad propia. Ver [cómo adaptarla](#cómo-adaptarla-a-una-propiedad-propia).

## Qué propiedad se muestra

Las fotos son de la serie *Interior of apartment in Brisbane, 2025*, de **Chris Olszewski**, publicada en Wikimedia Commons con licencia **CC BY-SA 4.0** y tomada el 29 de junio de 2025. Se usan las versiones de 1280 px de ancho, sin retoques.

> [!IMPORTANT]
> El departamento **no se ofrece en venta** y no tenemos su plano medido, su piso ni su dirección. El plano de la demo es un **esquema de navegación que no está a escala** y no certifica la distribución real. El autor de las fotos no patrocina la demo. La página aclara todo esto junto a la experiencia y conviene mantener esos avisos.

Créditos completos por fotografía: [créditos y licencias](../creditos-y-licencias.md#fotografías-de-la-visita-real).

## Ambientes y fotos

| N.º | Ambiente | Fotos | Enlaces dentro de la foto |
| --- | --- | --- | --- |
| 01 | Living | Living y balcón | → Cocina |
| 02 | Comedor | Comedor y acceso al dormitorio | → Dormitorio |
| 03 | Cocina | Cocina integrada | → Living |
| 04 | Dormitorio | Vista frontal · Hacia la ventana | — |
| 05 | Baño | Vista general · Lavabos · Ducha | — |

Los «enlaces dentro de la foto» son puntos sobre la imagen que llevan a otro ambiente que aparece en esa foto. Como la serie no tiene fotos 360°, cada foto muestra un encuadre fijo.

## Qué se puede hacer

- **Dos vistas:** *Recorrido en fotos* y *Ver desde arriba* (plano orientativo grande).
- **Elegir ambiente** desde la lista, el plano, el mini plano lateral o los puntos sobre la foto. El botón **Seguir** lleva al ambiente siguiente y, al terminar, vuelve al primero.
- **Recorrer las 8 fotos** con las flechas o con la tira de miniaturas.
- **Ampliar hasta 3×** y mover la foto ampliada para ver detalles; el desplazamiento se limita para que la imagen no se salga del visor.
- **Pantalla completa**, con un modo ampliado alternativo cuando el navegador no la permite (por ejemplo, en iPhone).
- **Progreso:** cuenta los ambientes visitados («3 de 5 espacios»).
- **Compartir:** copia un enlace que abre el mismo ambiente y la misma foto; si el navegador no deja copiar, muestra el enlace para copiarlo a mano.
- **Créditos:** cada foto tiene autor, fuente y licencia a un clic.
- **Fallos de carga:** si una foto no carga, aparece un aviso con **Reintentar** y se puede seguir usando el resto.
- **Accesibilidad:** los ambientes del plano se activan con teclado (Enter o espacio), los cambios de foto se anuncian a lectores de pantalla y se respeta la preferencia de movimiento reducido. Sin JavaScript, la página ofrece abrir la foto del living.

### Controles

| Acción | PC | Celular |
| --- | --- | --- |
| Cambiar de foto | Flechas **← →** (con el foco en el visor), botones o miniaturas | Botones o miniaturas |
| Ampliar o alejar | **+** / **−** (con el foco en el visor), botones, doble clic (alterna 1× y 2×), **Ctrl + rueda** o rueda en pantalla completa | Pellizcar o botones |
| Mover la foto ampliada | Arrastrar | Arrastrar |
| Ver la foto completa | **Escape** o ↺ | ↺ |
| Cambiar de ambiente | Lista, plano, puntos sobre la foto o **Seguir** | Igual |

## Enlaces para compartir

| Parámetro | Valores | Si falta o no es válido |
| --- | --- | --- |
| `ambiente` | `living`, `comedor`, `cocina`, `dormitorio`, `bano` | `living` |
| `foto` | `living`, `comedor`, `cocina`, `dormitorio-frente`, `dormitorio-ventana`, `bano`, `bano-lavabos`, `bano-ducha` | Primera foto del ambiente |
| `vista` | `plano` (si falta, se abren las fotos) | Fotos |

Ejemplo: [`visita-real/?ambiente=bano&foto=bano-ducha`](https://geroo03.github.io/inmobiliaria-c-rdoba-3D/visita-real/?ambiente=bano&foto=bano-ducha) abre la ducha del baño.

Una foto que no pertenece al ambiente pedido se reemplaza por la primera de ese ambiente. Al compartir, el enlace se genera limpio: solo lleva estos parámetros, sin otros datos que hubiera en la dirección. Igual que en Noveno, **los enlaces son públicos**.

## Código

| Archivo | Responsabilidad |
| --- | --- |
| [dist/visita-real/index.html](../../dist/visita-real/index.html) | Estructura, textos, diálogos de créditos y de compartir |
| [dist/visita-real/styles.css](../../dist/visita-real/styles.css) | Estilo y adaptación a celular |
| [dist/visita-real/app.js](../../dist/visita-real/app.js) | Visor, plano SVG, zoom y desplazamiento, pantalla completa, progreso, compartir y créditos |
| [dist/visita-real/data.js](../../dist/visita-real/data.js) | Ambientes, rectángulos del plano, puntos de enlace, lectura y escritura de enlaces, límites del desplazamiento |
| [dist/visita-real/photos.js](../../dist/visita-real/photos.js) | Datos de cada foto: ambiente, título, archivo, autor, fuente, licencia, fecha y cambios |
| [dist/visita-real/photos/](../../dist/visita-real/photos/) | Las 8 fotos JPG (1280 px de ancho, unos 1,8 MB en total) |
| [tests/visita-real.test.mjs](../../tests/visita-real.test.mjs) | 4 pruebas: fotos locales válidas con fuente y licencia, recorrido completo y enlaces internos, enlaces compartidos seguros, límites del zoom |

No usa Three.js: no descarga la librería 3D y funciona aunque el dispositivo no tenga WebGL.

## Cómo adaptarla a una propiedad propia

Para un piloto con fotos de una propiedad real, estos son los puntos a cambiar:

1. **Fotos:** guardarlas en `photos/` con nombres estables por ambiente y vista (por ejemplo `living-ventana.jpg`), a unos 1280 px de ancho.
2. **`photos.js`:** una entrada por foto con `id`, `room`, `label` y `src`. Reemplazar los datos de procedencia por los propios: quién tomó la foto, fecha y autorización de publicación.
3. **`data.js`:** definir los ambientes (`id`, `name`, `number`, `description`), su rectángulo en el plano (`rect: [x, y, ancho, alto]` en un lienzo de 660 × 490) y la posición del nombre (`point`). Los puntos de enlace van por foto, con `x` e `y` en porcentaje de la imagen.
4. **Plano:** si hay plano medido, reemplazar el esquema por un SVG del plano real y revisar el aviso «no está a escala».
5. **Textos fijos que hoy dependen de esta propiedad** (conviene pasarlos a los datos antes del piloto):
   - `app.js`: el contador `/ 08` y «de 5 espacios»; el texto alternativo de las fotos (menciona Brisbane y al autor); los muebles simbólicos de cada ambiente y los elementos «PASO» y «BALCÓN» del plano.
   - `index.html`: nombre «Departamento Brisbane», subtítulo, «5 espacios · 8 fotografías», imagen inicial y precarga (`living.jpg`), descripción de la página, créditos del pie y del diálogo.
6. **Pruebas:** ajustar `tests/visita-real.test.mjs`, que hoy espera 8 fotos de Wikimedia Commons de Chris Olszewski con licencia CC BY-SA 4.0.
7. **Antes de publicar:** revisar en las fotos personas, documentos, reflejos y otros datos privados, y confirmar con el responsable de la propiedad el material final ([checklist completa](../producto/por-donde-empezar.md#7-condiciones-para-enviar-el-enlace-a-clientes)).

El siguiente salto de calidad es reemplazar cada foto por **panoramas 360°** para poder mirar alrededor desde cada punto: el plano, los ambientes y los enlaces de esta demo siguen sirviendo.

---

Historial de versiones y verificaciones: [CHANGELOG](../../CHANGELOG.md) · Arquitectura y pruebas: [documentación técnica](../tecnico/arquitectura.md)
