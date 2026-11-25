# Avance de F-03 · Descubrir y detalle del animal

Nota para retomar el trabajo si se corta la sesión. Última actualización:
25/11/2026.

## Estado
| Dato | Valor |
|---|---|
| Spec | `specs/features/F-03-descubrir-detalle.md` v1.0, Aprobada |
| RF | RF-10, RF-26, RF-28 · RNF-01 (usa RF-17, RF-03 y RF-18 del motor F-05) |
| Rama | `feature/F-03-descubrir-detalle` |
| Base | Salió de `feature/F-04-cuestionario` (`a2d1cdd`). Después se integró `origin/main` hasta `9b54218` (PR #19 F-04 y PR #29 F-02), por fast-forward y sin conflictos. Ya no depende de ningún PR abierto |
| Último commit de código | `cc53e4c` feat(detalle): pantalla del Detalle con carrusel de fotos y G-8 |
| Revisión automática en local | `typecheck`, `lint` y `test` (23 suites, 209 pruebas) en verde |
| PR | Push hecho. PR hacia `main` pendiente de abrir con el título "feat(descubrir): Descubrir ordenado por % y detalle del animal (F-03, RF-10, RF-26, RF-28)" (no hay `gh` en esta computadora: se abre desde GitHub o desde la app) |
| Falta | T-10: prueba en el celular con Expo Go (la hace la autora) |

## Tareas (spec §9)
| Tarea | Commit |
|---|---|
| T-1 `MAZO_TERMINADO` | `90ea431` |
| T-2 `src/firebase/animales.ts` (solo lectura) | `6b4a17b` |
| T-3 y T-4 `mazo.ts` (en un solo commit: mismo archivo) | `451b91f` |
| T-5 `detalle.ts` | `42e7504` |
| T-6 Textos, íconos y `estados.ts` | `17f7034` |
| T-9 `rutaDescubrirConAviso()` | `939d5d7` |
| T-7 Pantalla Descubrir | `ce65168` |
| T-8 Pantalla Detalle | `cc53e4c` |
| T-10 Nota y prueba en el celular | Nota: este commit. Celular: pendiente |

## Decisiones aceptadas en el plan (25/11/2026)
1. **Tiempo límite (RN-08):** se reutiliza `conTiempoLimite` de
   `src/firebase/acceso.ts` (F-01), igual que `altaAnimal.ts` (F-02), con
   `ESPERA_GUARDAR_MS` (10 s) de F-04. Se usa en `animales.ts` y en
   `useDescubrir` para envolver `leerCuestionario`, que no tiene límite.
2. **Cuestionario incompleto o inexistente en Descubrir:** redirige con
   `rutaCuestionarioConAviso()`, igual que G-5.
3. **`src/adoptante/descubrir/estados.ts`** (no está en §9): traduce el
   estado de Descubrir y del Detalle a lo que muestra `EstadoPantalla`, para
   probar RNF-01 y los mensajes con Jest sin dependencias nuevas.
4. **Fallan las fotos del Detalle:** error de conexión con "Reintentar" (A5).
5. **Íconos** (`iconosDescubrir.ts`, sin importar el componente en Jest):
   `account-circle-outline` (Mi perfil), `information-outline` (ⓘ),
   `check-circle` / `close-circle` (cuidados de salud).

## Decisiones de implementación (para explicar en clase)
- **RN-03 / DE-5 (`useDescubrir`):** `useFocusEffect` recalcula cada vez que
  Descubrir recibe el foco. Antes de abrir el Detalle se prende la marca
  `fuiAlDetalle`; al volver, se apaga y no se recalcula.
- **G-8 (`useDetalleAnimal`):** si el Detalle se abrió desde Descubrir,
  `router.dismissTo(rutaDescubrirConAviso())` regresa a ese mismo Descubrir y
  saca el Detalle de la pila; con un enlace directo usa `router.replace`.
  Descubrir ve `?aviso=no-disponible`, muestra el aviso, recalcula (el mazo
  empieza de nuevo) y borra el parámetro con `router.setParams`.
- **"←" y "✕"** se dibujan con esos mismos caracteres de la spec (no hay
  ícono aprobado para ellos). Regresan con `router.back()`.
- **Los nombres de las pruebas** son los criterios (CA-01 a CA-07, RNF-01,
  RNF-02, A5).

## Pendientes para verificar en el celular
- Que G-8 regrese al mismo Descubrir con el aviso (no a uno repetido).
- Que al volver del Detalle el mazo siga en la misma tarjeta (DE-5).
- RNF-01 y CA-02 con modo avión.
- Los datos de prueba de Firebase deben estar cargados con la v1.4 de
  03-modelo-datos (Wini "1 a 3 años · Pequeño"). No se corrió
  `npm run datos:prueba` desde esta sesión.
