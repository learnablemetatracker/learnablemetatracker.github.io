# LearnableMetaTracker

La web guarda el progreso de los metas en el navegador de cada visitante. Cada persona vincula su propio mapa personal de LearnableMeta para retirar de él los metas marcados como «Dominado». No hay un mapa personal compartido ni un identificador preconfigurado.

## Preparar la sincronización

1. Crea un [mapa personal en LearnableMeta](https://learnablemeta.com/docs/getting-started/personal-maps) y vincúlalo a un mapa de GeoGuessr dedicado a practicar. LearnableMeta solo permite seleccionar metas de mapas que tengan activado el uso compartido.
2. Instala un gestor de userscripts, como el que ya usas para LearnableMeta, y añade el [puente público de sincronización](https://learnablemetatracker.github.io/learnablemeta-sync.user.js). Si ya tenías el puente público, actualízalo a la versión 0.6.0. Si conservas un puente de pruebas anterior, desactívalo en el gestor de userscripts. El puente público funciona en `learnablemetatracker.github.io` y en las páginas de mapas y mapas personales de `learnablemeta.com`.
3. En el tracker, pega la URL de tu mapa personal. Los metas que ya tenías dominados aparecerán pendientes.
4. Pulsa «Quitar metas dominados». Se abrirá tu mapa personal; mantén iniciada la sesión de LearnableMeta. Cuando la operación termine, el tracker indicará que debes volver a subir el mapa a GeoGuessr desde LearnableMeta.

Opcionalmente, activa «Sincronizar al entrar o salir de Dominado». Desde entonces, el puente abre una pestaña en segundo plano para retirar los metas que marques Dominado o volver a añadir los metas que el tracker había retirado cuando los cambies a Repasando, Aprendiendo o Nuevo. También abre la pestaña al pulsar los botones de sincronización manual. El puente la cierra al recibir confirmación. Si debes iniciar sesión o la operación falla, la pestaña queda abierta, el cambio sigue pendiente y puedes reintentar desde el panel. Cada visitante decide si activa esta opción en su propio navegador.

El puente envía a LearnableMeta el identificador del mapa personal y los identificadores de los metas que retira o repone. Para reponer un meta usa un mapa de origen del catálogo; si este ya no aparece en el catálogo, habrá que añadirlo manualmente desde LearnableMeta. La sesión permanece en el navegador; el tracker no almacena contraseñas ni tokens de LearnableMeta.

Si la conexión falla o el puente no puede comprobar la selección, los metas siguen pendientes y puedes reintentar. Si un meta no estaba en el mapa personal, se descarta la retirada pendiente y no se añade al cambiar su estado. Solo se pueden reponer automáticamente los metas cuya retirada del mapa personal haya confirmado el puente. Si un navegador conserva historial antiguo de retiradas sin verificar, el tracker lo borra una vez para evitar reposiciones erróneas; se conservan los mapas, estados de aprendizaje y retiradas pendientes. Si falta un meta retirado con la versión antigua, añádelo manualmente en LearnableMeta. Después de cada retirada o reposición real hay que volver a subir el mapa a GeoGuessr desde LearnableMeta. El archivo de map-making.app no se modifica.

Si ya has vuelto a añadir manualmente los metas pendientes de reposición en LearnableMeta, pulsa «Ya los añadí en LearnableMeta» en el panel del mapa de práctica. Así se limpian solo esas reposiciones y se conserva el historial de los demás metas retirados, sin cambiar los estados de aprendizaje. Después, vuelve a subir el mapa a GeoGuessr para jugar con la selección actualizada.

«Desvincular y borrar enlace» elimina de este navegador el identificador del mapa y su historial de sincronización, sin borrar los estados de aprendizaje. También limpia las solicitudes y respuestas del puente del navegador.

## Publicación

Publica `index.html`, `styles.css`, `favicon.svg`, `learnablemeta-sync.user.js` y las carpetas `src/` y `data/` en la raíz de `learnablemetatracker.github.io`. La web no necesita servidor propio ni credenciales. El script tiene la URL pública de actualización y el enlace «Ayuda» de la web instala ese mismo archivo. Cada visitante introduce su propio mapa personal y conserva su progreso en el almacenamiento de su navegador; el repositorio no incluye ningún mapa personal preconfigurado.

Comprueba después de subir los archivos que la portada, la ayuda, un mapa del catálogo y el enlace de instalación del puente cargan en la URL pública. Si publicas con otro dominio, ajusta `@match`, `@updateURL` y `@downloadURL` del script.

## Desarrollo

La web es estática. Para ejecutar las pruebas locales:

```sh
node --test src/*.test.mjs
```

