# Avance de F-02 · Alta del animal

Nota para retomar el trabajo si se corta la sesión. Se actualiza en cada commit.

- **Spec:** `specs/features/F-02-alta-animal.md` v1.0 (Aprobada) · `03-modelo-datos` v1.4
- **RF:** RF-01, RF-13, RF-14 · RI-02 · RNF-02
- **Rama:** `feature/F-02-alta-animal` (desde `main` en `58e7a16`)
- **Último commit:** T-2 (edad, tamaño y datos de prueba)
- **PR:** todavía no se abre. Título: "feat(alta): alta del animal con fotos y perfil de compatibilidad (F-02, RF-01, RF-13, RF-14, RI-02)". No se fusiona.

## Tareas (§10)
| # | Tarea | Estado |
|---|---|---|
| T-1 | Mensajes `CAMPOS_OBLIGATORIOS`, `FOTO_OBLIGATORIA`, `PERFIL_INCOMPLETO`, `CAMARA_SIN_PERMISO` | ✅ Hecha |
| T-2 | `Edad`, `Tamano`, `OPCIONES_EDAD`, `OPCIONES_TAMANO`, `MAX_FOTOS_ANIMAL`; datos de prueba (03 §8.2) y su prueba | ✅ Hecha |
| T-3 | `src/albergue/alta/textos.ts` y `opcionesPerfil.ts` | Pendiente |
| T-4 | `src/albergue/alta/validacion.ts` y sus pruebas | Pendiente |
| T-5 | `expo-image-picker` y `expo-image-manipulator`; `fotos.ts` (puro) y `procesarFoto.ts` (nativo) | Pendiente |
| T-6 | `src/firebase/altaAnimal.ts` (`writeBatch`, 10 s, ID fijo, A9) | Pendiente |
| T-7 | `SelectorOpciones`, `CasillaCuidado`, `SeccionFotos` | Pendiente |
| T-8 | `useAltaAnimal` y pantalla "Nueva mascota" | Pendiente |
| T-9 | `firestore.rules` (§9) y casos de CA-11 en esta nota | Pendiente |
| T-10 | Prueba en el celular y publicar reglas (Jennifer) | Pendiente |

## Decisiones aceptadas en el plan (Jennifer, 2026-11-25)
1. **Fotos con ID fijo** `foto-0`, `foto-1`, `foto-2` y regla `fotoId == 'foto-' + string(orden)`. Se registra como **AL-13** al cerrar (no se edita `specs/`).
2. Foto: 1080 px de ancho (sin agrandar) y calidades `[0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2]` hasta ≤ 300 KB. Miniatura: 300 px, **máximo** 30 KB, sin forzar el mínimo de 20 KB. KB = 1024 bytes; bytes = largo del base64 × 3/4 − relleno, sin el prefijo.
3. Errores al publicar: 10 s o `unavailable` → `ERROR_CONEXION`; `permission-denied` → revisar A9 con `getDocFromServer` → `ok` o `SIN_PERMISO`; cualquier otro → `ERROR_CONEXION` (como F-01 A-7).
4. El formulario se queda lleno al cambiar de pestaña y se limpia solo al publicar.
5. "Tomar foto" y "Elegir de la galería" se muestran al presionar "Añadir una foto" y se ocultan al agregar una foto o cancelar. **Si la cámara está negada**, los dos botones y `CAMARA_SIN_PERMISO` se quedan visibles.
6. Si `expo install` agrega el plugin a `app.json`, se deja con sus valores de fábrica. Nada más en `app.json`.
7. El prefijo `data:image/jpeg;base64,` no se revisa en las reglas (solo tipo y tamaño).
8. Reglas con la lista completa de los 12 campos en `hasOnly` y `hasAll` (o una función que la devuelva).
9. Se reutiliza `conTiempoLimite` de `src/firebase/acceso.ts` (se exporta, no se mueve).
10. La pantalla usa `ScrollView`; el teclado no tapa el nombre y el mensaje de error se ve junto a "Publicar para adopción" sin hacer scroll.
11. El `uid` lo lee `altaAnimal.ts` de `auth.currentUser` (no se cambia `useSesion`). No se cambia `BotonPildora`.

## Casos de CA-11 para el emulador (viernes 27, PO-31)
Se escriben en T-9.

## Qué falta
- T-3 a T-10.
- Después de fusionar: volver a correr `npm run datos:prueba` (Jennifer) para que Wini, Luna, Rocky, Toby y Canela tengan la edad y el tamaño nuevos.
