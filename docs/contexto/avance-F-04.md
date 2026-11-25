# Avance de F-04 · Cuestionario y perfil Garritas

Nota para retomar el trabajo si se corta la sesión. Fecha: 24/11/2026.

## Estado
| Dato | Valor |
|---|---|
| Spec | `specs/features/F-04-cuestionario.md` v1.0, Aprobada |
| RF | RF-02, RF-15, RF-16, RF-19 · RNF-02, RNF-03 |
| Rama | `feature/F-04-cuestionario` (sale de `main`) |
| PR | #19 "feat(cuestionario): cuestionario y perfil Garritas (F-04, RF-02, RF-15, RF-16, RF-19)", abierto, **sin fusionar** |
| Último commit antes de esta nota | `fe0a543` chore(cuestionario): integra main en F-04 (merge de `origin/main` hasta el PR #21) |
| Revisión automática | `typecheck`, `lint` y `test` en verde en local después de integrar main |

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

## Falta
1. **Segunda integración de `main` cuando llegue F-01** (Jennifer). Resolver
   ahí los choques de los archivos compartidos (ver abajo) y volver a correr
   `typecheck`, `lint` y `test`.
2. **T-10: prueba en el celular con Expo Go** (CA-01 a CA-09). Depende de
   F-01 en `main` y de publicar **juntas** en la consola de Firebase las
   reglas de `usuarios/{uid}` y `cuestionarios/{uid}` (PO-30).

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
  carpeta de Jennifer, con aviso. Si F-01 también lo toca, el conflicto lo
  resuelve F-04 al integrar `main`.
- **d)** Falta T-10: prueba en el celular, que depende de F-01.

## Archivos compartidos que chocarán con F-01
- `firestore.rules`: F-04 agregó el bloque de `cuestionarios/{uid}`; F-01
  agrega el de `usuarios/{uid}`.
- `src/compartido/mensajes.ts`: F-04 agregó `CUESTIONARIO_RECUPERADO` y
  `CUESTIONARIO_SIN_AVANCE`; F-01 agrega los suyos.
- Quizá `src/firebase/usuarios.ts` (decisión c).

## Acuerdos vigentes
- No usar `DocumentoCuestionario` de `src/compartido/modelo.ts` en el código
  de F-04 (decisión de la PO).
- No tocar `app/(acceso)/`, `app/(albergue)/`, `src/albergue/` ni `specs/`.
- No fusionar el PR #19 hasta cumplir D-47 (revisión en verde, prueba en el
  celular y descripción con spec y RF).
