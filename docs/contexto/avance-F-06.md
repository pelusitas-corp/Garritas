# Avance de F-06 · Match y solicitud de adopción

Nota para retomar el trabajo si se corta la sesión. Se actualiza en cada commit.

- **Spec:** `specs/features/F-06-match-solicitud.md` v1.0 (Aprobada) · `02-navegacion` v1.3 · `03-modelo-datos` v1.7 · `F-05` · `F-03` v1.2 · `F-08`
- **RF:** RF-20, RF-11, RF-17 (no válido), RF-27, RF-18 · RNF-01 · RNF-02
- **Rama:** `feature/F-06-match-solicitud` (desde `main` en `da09cc3`)
- **Último commit:** T-8 (el anterior es `a9086bd`)
- **PR:** "feat(solicitud): match explicado, enviar solicitud y mis solicitudes (F-06, RF-20, RF-11, RF-17, RF-27)". No se fusiona. Enlace: https://github.com/pelusitas-corp/garritas/pull/new/feature/F-06-match-solicitud

## Tareas (§10)
| # | Tarea | Estado |
|---|---|---|
| T-1 | Mensaje `SOLICITUD_YA_ENVIADA` y textos (`match/textos.ts`, `solicitudes/textos.ts`) | ✅ Hecha (`841ac12`; 3 pruebas en `tests/adoptante/textosMatch.test.ts`) |
| T-2 | `decidirMatch`, `decidirEnvio`, `armarSolicitud` y sus pruebas | ✅ Hecha (`ccf9bfc`; 24 pruebas en `tests/adoptante/match.test.ts`; las dimensiones de Ana y Wini salen del motor real y coinciden con F-05 CA-09) |
| T-3 | `ordenarMisSolicitudes`, estado de la pantalla y sus pruebas | ✅ Hecha (`f249c35`; 10 pruebas en `tests/adoptante/misSolicitudes.test.ts`; `MiSolicitud`, `ordenarMisSolicitudes`, `pantallaMisSolicitudes` y `apoyoDelEstado`) |
| T-4 | `src/firebase/solicitudes.ts` (`leerCuentaAdoptante`, `leerMisSolicitudes`, `enviarSolicitud`) y sus pruebas | ✅ Hecha (`204bada`; 12 pruebas en `tests/firebase/solicitudes.test.ts` con un `writeBatch` de mentira) |
| T-5 | Reglas de `create` (§9) y casos de CA-10 | ✅ Hecha (`d5a4271`; reglas de §9 sin publicar; 19 casos de CA-10 abajo) |
| T-6 | `useMatch` y `useMisSolicitudes` | ✅ Hecha (`78f048d`; `useMatch` y `useMisSolicitudes`; se exporta `regresarSinDisponible` del Detalle (decisión 5)) |
| T-7 | Pantalla Match | ✅ Hecha (`a9086bd`; pantalla con `EncabezadoGarritas`, `HuellaMatch`, `TarjetaPorcentaje`, `TarjetaDimensiones` e `iconosMatch`; `pantallaMatch` con 5 pruebas; ícono opcional en `BotonPildora` (decisión 3)) |
| T-8 | Pantalla "¡Solicitud enviada!" (`useSolicitudEnviada`) | ✅ Hecha (pantalla y `useSolicitudEnviada`; `decidirSolicitudEnviada` y `pantallaSolicitudEnviada` con 3 pruebas) |
| T-9 | Pantalla Mis solicitudes (`TarjetaMiSolicitud`, `PildoraEstado`) | Pendiente |
| T-10 | Prueba en el celular, publicar reglas y reiniciar datos (Paulina) | Pendiente (lo hace la autora) |

## Decisiones aceptadas en el plan (Paulina, 25/11/2026; decisión del equipo, no están en el SRS)
1. **Animal con perfil incompleto en Match** (solo por enlace directo; F-02 siempre lo guarda completo): se trata como A1, con "Esta mascota ya no está disponible para adopción" y regreso a Descubrir con el aviso (DE-4).
2. **Cuestionario en Match:** se reutiliza `leerCuestionario` (F-04) sin cambios, con los 10 s de `conTiempoLimite`, igual que Descubrir. Con `completo: true` las respuestas no cambian (F-04 RN-06), y el animal sí se lee del servidor, así que sin conexión sale el error igual. No se toca F-04.
3. **Ícono opcional en `BotonPildora`** (`icono`, a la izquierda del texto y del color del texto) para el corazón de "Enviar solicitud" y "Ver mis solicitudes". Los botones que ya existen no cambian.
4. **Mis solicitudes al volver a enfocar la pestaña:** el indicador de pantalla completa solo sale en la primera lectura. Después la lista se queda visible hasta que llegan los datos nuevos (igual que la decisión 5 de F-08).
5. **Regreso de A1:** se exporta `regresarSinDisponible` de `useDetalleAnimal.ts` (F-03) y Match la reutiliza. "Atrás" desde "¡Solicitud enviada!" regresa al Detalle, porque `replace` solo quita Match (CA-03: no regresa a Match).

