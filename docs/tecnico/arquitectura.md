# Documentación técnica

Cómo está construido el sitio, cómo se prueba y se publica, y qué tener en cuenta al modificarlo.

## Principios

- **Sitio estático.** HTML, CSS y módulos JavaScript nativos del navegador. No hay compilación, framework ni dependencias de npm.
- **Todo incluido.** Three.js 0.164.1 y la tipografía DM Sans están en `dist/vendor/`. Al navegar no se descargan recursos de otros sitios; los únicos enlaces externos son los de créditos y licencias.
- **Sin servidor de aplicación.** No hay base de datos, cuentas ni claves: el contenido de cada demo está en sus módulos de datos o en su código.
- **Lo publicado es `dist/`.** La documentación, las pruebas y los scripts quedan en el repositorio y no se sirven en GitHub Pages.

## Mapa del repositorio

```text
.
├── README.md                    Portada del proyecto
├── CHANGELOG.md                 Historial de versiones y verificaciones
├── package.json                 Scripts: npm start (servidor local) y npm test
├── .github/workflows/pages.yml  Comprobaciones y publicación en GitHub Pages
├── scripts/
│   └── ABRIR_PROTOTIPO.command  Lanzador para Mac (doble clic)
├── tests/                       Pruebas con node:test, sin dependencias
├── docs/                        Documentación (no se publica en Pages)
└── dist/                        El sitio publicado
    ├── index.html · app.js · construction.js · styles.css    Casa Patio
    ├── walk-navigation.js · movement.js · scene-materials.js Módulos compartidos
    ├── favicon.svg · .nojekyll
    ├── noveno/                  Noveno: units.js, model.js, city.js, app.js
    ├── visita-real/             Visita real: data.js, photos.js, app.js, photos/
    └── vendor/                  Three.js, OrbitControls, RoundedBoxGeometry, RoomEnvironment, DM Sans y licencias
```

## Cómo se conectan los módulos

```mermaid
flowchart LR
    subgraph CP[Casa Patio]
        A[app.js] --> C[construction.js]
    end
    subgraph NV[Noveno]
        N[noveno/app.js] --> U[units.js]
        N --> M[model.js]
        N --> Y[city.js]
        M --> U
        Y --> M
    end
    subgraph VR[Visita real]
        V[visita-real/app.js] --> D[data.js] --> P[photos.js]
    end
    subgraph SH[Compartidos]
        W[walk-navigation.js] --> MV[movement.js]
        S[scene-materials.js]
    end
    A --> W
    A --> S
    C --> S
    N --> W
    M --> S
    A & N --> T[vendor: Three.js]
```

- Casa Patio y Noveno resuelven `import 'three'` con un *import map* declarado en su `index.html`, que apunta a `vendor/three.module.js`.
- `walk-navigation.js` y `movement.js` son el recorrido a pie y las colisiones de **ambas** demos 3D: un cambio ahí afecta a las dos.
- Visita real no usa Three.js ni los módulos compartidos.
- Las tres páginas se enlazan entre sí desde el encabezado o el aviso de novedades.

## Enlaces públicos

| Demo | Parámetros | Ejemplo |
| --- | --- | --- |
| Casa Patio | Ninguno | `/` |
| Noveno | `unidad` (`9a`, `9b`, `9c`) · `vista` (`edificio`, `piso`, `unidad`, `recorrido`) | `/noveno/?unidad=9c&vista=recorrido` |
| Visita real | `ambiente` · `foto` · `vista=plano` | `/visita-real/?ambiente=bano&foto=bano-ducha` |

