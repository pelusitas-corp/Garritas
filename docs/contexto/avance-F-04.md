# Avance de F-04 · Cuestionario y perfil Garritas

Nota para retomar el trabajo si se corta la sesión. Última actualización:
25/11/2026.

## Estado
| Dato | Valor |
|---|---|
| Spec | `specs/features/F-04-cuestionario.md` v1.0, Aprobada |
| RF | RF-02, RF-15, RF-16, RF-19 · RNF-02, RNF-03 |
| Rama | `feature/F-04-cuestionario` (sale de `main`) |
| PR | #19 "feat(cuestionario): cuestionario y perfil Garritas (F-04, RF-02, RF-15, RF-16, RF-19)", abierto, **sin fusionar** |
| Último commit antes de esta nota | `b2d4af6` chore(cuestionario): integra F-01 en F-04 (merge de `origin/main` en `73d38c9`, PR #25 y #26) |
| Revisión automática | `typecheck`, `lint` y `test` (15 suites, 129 pruebas) en verde en local después de integrar F-01 |

## Hecho (T-1 a T-9)
| Tarea | Commit |
|---|---|
| T-1 `@expo/vector-icons` | `dadedbc` |
| T-2 25 preguntas y mensajes de RF-16 | `57c2458` |
| T-3 Avance con saltos | `ddc6c7f` |
| T-4 Recuperar el avance | `92c8478` |
| T-5 Borrador en el teléfono y `cuestionarios/{uid}` | `641b3ec` |
| T-6 Regla de `cuestionarios/{uid}` | `e1f5369` |
| T-7 Pantalla del cuestionario | `6141ddd`, `8aecb0d` |
| T-8 Pantalla Perfil Garritas | `4e23e15` |
| T-9 Mi perfil | `1d815a9` |

## Integraciones de `main`
| Fecha | Merge | Hasta | Conflictos |
|---|---|---|---|
| 24/11/2026 | `fe0a543` | PR #21 | Ninguno |
| 25/11/2026 | `b2d4af6` | PR #26 (F-01) | `firestore.rules` y `src/compartido/mensajes.ts` (ver abajo) |

**Cómo se resolvieron los conflictos con F-01:**
- `firestore.rules`:
  - el encabezado es el de `main`;
  - hay una sola `esDueno`, más `haySesion()` de F-01 y `esAdoptante()` de F-04;
  - `usuarios/{uid}` es el de F-01 tal cual;
  - queda el bloque completo de `cuestionarios/{uid}` de F-04, que reemplaza la lectura mínima de F-01 (F-01 A-9);
  - siguen animales y fotos de F-01 y, al final, el bloque que niega todo lo demás.
- `src/compartido/mensajes.ts`: primero el bloque de F-04 y luego el de F-01, sin cambiar textos.
- `src/firebase/usuarios.ts` **no chocó**: F-01 escribe `usuarios/{uid}` en `src/firebase/acceso.ts`.

## Falta
- **T-10: prueba en el celular con Expo Go** (CA-01 a CA-09). F-01 ya está
  en `main`. Antes de probar hay que publicar en la consola de Firebase el
  `firestore.rules` de esta rama, que lleva juntos los bloques de
  `usuarios/{uid}` y `cuestionarios/{uid}` (PO-30).

## Decisiones aprobadas por la PO
- **a) T-8:** en lugar de `IlustracionPerfil.tsx` se crearon
  `src/adoptante/perfil/TarjetaPerfilGarritas.tsx` e
  `src/adoptante/perfil/iconosPerfil.ts`, separados para probar los íconos
  con Jest sin dibujar.
- **b) RN-08:** `cuestionarios/{uid}` se crea al abrir el cuestionario por
  primera vez (lo necesita RF-16 no válido). `03-modelo-datos` §4.2 y §6.3
  dicen "con la primera respuesta": Jennifer lo corrige en `03` v1.2, que
  también cierra P-06 con RN-06.
- **c)** `src/firebase/usuarios.ts` (`leerNombreUsuario`) lo crea F-04 en la
  carpeta de Jennifer, con aviso. Al integrar F-01 no hubo conflicto.
- **d)** Falta T-10: prueba en el celular.

## Acuerdos vigentes
- No usar `DocumentoCuestionario` de `src/compartido/modelo.ts` en el código
  de F-04 (decisión de la PO).
- No tocar `app/(acceso)/`, `app/(albergue)/`, `src/albergue/` ni `specs/`.
- No fusionar el PR #19 hasta cumplir D-47 (revisión en verde, prueba en el
  celular y descripción con spec y RF).
