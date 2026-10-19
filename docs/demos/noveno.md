# Noveno: edificio y tres departamentos en 3D

**Demo:** https://geroo03.github.io/inmobiliaria-c-rdoba-3D/noveno/ · **Contenido:** modelo 3D ficticio · **Tecnología:** Three.js sobre WebGL · **Dispositivos:** PC y celular

![Noveno: piso 9 con las tres unidades](../img/noveno.jpg)

## En una frase

Un edificio de ejemplo cuyo **piso 9**, a unos 27 m sobre la calle, tiene tres departamentos que se pueden comparar, recorrer por dentro y visitar hasta el balcón, con una ciudad recreada debajo.

## Las unidades

Las unidades figuran como disponibles dentro de una oferta ficticia. No hay precios ni direcciones.

| Unidad | Nombre en la demo | Dormitorios | Cubierta | Balcón | Total aprox. | Ambientes del recorrido |
| --- | --- | --- | --- | --- | --- | --- |
| 9A | Un lugar para vos | 1 | 76,8 m² | 10,2 m² | 87 m² | Dormitorio, baño, cocina, comedor, living, balcón |
| 9B | Espacio para compartir | 2 | 96 m² | 12,8 m² | 108,8 m² | Dormitorio principal, segundo dormitorio, baño, cocina, living y comedor, balcón |
| 9C | Una casa en las alturas | 3 | 120 m² | 16 m² | 136 m² | Dormitorio principal, segundo y tercer dormitorio, baño, living y cocina, balcón |

Son 18 ambientes en total. Las superficies salen de las dimensiones generales del modelo e incluyen espesores y circulación: **no son superficies de escritura ni de mensura**.

## Qué se puede hacer

| Vista | Qué muestra |
| --- | --- |
| **Edificio** | Volumen de las plantas inferiores, balcones, acceso común y ciudad a nivel de calle |
| **Piso 9** | Las tres distribuciones juntas; se elige una unidad sobre la maqueta o desde la lista |
| **Unidad** | El departamento elegido, que también se puede mirar desde arriba |
| **Recorrido** | Caminata por los ambientes con plano de ubicación, hasta el balcón |

- **Balcón transitable:** se sale desde el living; las barandas limitan el paso y se ve el entorno debajo.
- **Iluminación:** día o atardecer, con texturas, reflejos y luces interiores.
- **Compartir:** cada unidad y cada vista tienen un enlace propio (ver más abajo).
- **Encuadre automático:** la cámara se aleja lo necesario para que el edificio, el piso o la unidad entren completos en cualquier pantalla. En visores angostos, las etiquetas 9A, 9B y 9C se muestran compactas para no pisarse.

### Controles

| Situación | PC | Celular |
| --- | --- | --- |
| Maqueta (edificio, piso, unidad) | Arrastrar para girar; botón derecho para desplazar; rueda para acercar | Un dedo para girar; dos dedos para desplazar y acercar |
| Recorrido | Arrastrar para mirar; **WASD** o **flechas** para caminar | Arrastrar para mirar; mantener pulsadas las flechas |
| Salir del recorrido | **Escape** o **Ver desde arriba** vuelven a la vista de la unidad | Botón **Ver desde arriba** |

## Enlaces para compartir

| Parámetro | Valores | Si falta o no es válido |
| --- | --- | --- |
| `unidad` | `9a`, `9b`, `9c` | `9b` |
| `vista` | `edificio`, `piso`, `unidad`, `recorrido` | `piso` |

Ejemplo: [`noveno/?unidad=9c&vista=recorrido`](https://geroo03.github.io/inmobiliaria-c-rdoba-3D/noveno/?unidad=9c&vista=recorrido) abre el recorrido del 9C.

> [!WARNING]
> Los enlaces son **públicos**: no son invitaciones privadas ni verifican quién los abre. Para un acceso por invitación hacen falta usuarios, permisos por propiedad y protección de los archivos (ver la [guía de producción real](../producto/guia-produccion-real.md#8-qué-hace-falta-para-publicar-a-clientes)).

## Alcance del realismo

El edificio, las tres distribuciones, el mobiliario, la disponibilidad y la ciudad son inventados. No se usaron fotos de un inmueble y **las vistas desde el balcón no corresponden a ninguna dirección real**; la página lo aclara junto a la experiencia.

Para un edificio real, además del interior, la vista importa: evaluar qué se ve desde un noveno piso, los edificios vecinos y la orientación exige capturar desde sus ventanas y balcones. Una ciudad recreada no sirve para eso.

### Cómo pasar a un edificio concreto

1. Elegir **una sola unidad real** para el piloto.
2. Conseguir su plano medido, identificar piso y unidad, y confirmar la autorización para publicar imágenes.
3. Capturar todos los ambientes y el balcón (panoramas 360° si se elige el recorrido fotográfico).
4. Incorporar ese material y ajustar accesos, pasos, alturas y superficies del modelo.
5. Verificar que lo publicado corresponde al inmueble y probarlo en PC, Android e iPhone.
6. Con el piloto aprobado, sumar las otras unidades al plano del piso.

Cambiar nombres o cargar una foto sobre estos modelos no convierte las unidades de ejemplo en una propiedad real. Los caminos posibles (fotos 360° vinculadas al plano o modelo/captura espacial) se comparan en la [guía de producción real](../producto/guia-produccion-real.md#2-qué-material-permite-cada-resultado).

## Código

| Archivo | Responsabilidad |
| --- | --- |
| [dist/noveno/units.js](../../dist/noveno/units.js) | Datos de las unidades, distribución, huecos de puertas y lectura de enlaces |
| [dist/noveno/model.js](../../dist/noveno/model.js) | Departamentos, mobiliario, edificio y obstáculos de movimiento |
| [dist/noveno/city.js](../../dist/noveno/city.js) | Entorno urbano ficticio a nivel de calle |
| [dist/noveno/app.js](../../dist/noveno/app.js) | Selección de unidad, cámaras con encuadre automático, recorrido, planos y compartir |
| [dist/noveno/index.html](../../dist/noveno/index.html) · [styles.css](../../dist/noveno/styles.css) | Interfaz adaptable a PC y celular |
| [dist/walk-navigation.js](../../dist/walk-navigation.js) | Recorrido a pie compartido con Casa Patio; acepta límites por unidad |
| [tests/noveno.test.mjs](../../tests/noveno.test.mjs) | 6 pruebas: enlaces, valores inválidos, puntos de entrada, puertas, balcón y separación entre unidades |

La ruta `noveno/` se publica junto con las otras demos y funciona solo con los recursos del repositorio, sin claves ni servicios externos.

---

Historial de versiones y verificaciones: [CHANGELOG](../../CHANGELOG.md) · Arquitectura y pruebas: [documentación técnica](../tecnico/arquitectura.md)