Los valores desconocidos o mal formados caen en un valor por defecto seguro y nunca se insertan en la página; las pruebas lo cubren. El detalle está en las fichas de [Noveno](../demos/noveno.md#enlaces-para-compartir) y [Visita real](../demos/visita-real.md#enlaces-para-compartir).

## Desarrollo local

```sh
npm start
# equivale a: python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Abrir http://127.0.0.1:4173. En Mac también se puede hacer doble clic en `scripts/ABRIR_PROTOTIPO.command`, que levanta el mismo servidor y abre el navegador.

Hace falta servir por HTTP: los navegadores no cargan módulos JavaScript abiertos directamente como archivo (`file://`).

## Pruebas

```sh
npm test
```

Usa el ejecutor de pruebas integrado en Node.js (versión 20 o posterior), sin instalar nada. Hay **17 pruebas**:

| Archivo | Pruebas | Qué cubre |
| --- | --- | --- |
| [tests/movement.test.mjs](../../tests/movement.test.mjs) | 7 | Colisiones: paso por puertas, paredes en movimientos largos, deslizamiento, distancia a los marcos, muebles, límites y regreso |
| [tests/noveno.test.mjs](../../tests/noveno.test.mjs) | 6 | Enlaces y valores inválidos, puntos de entrada libres, puertas conectadas, salida al balcón, unidades sin superposición |
| [tests/visita-real.test.mjs](../../tests/visita-real.test.mjs) | 4 | Fotos locales válidas con fuente y licencia, recorrido completo y puntos de enlace, enlaces compartidos seguros, límites del zoom |

Las pruebas cubren la lógica sin navegador. El renderizado y la interacción de Casa Patio y Noveno se verificaron con Chrome y Playwright al cerrar sus versiones; esas verificaciones están registradas en el [CHANGELOG](../../CHANGELOG.md) y no se ejecutan en GitHub Actions.

## Publicación

El workflow [pages.yml](../../.github/workflows/pages.yml) publica en https://geroo03.github.io/inmobiliaria-c-rdoba-3D/.

1. **Cuándo corre:** al subir a `main` cambios en `dist/`, `tests/`, `package.json` o el propio workflow, o a mano desde **Actions → Publicar en GitHub Pages → Run workflow**. Los cambios solo de documentación no vuelven a publicar el sitio.
2. **Qué comprueba:** que existan los archivos clave de las tres demos, que cada módulo JavaScript tenga sintaxis válida (`node --check`) y que pasen las pruebas.
3. **Qué publica:** únicamente `dist/`. El archivo `.nojekyll` evita que GitHub Pages procese el sitio con Jekyll.

Requisito único en GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**. Cada publicación queda registrada en la [pestaña Actions](https://github.com/geroo03/inmobiliaria-c-rdoba-3D/actions).

## Agregar una demo o propiedad nueva

1. Crear `dist/<nombre>/` con su `index.html`, estilos y módulos. Para una propiedad con fotos, partir de una copia de `visita-real/` ([guía de adaptación](../demos/visita-real.md#cómo-adaptarla-a-una-propiedad-propia)).
2. Enlazarla desde el encabezado de las otras páginas.
3. Agregar `tests/<nombre>.test.mjs` para sus datos y enlaces.
4. En `pages.yml`, sumar su `index.html` a las comprobaciones y su carpeta al bucle de `node --check` (hoy recorre `dist/*.js`, `dist/noveno/*.js` y `dist/visita-real/*.js`).
5. Sumarla a la tabla de demos del [README](../../README.md), crear su ficha en `docs/demos/` y registrar el cambio en el [CHANGELOG](../../CHANGELOG.md).
6. Si incluye material de terceros, registrar autor, fuente y licencia en [créditos y licencias](../creditos-y-licencias.md).

## Estado de calidad

**Verificado:** pruebas automáticas en cada publicación; comprobaciones funcionales con Chrome y Playwright en escritorio y en celular emulado al cerrar las versiones de Casa Patio y Noveno (detalle en el [CHANGELOG](../../CHANGELOG.md)).

**Pendiente:**

- Probar en teléfonos físicos, sobre todo Safari de iPhone y un Android de gama media.
- Medir la carga con conexiones móviles lentas.
- Hacer una auditoría completa de accesibilidad.
- Medir el rendimiento con material real (panoramas o modelos capturados): las demos actuales no permiten estimarlo.
- Definir una licencia para el código propio del repositorio (ver [créditos y licencias](../creditos-y-licencias.md#código-propio)).
