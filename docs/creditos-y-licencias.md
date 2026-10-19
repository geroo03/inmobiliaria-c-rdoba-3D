# Créditos y licencias

Material de terceros incluido en el sitio y condiciones para seguir usándolo.

## Fotografías de la Visita real

Las ocho fotos son de **Chris Olszewski** ([Kgbo en Wikimedia Commons](https://commons.wikimedia.org/wiki/User:Kgbo)), de la serie *Interior of apartment in Brisbane, 2025*, tomadas el 29 de junio de 2025 y publicadas con licencia [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

| Archivo en `dist/visita-real/photos/` | En la demo | Original en Wikimedia Commons |
| --- | --- | --- |
| `living.jpg` | Living y balcón | [Lounge, Interior of apartment in Brisbane, 2025,.jpg](https://commons.wikimedia.org/wiki/File:Lounge,_Interior_of_apartment_in_Brisbane,_2025,.jpg) |
| `comedor.jpg` | Comedor y acceso al dormitorio | [Dinning, Interior of apartment in Brisbane, 2025, 04.jpg](https://commons.wikimedia.org/wiki/File:Dinning,_Interior_of_apartment_in_Brisbane,_2025,_04.jpg) |
| `cocina.jpg` | Cocina integrada | [Kitchen, Interior of apartment in Brisbane, 2025, 03.jpg](https://commons.wikimedia.org/wiki/File:Kitchen,_Interior_of_apartment_in_Brisbane,_2025,_03.jpg) |
| `dormitorio-frente.jpg` | Dormitorio · vista frontal | [Bedroom, Interior of apartment in Brisbane, 2025, 01.jpg](https://commons.wikimedia.org/wiki/File:Bedroom,_Interior_of_apartment_in_Brisbane,_2025,_01.jpg) |
| `dormitorio-ventana.jpg` | Dormitorio · hacia la ventana | [Bedroom, Interior of apartment in Brisbane, 2025, 02.jpg](https://commons.wikimedia.org/wiki/File:Bedroom,_Interior_of_apartment_in_Brisbane,_2025,_02.jpg) |
| `bano.jpg` | Baño · vista general | [Bathroom, Interior of apartment in Brisbane, 2025, 08.jpg](https://commons.wikimedia.org/wiki/File:Bathroom,_Interior_of_apartment_in_Brisbane,_2025,_08.jpg) |
| `bano-lavabos.jpg` | Baño · lavabos | [Bathroom, Interior of apartment in Brisbane, 2025, 07.jpg](https://commons.wikimedia.org/wiki/File:Bathroom,_Interior_of_apartment_in_Brisbane,_2025,_07.jpg) |
| `bano-ducha.jpg` | Baño · ducha | [Shower, Interior of apartment in Brisbane, 2025, 06.jpg](https://commons.wikimedia.org/wiki/File:Shower,_Interior_of_apartment_in_Brisbane,_2025,_06.jpg) |

**Cambios:** se usan las versiones de 1280 px de ancho que genera Wikimedia, sin retoques de contenido. El visor permite ampliar y encuadrar, pero la foto completa siempre está disponible. La captura de pantalla de [docs/img/visita-real.jpg](img/visita-real.jpg) muestra la foto del living dentro de la interfaz. La imagen de vista previa [dist/og/visita-real.jpg](../dist/og/visita-real.jpg) usa la misma foto, recortada a 1200 × 630 con el título encima, y lleva impreso el crédito.

**Dónde se acredita en el sitio:** pie de página, botón **ⓘ Créditos** del visor y diálogo «Ver fuentes y licencia de las imágenes», con autor, fuente y licencia por foto. Los mismos datos están en [dist/visita-real/photos.js](../dist/visita-real/photos.js), que es la fuente de verdad.

### Qué permite la licencia CC BY-SA 4.0

Resumen orientativo; lo que rige es el [texto de la licencia](https://creativecommons.org/licenses/by-sa/4.0/legalcode.es).

- Se pueden copiar, mostrar y adaptar las fotos, también con fines comerciales.
- Hay que **citar al autor, enlazar la fuente y la licencia, e indicar si se hicieron cambios**, sin sugerir que el autor respalda el uso.
- Si se publica una **versión modificada** de una foto (recorte, retoque, montaje), esa versión debe compartirse con la misma licencia.

Por eso, al reutilizar la Visita real: mantener los créditos visibles, conservar el aviso de que la propiedad no está en venta y el autor no patrocina la demo, y registrar aquí cualquier cambio sobre las imágenes.

## Panoramas del Recorrido 360°

Los tres panoramas son de **Greg Zaal**, publicados en [Poly Haven](https://polyhaven.com/) con licencia [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) (dominio público: se pueden usar y modificar sin pedir permiso ni citar). Igual se acreditan en la página.

| Archivos en `dist/visita-360/panoramas/` | En la demo | Original en Poly Haven |
| --- | --- | --- |
| `terraza.jpg`, `terraza-preview.jpg` | Terraza | [Lythwood Terrace](https://polyhaven.com/a/lythwood_terrace) |
| `living.jpg`, `living-preview.jpg` | Living | [Lythwood Lounge](https://polyhaven.com/a/lythwood_lounge) |
| `dormitorio.jpg`, `dormitorio-preview.jpg` | Dormitorio | [Lythwood Room](https://polyhaven.com/a/lythwood_room) |

**Cambios:** se partió del JPG de 8192 × 4096 que ofrece Poly Haven y se redujo a 4096 × 2048 (vista en alta) y 1024 × 512 (vista previa), sin retoques de contenido. La imagen de vista previa [dist/og/visita-360.jpg](../dist/og/visita-360.jpg) muestra el living con el título encima.

## Tipografía

**DM Sans** — Copyright 2014 The DM Sans Project Authors. Licencia [SIL Open Font License 1.1](https://openfontlicense.org/). Archivo: `dist/vendor/dm-sans.ttf`; licencia completa en [dist/vendor/LICENSE-DM-Sans.txt](../dist/vendor/LICENSE-DM-Sans.txt).

## Librería 3D

**Three.js 0.164.1** — Copyright © 2010-2024 three.js authors. Licencia MIT. Incluye el núcleo (`three.module.js`) y los complementos `OrbitControls.js`, `RoundedBoxGeometry.js` y `RoomEnvironment.js`. Licencia completa en [dist/vendor/LICENSE-three.txt](../dist/vendor/LICENSE-three.txt).

## Generador de códigos QR

**QR Code Generator for JavaScript 1.4.4** — Copyright (c) 2009 Kazuhiko Arase. Licencia MIT. Genera el código del botón «Abrir en el celular». Archivo: `dist/vendor/qrcode.js`; licencia completa en [dist/vendor/LICENSE-qrcode.txt](../dist/vendor/LICENSE-qrcode.txt). «QR Code» es una marca registrada de DENSO WAVE INCORPORATED.

## Código propio

El código, los modelos generados por código, el diseño y la documentación de este repositorio son de **Sebastian Geronimo Peralta, con todos los derechos reservados** ([LICENSE](../LICENSE)). Se puede ver el repositorio y usar las demos para evaluar el proyecto; copiar, modificar o usar comercialmente ese material requiere autorización por escrito. El material de terceros de esta página conserva sus propias licencias.

Si más adelante se quiere abrir el código (por ejemplo, con licencia MIT), alcanza con reemplazar el archivo `LICENSE`. Lo que se haya publicado con una licencia abierta ya no se puede retirar.
