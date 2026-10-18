# Por dónde empezar: primera propiedad real

El primer paso es **elegir una propiedad y reunir su plano y material visual**. Con eso podemos decidir el tipo de captura y construir una visita que los clientes puedan evaluar.

Este documento organiza el trabajo futuro. Los casilleros representan tareas pendientes; el prototipo ficticio ya está documentado en [INFORME_DEL_PROTOTIPO.md](INFORME_DEL_PROTOTIPO.md).

## 1. Elegí la propiedad piloto

Conviene una vivienda a la que se pueda volver para completar capturas y donde sea posible verificar la distribución.

- [ ] Elegir una casa o departamento real.
- [ ] Confirmar acceso para tomar imágenes y revisar el material que se podrá publicar.
- [ ] Conseguir el plano actual o acordar cómo relevarlo.
- [ ] Identificar todos los ambientes y niveles que verá el cliente.
- [ ] Nombrar a la persona que validará que el recorrido corresponde a la propiedad.

**Resultado de esta etapa:** una propiedad identificada y acceso al material necesario.

## 2. Completá esta ficha

```text
PROPIEDAD PILOTO

Nombre o código interno:
Casa / departamento:
Localidad y zona:
Superficie según documentación disponible:
Cantidad de plantas:
Ambientes que se mostrarán:

MATERIAL DISPONIBLE

Plano actual: sí / no / a verificar
Fotos comunes: sí / no
Panoramas 360° completos: sí / no
Modelo arquitectónico o captura espacial: sí / no
Persona disponible para tomar o contratar las capturas:

ALCANCE

Vista desde arriba: plano 2D / maqueta 3D giratoria / ambas
¿La maqueta 3D es indispensable en la primera entrega?:
Interior: fotos / panoramas 360° / captura espacial
Acceso de clientes: público / por invitación / a definir
Marca y datos de contacto que deben aparecer:

OPERACIÓN

Responsable de revisar el contenido:
Responsable de pagar y mantener el alojamiento:
Cantidad de propiedades que se espera incorporar después:
Presupuesto a consultar o límite disponible:
```

No hace falta publicar la dirección exacta para preparar esta ficha o probar el recorrido.

## 3. Elegí la siguiente acción según lo que tengas

| Situación actual | Próxima acción | Qué podremos mostrar |
| --- | --- | --- |
| Solo fotos comunes | Ordenarlas por ambiente y conseguir el plano | Un plano que abre galerías reales |
| Plano y fotos comunes | Organizar una sesión de captura 360° | Luego, una visita que permita mirar alrededor |
| Plano y panoramas completos | Revisar calidad, ubicar escenas y conectar ambientes | Un primer tour real con plano seleccionable |
| Necesitás maqueta 3D desde el inicio | Cotizar captura espacial o modelado fiel, además del contenido interior | Vista de conjunto 3D y acceso a ambientes |
| La propiedad está en proyecto | Conseguir el modelo arquitectónico y referencias de diseño | Una visualización identificada como proyecto |

Para elegir entre proveedor, editor de tours y desarrollo propio, consultá las [alternativas de producción](GUIA_PRODUCCION_REAL.md#4-tres-caminos-de-implementación).

## 4. Probá primero dos ambientes conectados

Antes de capturar toda la vivienda, conviene hacer una muestra pequeña, por ejemplo living y cocina. Esto valida el tipo de imagen, la calidad y la forma de navegar.

- [ ] Conseguir el plano de esos ambientes.
- [ ] Capturar panoramas completos desde los puntos acordados.
- [ ] Guardar los archivos originales.
- [ ] Dibujar las zonas seleccionables sobre el plano.
- [ ] Hacer que cada zona abra la escena correcta.
- [ ] Añadir conexión de ida y vuelta entre las escenas.
- [ ] Revisar que se pueda mirar alrededor sin zonas faltantes.
- [ ] Probar el enlace en una PC y en un celular físico.
- [ ] Pedir a alguien ajeno al desarrollo que encuentre la cocina y vuelva al plano.

Si se contrató una captura espacial, pedir la muestra equivalente al proveedor y validar el acceso de visitantes. La prueba de dos ambientes valida el método; el piloto completo debe cubrir luego todos los ambientes acordados.

## 5. Completá la captura de la vivienda

- [ ] Preparar una lista de escenas por ambiente y planta.
- [ ] Marcar la ubicación de cada captura sobre el plano.
- [ ] Agregar puntos en pasillos y zonas que queden ocultas.
- [ ] Revisar exposición, horizonte, uniones y reflejos.
- [ ] Ordenar las escenas con nombres estables, como `living-entrada`.
- [ ] Comprobar que las conexiones del recorrido tengan sentido.
- [ ] Revisar qué detalles privados aparecen en las imágenes.
- [ ] Confirmar con el responsable de la propiedad el material final.

Si habrá una maqueta 3D, revisar también posiciones de paredes, puertas, ventanas y pisos contra el plano y las capturas. El modelo de Casa Patio es solamente una referencia de interacción.

## 6. Desarrollo del primer producto

Orden propuesto para el trabajo técnico:

1. **Separar datos y código.** Sacar la propiedad ficticia fija de la lógica del visor y definir un archivo de datos por propiedad.
2. **Conectar contenido real.** Cargar el plano y las escenas con sus identificadores.
3. **Resolver la navegación.** Selección de ambientes, dirección inicial de mirada, conexiones y regreso al plano.
4. **Incorporar la maqueta si está en el alcance.** Enlazar el modelo real con los mismos ambientes.
5. **Optimizar medios.** Preparar vistas previas y cargar progresivamente el contenido.
6. **Preparar la ficha y el enlace.** Mostrar datos revisados y configurar el acceso para los clientes previstos.
7. **Validar y publicar.** Revisar la versión final y conservar la posibilidad de volver a la anterior.

Para este piloto no hace falta construir primero un panel administrativo completo. Se puede validar una propiedad con datos preparados manualmente y agregar edición cuando se confirme el flujo de trabajo.

## 7. Condiciones para enviar el enlace a clientes

- [ ] El enlace abre con el nivel de acceso acordado, comprobado desde otro dispositivo o sesión.
- [ ] La ficha describe una propiedad real y tiene información revisada.
- [ ] El plano muestra la distribución correcta.
- [ ] Todos los ambientes acordados abren contenido correspondiente.
- [ ] Se puede volver al plano y cambiar de ambiente sin quedar atrapado.
- [ ] El recorrido funciona en una PC, un Android y un iPhone físicos.
- [ ] Se puede usar con una conexión móvil y la carga no bloquea toda la página.
- [ ] Si una escena falla, hay una salida comprensible o contenido alternativo.
- [ ] El material publicado fue aprobado y se guardó una copia de respaldo.
- [ ] Hay una persona responsable de corregir y retirar la publicación.

## 8. Después de validar el piloto

Observar si los clientes encuentran los ambientes, entienden la distribución y pueden completar la visita. Registrar qué falló y cuánto trabajo llevó preparar la propiedad.

Con esa información, incorporar otras propiedades y decidir si hace falta un panel de carga, un catálogo, métricas más detalladas o integración con las consultas de la inmobiliaria. La animación de construcción puede quedar como un módulo adicional para los proyectos que tengan material adecuado.

**La tarea concreta para empezar hoy:** elegir una vivienda, completar la ficha y conseguir su plano. Si ya tenés fotos, ordenarlas por ambiente; si querés mirar alrededor desde dentro, preparar la captura 360° o consultar un servicio de captura espacial.
