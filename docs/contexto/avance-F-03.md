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
| Último commit | (se actualiza en cada tarea) |
| PR | Sin abrir |

## Tareas (spec §9)
| Tarea | Estado | Commit |
|---|---|---|
| T-1 `MAZO_TERMINADO` | Pendiente | |
| T-2 `src/firebase/animales.ts` (solo lectura) | Pendiente | |
| T-3 y T-4 `mazo.ts` | Pendiente | |
| T-5 `detalle.ts` | Pendiente | |
| T-6 Textos (más íconos y `estados.ts`) | Pendiente | |
| T-9 `rutaDescubrirConAviso()` | Pendiente | |
| T-7 Pantalla Descubrir | Pendiente | |
| T-8 Pantalla Detalle | Pendiente | |
| T-10 Nota y prueba en el celular (la hace la autora) | Pendiente | |

## Decisiones aceptadas en el plan (25/11/2026)
1. **Tiempo límite (RN-08):** se reutiliza `conTiempoLimite` de
   `src/firebase/acceso.ts` (F-01), igual que `altaAnimal.ts` (F-02), con
   `ESPERA_GUARDAR_MS` (10 s) de F-04. Se usa en `animales.ts` y en
   `useDescubrir` para envolver `leerCuestionario`, que no tiene límite.
2. **Cuestionario incompleto o inexistente en Descubrir:** redirige con
   `rutaCuestionarioConAviso()`, igual que G-5.
3. **`src/adoptante/descubrir/estados.ts`** (no está en §9): traduce el
   estado de Descubrir a lo que muestra `EstadoPantalla`, para probar RNF-01 y
   los mensajes con Jest sin dependencias nuevas.
4. **Fallan las fotos del Detalle:** error de conexión con "Reintentar" (A5).
5. **Íconos** (archivo aparte, sin importar el componente en Jest):
   `account-circle-outline` (Mi perfil), `information-outline` (ⓘ),
   `check-circle` / `close-circle` (cuidados de salud).
6. **RN-03 / DE-5:** Descubrir recalcula al recibir el foco, salvo cuando
   vuelve del Detalle (marca que se prende antes de abrirlo). Con
   `?aviso=no-disponible` (G-8) siempre recalcula y el mazo empieza de nuevo.

## Notas
- Los datos de prueba de Firebase deben estar cargados con la v1.4 de
  03-modelo-datos (Wini "1 a 3 años · Pequeño"). No se corre
  `npm run datos:prueba` desde esta sesión.
