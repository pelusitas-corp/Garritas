# Avance de F-02 · Alta del animal

Nota para retomar el trabajo si se corta la sesión. Se actualiza en cada commit.

- **Spec:** `specs/features/F-02-alta-animal.md` v1.0 (Aprobada) · `03-modelo-datos` v1.4
- **RF:** RF-01, RF-13, RF-14 · RI-02 · RNF-02
- **Rama:** `feature/F-02-alta-animal` (desde `main` en `58e7a16`)
- **Último commit:** T-9 (reglas y casos de CA-11)
- **PR:** todavía no se abre. Título: "feat(alta): alta del animal con fotos y perfil de compatibilidad (F-02, RF-01, RF-13, RF-14, RI-02)". No se fusiona.

## Tareas (§10)
| # | Tarea | Estado |
|---|---|---|
| T-1 | Mensajes `CAMPOS_OBLIGATORIOS`, `FOTO_OBLIGATORIA`, `PERFIL_INCOMPLETO`, `CAMARA_SIN_PERMISO` | ✅ Hecha |
| T-2 | `Edad`, `Tamano`, `OPCIONES_EDAD`, `OPCIONES_TAMANO`, `MAX_FOTOS_ANIMAL`; datos de prueba (03 §8.2) y su prueba | ✅ Hecha |
| T-3 | `src/albergue/alta/textos.ts` y `opcionesPerfil.ts` | ✅ Hecha |
| T-4 | `src/albergue/alta/validacion.ts` (`validarAlta`, `datosValidados`, `perfilCompleto`) y sus pruebas | ✅ Hecha |
| T-5 | `expo-image-picker` y `expo-image-manipulator`; `fotos.ts` (puro) y `procesarFoto.ts` (nativo) | ✅ Hecha (`expo-image-picker` ~58.0.10, `expo-image-manipulator` ~58.0.16; `app.json` sin cambios) |
| T-6 | `src/firebase/altaAnimal.ts` (`writeBatch`, 10 s, ID fijo, A9) | ✅ Hecha (`conTiempoLimite` exportado desde `acceso.ts`) |
| T-7 | `SelectorOpciones`, `CasillaCuidado`, `SeccionFotos` | ✅ Hecha |
| T-8 | `useAltaAnimal` y pantalla "Nueva mascota" | ✅ Hecha (error y botón fijos abajo, fuera del ScrollView) |
| T-9 | `firestore.rules` (§9) y casos de CA-11 en esta nota | ✅ Hecha (sin publicar) |
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
Datos del emulador: `usuarios/refugio-patitas` (`rol: 'albergue'`, `nombre: 'Refugio Patitas'`), `usuarios/otro-albergue` (`rol: 'albergue'`) y `usuarios/adoptante-a` (`rol: 'adoptante'`). "Lote válido" = `animales/{id}` con los 12 campos correctos + `fotos/foto-0` (`orden: 0`) en un `writeBatch`.

| # | Caso | Esperado |
|---|---|---|
| 1 | Refugio Patitas crea un animal suyo con `estado: "Disponible"` y 1 foto en el mismo lote | ✅ Permitido |
| 2 | Lo mismo con 3 fotos (`foto-0`, `foto-1`, `foto-2`) | ✅ Permitido |
| 3 | Un adoptante intenta crear un animal (lote válido con su uid) | ❌ Negado |
| 4 | Sin sesión, intenta crear un animal | ❌ Negado |
| 5 | Albergue crea un animal con `albergueId` de otro albergue | ❌ Negado |
| 6 | Albergue crea un animal con `estado: "En pre-adopción"` | ❌ Negado |
| 7 | Albergue crea un animal con un campo de más (p. ej. `raza`) | ❌ Negado |
| 8 | Albergue crea un animal sin uno de los 12 campos (p. ej. sin `miniatura`) | ❌ Negado |
| 9 | Albergue crea un animal con el perfil sin una dimensión (sin `temperamento`) | ❌ Negado |
| 10 | Albergue crea un animal con un valor de perfil fuera de lista (`energia: 'muyAlta'`) | ❌ Negado |
| 11 | Albergue crea un animal con `edad: '2 años'` o `tamano: 'Pequeña'` | ❌ Negado |
| 12 | Albergue crea un animal con `nombreAlbergue` distinto a su `usuarios/{uid}.nombre` | ❌ Negado |
| 13 | Albergue crea un animal con `nombre: ''` | ❌ Negado |
| 14 | Albergue crea un animal con `creadoEn` que no es la hora del servidor | ❌ Negado |
| 15 | Albergue crea un animal con `miniatura` de más de 60 000 caracteres | ❌ Negado |
| 16 | Albergue agrega `fotos/foto-1` a un animal suyo que ya existía (lote aparte) | ❌ Negado |
| 17 | Albergue crea una foto con `orden: 3` (`fotos/foto-3`) | ❌ Negado |
| 18 | Albergue crea una foto cuyo `fotoId` no coincide con su `orden` (`fotos/foto-0` con `orden: 1`) | ❌ Negado |
| 19 | Lote con 4 fotos (`foto-0` a `foto-2` + `foto-3` u otro ID) | ❌ Negado |
| 20 | Foto con un campo de más o con `datos` de más de 450 000 caracteres | ❌ Negado |
| 21 | Otro albergue crea una foto en un animal de Refugio Patitas | ❌ Negado |
| 22 | Albergue modifica o borra su animal (`update`/`delete`) | ❌ Negado |
| 23 | Cualquier usuario modifica o borra una foto | ❌ Negado |
| 24 | Adoptante con sesión lee `animales/wini` y `animales/wini/fotos/foto-0` | ✅ Permitido |
| 25 | Sin sesión, lee `animales/wini` | ❌ Negado |
| 26 | A9: reintento del mismo lote cuando la ficha ya existe (`set` = update) | ❌ Negado (la app lo cuenta como publicado) |

## Qué falta
- T-10 (Jennifer): publicar `firestore.rules` en la consola (junto con el bloque de F-04 si #19 ya se fusionó) y probar en el celular con Expo Go.
- Viernes 27 (PO-31): pruebas de CA-11 con el emulador (tabla de arriba), junto con CA-09 de F-01.
- Al cerrar: registrar AL-13 (IDs fijos `foto-0` a `foto-2`) en la spec y en 03-modelo-datos §3.2/§4.4.
- Avisar a Paulina (P-03): Wini y Luna ahora son "1 a 3 años · Pequeño".

## Notas técnicas
- El límite de 10 s cubre leer `usuarios/{uid}.nombre` y el `commit` juntos.
- Si se pierde la red al publicar, Firestore deja la escritura en cola: si vuelve la red con la app abierta, el animal se publica aunque ya se vio "Error de conexión". El reintento (A9) lo detecta y no duplica.
- En Android, después de negar la cámara una vez, el sistema todavía deja preguntar: al presionar otra vez "Añadir una foto", "Tomar foto" vuelve a responder y pide el permiso de nuevo. Solo queda gris fijo cuando el sistema ya no deja preguntar.
- Después de fusionar: volver a correr `npm run datos:prueba` (Jennifer) para que Wini, Luna, Rocky, Toby y Canela tengan la edad y el tamaño nuevos.