### Medidas aceptadas (solo colores de `tema.ts`)
- Mensaje encima del botón de Match: negrita 13, café, centrado. "Ir a Descubrir": botón principal.
- "¡Solicitud enviada!": la misma huella y tarjeta menta que Match (radio 32, miniatura circular de 76), nombre del animal en negrita 28 y, debajo, **"Pendiente" como texto negrita 14 café** dentro de la tarjeta (ajuste de Paulina; no es píldora).
- `PildoraEstado` se usa **solo** en Mis solicitudes: alto 36, negrita 14 (Pendiente: borde café sin relleno; Pre-aprobada: menta; Rechazada: crema con borde café).
- Mis solicitudes: encabezado "Mis solicitudes" con la huella y, debajo de la lista, "Cada paso te acerca a su hogar." (ajuste de Paulina; ambos en `solicitudes/textos.ts`).
- Separaciones: 16 entre bloques y 12 entre tarjetas.

### Ajuste de pruebas (Paulina)
- La prueba de RF-20 válido con Ana y Wini **no fija de antemano** las 3 dimensiones: usa las que devuelve el motor real con `tests/matchmaking/datos.ts` y las pone en el nombre solo si coinciden.

## Notas técnicas
- **T-8:** "Pendiente" va como texto negrita 14 café debajo del nombre, dentro de la tarjeta menta (ajuste de Paulina). "Ver mis solicitudes" se dibuja siempre, también con el indicador o el error (§6). `LecturaSolicitudEnviada` copia solo la forma de lo que devuelve `leerSolicitud` (F-08): el adoptante no importa tipos de `src/albergue/` (RN-04). `leerSolicitud` sí vive en `src/firebase/decisionSolicitud.ts`, que por dentro usa tipos de `src/albergue/`; eso está permitido (el plan reutiliza `leerSolicitud`).
- **T-7:** `EstadoMatch` pasó de `useMatch.ts` a `match.ts` para probar `pantallaMatch` sin el hook. Medidas: huella 72 en círculo de 110 con corazón crema de 20; tarjeta del % con relleno 16 y separación 16; variante < 30 % con el crema del fondo (sin color nuevo) y borde azul grisáceo de 2; dimensiones con círculo de 28 e ícono de 18, nombre regular 16; ícono del botón de 22. El encabezado reutiliza `BotonCircular`, "Garritas" y "Mi perfil" de F-03. `BotonPildora` envuelve el texto en una fila para poner el ícono; sin `icono` se ve igual que antes.
- **T-6:** `useMatch` lee cuestionario y animal en paralelo (`Promise.all`); A1 → `regresarSinDisponible`, G-5 → cuestionario. Al enviar lee animal, solicitudes y cuenta en paralelo (no cambia ningún resultado, solo ahorra tiempo); sin permiso o sin conexión deja el botón activo, A3 y A4 lo desactivan. Sin sesión, el estado inicial es "sin permiso" (regla `react-hooks/set-state-in-effect`: el estado solo cambia cuando llega la respuesta, como en el Detalle). `useMisSolicitudes` lee con `useFocusEffect`; el indicador solo en la primera lectura (decisión 4) y, si falla al volver, error con "Reintentar" (MS-6).
- **T-5:** las 4 funciones de ayuda (`camposSolicitud`, `animalDeLaSolicitud`, `respuestasDelUsuario`, `telefonoDelUsuario`) viven dentro de `match /solicitudes/{solicitudId}`; `privado` las ve porque está anidado. El lote lee 6 documentos distintos (límite: 20). No hay emulador ni `firebase-tools` en el repo: la sintaxis se revisa el viernes.
- **T-4:** `enviarSolicitud` genera el ID con `doc(collection(...))` antes del lote y espera el `commit` 10 s (`ESPERA_ESCRITURA_MS`). Las lecturas usan `getDocFromServer` y `getDocsFromServer` con 10 s (`ESPERA_GUARDAR_MS`). `permission-denied` → `sin-permiso`; cualquier otro error o el tiempo agotado → `sin-conexion`. Los tipos `MiSolicitud`, `CuentaAdoptante` y `SolicitudNueva` viven en `src/adoptante/` (como F-07 con `SolicitudConId`), así el adoptante nunca importa de `src/albergue/`.
- **T-2:** `decidirMatch` revisa: lecturas fallidas → A1 → cuestionario completo (G-5) → perfil completo (decisión 1) → filtro (A2) → motor. Para probar 29 % y 30 % se envuelve `evaluarAnimales` con `jest.mock` y la explicación se arma con el `explicarMatch` real de F-05. `armarSolicitud` devuelve `null` si falta p2, p12 o p19.
- **T-1:** `solicitudes/textos.ts` usa `export default` (regla `prefer-default-export` de Airbnb con una sola exportación). "Garritas", "Mi perfil" y "Reintentar" se reutilizan de `src/adoptante/descubrir/textos.ts` (mismo lado, adoptante). El porcentaje de Match se escribe "90%" (sin espacio, Figma); en Descubrir es "90 % compatible" (F-03).

