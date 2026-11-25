# Avance de F-01 · Acceso y privacidad

Nota para retomar el trabajo si se corta la sesión. Se actualiza en cada commit.

- **Spec:** `specs/features/F-01-acceso-privacidad.md` v1.1 (Aprobada)
- **RF:** RF-25, RF-23, RF-09, RF-24 · RNF-02
- **Rama:** `feature/F-01-acceso-privacidad` (desde `main` en `c242f1b`)
- **Último commit:** T-2 (validaciones y errores)
- **PR:** todavía no se abre. Título: "F-01: Acceso y privacidad (RF-25, RF-23, RF-09, RF-24)". No se fusiona.

> El intento anterior de F-01 (sobre un `main` viejo) quedó en la rama local
> `respaldo/F-01-intento-anterior`. No se usa.

## Tareas (§6.1)
| # | Tarea | Estado |
|---|---|---|
| T-1 | Mensajes nuevos en `src/compartido/mensajes.ts` | ✅ Hecha |
| T-2 | Funciones puras: validar formulario y traducir errores de Firebase (`src/compartido/acceso/`) | ✅ Hecha |
| T-3 | `src/firebase/acceso.ts` (crear cuenta e iniciar sesión, RN-11, RN-13) y `crearCuenta` en `useSesion.tsx` | Pendiente |
| T-4 | `BotonPildora` (`gris`, `desactivado`, `cargando`) e `@expo/vector-icons` | Pendiente |
| T-5 | `avisos.ts` (texto + lector corto de Markdown) y prueba contra los `.md` | Pendiente |
| T-6 | Pantallas: Selección de Rol, Aviso de Privacidad, Aviso integral | Pendiente |
| T-7 | Pantallas: Registro y los dos accesos | Pendiente |
| T-8 | `firestore.rules`: `usuarios`, `animales`/`fotos` con sesión, lectura mínima de `cuestionarios` | Pendiente |
| T-9 | Cerrar esta nota y descripción del PR | Pendiente |

## Decisiones aceptadas en el plan (Jennifer, 2026-11-24)
1. Todo lo de Firebase va en `src/firebase/acceso.ts`. **No** se crea `src/firebase/usuarios.ts` (lo crea F-04, PR #19).
2. T-8 agrega solo `match /cuestionarios/{uid} { allow read: if esDueno(uid); }` con el comentario "Lectura mínima para la navegación (02-navegacion G-5). F-04 la reemplaza con su bloque completo (PR #19)". Al integrar `main`, Paulina se queda con su bloque y borra esta línea. `esDueno` es idéntica a la de F-04.
3. Errores (P1): registro → `too-many-requests` y códigos desconocidos = `ERROR_CONEXION`. Acceso → `user-disabled` y códigos desconocidos = `CREDENCIALES_INVALIDAS`.
4. RN-11 (P2): se esperan 10 s a `setDoc`. Si falla, `deleteUser`; si eso también falla, `signOut` y la cuenta queda huérfana en Auth: **el equipo la borra desde la consola**. Va también en el PR.
5. Gris del botón (P3): `COLORES.azulGrisaceo`.
6. Reglas (P4): `keys().hasOnly(['rol','nombre','correo','telefono','consentimiento','creadoEn'])`; `nombre` y `telefono` string con `size() > 0`. La app guarda `nombre` y `telefono` sin espacios al inicio ni al final. `/{document=**}` sigue al final.
7. Flecha "←" en todas las pantallas de acceso menos Selección de Rol (P5).
8. Lógica de acceso en `src/compartido/acceso/`. `/registro` sin aceptación en memoria redirige a `/aviso-privacidad` (RN-01). Después de crear la cuenta se borra la aceptación de memoria (P6).
9. RN-13: `useSesion.crearCuenta()` usa una bandera para ignorar `onAuthStateChanged` hasta que `usuarios/{uid}` está escrito.
10. Campos: correo `email-address` + `autoCapitalize="none"`; teléfono `phone-pad`; contraseña oculta con el ojo. Lector de Markdown corto (títulos, párrafos, listas, separador, **negritas**) con su prueba.
11. Sin `npm run test:rules` (viernes, A-6). Sin otras dependencias.

## Qué falta
- T-3 a T-9.
- Prueba en el celular (publicar reglas de F-01 + bloque de F-04 juntos, PO-30).
