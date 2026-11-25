# Avance de F-06 · Match y solicitud de adopción

Nota para retomar el trabajo si se corta la sesión. Se actualiza en cada commit.

- **Spec:** `specs/features/F-06-match-solicitud.md` v1.0 (Aprobada) · `02-navegacion` v1.3 · `03-modelo-datos` v1.7 · `F-05` · `F-03` v1.2 · `F-08`
- **RF:** RF-20, RF-11, RF-17 (no válido), RF-27, RF-18 · RNF-01 · RNF-02
- **Rama:** `feature/F-06-match-solicitud` (desde `main` en `da09cc3`)
- **Último commit:** T-2 (el anterior es `841ac12`)
- **PR:** "feat(solicitud): match explicado, enviar solicitud y mis solicitudes (F-06, RF-20, RF-11, RF-17, RF-27)". No se fusiona. Enlace: https://github.com/pelusitas-corp/garritas/pull/new/feature/F-06-match-solicitud

## Tareas (§10)
| # | Tarea | Estado |
|---|---|---|
| T-1 | Mensaje `SOLICITUD_YA_ENVIADA` y textos (`match/textos.ts`, `solicitudes/textos.ts`) | ✅ Hecha (`841ac12`; 3 pruebas en `tests/adoptante/textosMatch.test.ts`) |
| T-2 | `decidirMatch`, `decidirEnvio`, `armarSolicitud` y sus pruebas | ✅ Hecha (24 pruebas en `tests/adoptante/match.test.ts`; las dimensiones de Ana y Wini salen del motor real y coinciden con F-05 CA-09) |
| T-3 | `ordenarMisSolicitudes`, estado de la pantalla y sus pruebas | Pendiente |
| T-4 | `src/firebase/solicitudes.ts` (`leerCuentaAdoptante`, `leerMisSolicitudes`, `enviarSolicitud`) y sus pruebas | Pendiente |
| T-5 | Reglas de `create` (§9) y casos de CA-10 | Pendiente |
| T-6 | `useMatch` y `useMisSolicitudes` | Pendiente |
| T-7 | Pantalla Match | Pendiente |
| T-8 | Pantalla "¡Solicitud enviada!" (`useSolicitudEnviada`) | Pendiente |
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
- **T-2:** `decidirMatch` revisa: lecturas fallidas → A1 → cuestionario completo (G-5) → perfil completo (decisión 1) → filtro (A2) → motor. Para probar 29 % y 30 % se envuelve `evaluarAnimales` con `jest.mock` y la explicación se arma con el `explicarMatch` real de F-05. `armarSolicitud` devuelve `null` si falta p2, p12 o p19.
- **T-1:** `solicitudes/textos.ts` usa `export default` (regla `prefer-default-export` de Airbnb con una sola exportación). "Garritas", "Mi perfil" y "Reintentar" se reutilizan de `src/adoptante/descubrir/textos.ts` (mismo lado, adoptante). El porcentaje de Match se escribe "90%" (sin espacio, Figma); en Descubrir es "90 % compatible" (F-03).

## Verificación
| Tarea | typecheck | lint | test |
|---|---|---|---|
| T-1 | ✅ sin errores | ✅ sin errores (Prettier OK) | ✅ 30 suites, 297 pruebas |
| T-2 | ✅ sin errores | ✅ sin errores (Prettier OK) | ✅ 31 suites, 321 pruebas |

## Pendientes
- CA-10 con el emulador el viernes 27 (PO-31). `npm run test:rules` no existe todavía.
- Prueba en el celular (T-10) y publicar `firestore.rules` completo de `main` después de fusionar.