## Casos de CA-10 para el emulador (viernes 27, PO-31)
Con los datos de 03 §8. "Lote" = `writeBatch` con `solicitudes/{id}` y `solicitudes/{id}/privado/contacto`. Una cuenta nueva "Nueva" (adoptante, cuestionario completo, sin solicitudes).

| # | Caso | Esperado |
|---|---|---|
| 1 | Nueva crea, en un lote, su solicitud "Pendiente" a Wini ("Disponible") con copias correctas, `noApto` coherente, `resumenHogar` de su cuestionario y su contacto | Permitido |
| 2 | Igual que 1, con `adoptanteId` de Ana | Negado |
| 3 | Igual que 1, con `estado: "Pre-aprobada"` | Negado |
| 4 | Igual que 1, para Rocky ("En pre-adopción") | Negado |
| 5 | Igual que 1, con `nombreAnimal`, `nombreAlbergue`, `miniaturaAnimal` o `albergueId` distintos al animal (un caso por campo) | Negado |
| 6 | Igual que 1, con `nombreAdoptante` distinto al de `usuarios` | Negado |
| 7 | Igual que 1, con `porcentaje: 24` y `noApto: false`, o `porcentaje: 30` y `noApto: true` | Negado |
| 8 | Igual que 1, con `porcentaje` 101, -1 o 90.5 | Negado |
| 9 | Igual que 1, con `resumenHogar.p2` distinto al cuestionario, o con una clave de más (`p3`) | Negado |
| 10 | Igual que 1, con un campo de más o uno de menos | Negado |
| 11 | Igual que 1, con `creadaEn` o `actualizadaEn` escrito desde el teléfono (no `serverTimestamp`) | Negado |
| 12 | Solo la solicitud, sin `privado/contacto` en el mismo lote | Negado |
| 13 | Refugio Patitas (albergue) crea una solicitud | Negado |
| 14 | Crear `privado/contacto` después, en otra operación, de una solicitud que ya existe | Negado |
| 15 | Igual que 1, con otro teléfono o con otro correo en el contacto, o con un campo de más | Negado |
| 16 | Ana consulta `solicitudes` donde `adoptanteId == adoptante-a` | Permitido |
| 17 | Ana consulta `solicitudes` sin filtro | Negado (ya lo cubre F-07 CA-11) |
| 18 | Ana lee `solicitudes/s4` y `solicitudes/s2` (de Luis) | s4 permitido; s2 negado |
| 19 | Borrar una solicitud o su contacto | Negado |

## Verificación
| Tarea | typecheck | lint | test |
|---|---|---|---|
| T-1 | ✅ sin errores | ✅ sin errores (Prettier OK) | ✅ 30 suites, 297 pruebas |
| T-2 | ✅ sin errores | ✅ sin errores (Prettier OK) | ✅ 31 suites, 321 pruebas |
| T-3 | ✅ sin errores | ✅ sin errores (Prettier OK) | ✅ 32 suites, 331 pruebas |
| T-4 | ✅ sin errores | ✅ sin errores (Prettier OK) | ✅ 33 suites, 343 pruebas |
| T-5 | ✅ sin errores | ✅ sin errores (Prettier OK) | ✅ 33 suites, 343 pruebas (las reglas se prueban con el emulador) |
| T-6 | ✅ sin errores | ✅ sin errores (Prettier OK) | ✅ 33 suites, 343 pruebas (los hooks se prueban con sus funciones puras y en el celular) |
| T-7 | ✅ sin errores | ✅ sin errores (Prettier OK) | ✅ 33 suites, 348 pruebas |
| T-8 | ✅ sin errores | ✅ sin errores (Prettier OK) | ✅ 33 suites, 351 pruebas |

## Pendientes
- CA-10 con el emulador el viernes 27 (PO-31). `npm run test:rules` no existe todavía.
- Prueba en el celular (T-10) y publicar `firestore.rules` completo de `main` después de fusionar.
