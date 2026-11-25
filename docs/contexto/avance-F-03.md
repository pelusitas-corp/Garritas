# Avance de F-03 · Descubrir y detalle del animal

Nota para retomar el trabajo si se corta la sesión. Última actualización:
25/11/2026 (ronda de diseño fiel al prototipo, spec v1.2).

## Estado
| Dato | Valor |
|---|---|
| Spec | `specs/features/F-03-descubrir-detalle.md` v1.2, Aprobada |
| RF | RF-10, RF-26, RF-28 · RNF-01 (usa RF-17, RF-03 y RF-18 del motor F-05) |
| PR #30 | Fusionado en `main` (`42b4a8c`): F-03 completa con la ronda de ajustes |
| Rama actual | `style/F-03-diseno`, desde `main` en `42b4a8c` |
| Último commit de código | `13a9a1d` style(detalle): tarjeta, mosaicos, píldoras y botón fijo |
| Revisión automática en local | `typecheck`, `lint` y `test` (24 suites, 213 pruebas) en verde |
| PR de diseño | Pendiente de abrir hacia `main` (no hay `gh` en esta computadora) |
| Falta | Abrir el PR y probar el diseño en el celular (360 × 740 y el de la autora) |

## Ronda de diseño fiel al prototipo (spec v1.2, DE-10)
| Cambio | Commit |
|---|---|
| Spec v1.2 | `34c034e` |
| Descubrir: huella y "Garritas", subtítulo, tarjeta de radio 32, foto de 270 que se encoge en pantallas bajas, píldoras de 26 (el % en menta), botones de 88. `RADIOS.tarjetaGrande` (32) en `tema.ts`; `Pildora.tsx` nuevo | `53016f8` |
| Detalle: encabezado con flecha y círculo de usuario, tarjeta de radio 32 con ✕, carrusel de 180, nombre con corazón, `Mosaico.tsx` (110), cuidados como píldoras, albergue con casita, texto de apoyo | `13a9a1d` |

**Lo que no se igualó al prototipo:**
- **Radio 20** del carrusel y de los mosaicos: queda en 24, el mínimo de
  Soft UI (arquitectura §8, prueba `tests/tema.test.ts`).
- **Píldora de tamaño en la tarjeta:** no está en la spec (flujo A paso 6 y
  DE-8 piden especie y %). Si la quieren, primero va en el SRS y la spec.
- **"¡Quiero adoptarlo!" de 64 de alto:** `BotonPildora` mide unos 57
  (padding vertical 16 + texto de 18). Le falta un alto fijo o un padding
  vertical de ~20; no se cambió el componente compartido.
- **Etiquetas "Albergue" y "Cuidados de salud":** el prototipo no las
  muestra; quedan como nombre accesible (lector de pantalla), no visibles.
- **Cabe en 360 × 740:** calculado (la foto baja a ~226), no probado en un
  celular desde esta sesión.

## Historia anterior (rama `feature/F-03-descubrir-detalle`, PR #30)
| Dato | Valor |
|---|---|
| Base | Salió de `feature/F-04-cuestionario` (`a2d1cdd`). Después se integró `origin/main` hasta `9b54218` (PR #19 F-04 y PR #29 F-02), por fast-forward y sin conflictos |
| Último commit | `c8bdff9` docs(specs): DE-9 y A4 incluyen Ver de nuevo |

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
| T-10 Nota y prueba en el celular | Nota al día. Primera prueba en el celular hecha por la autora; falta repetirla con los ajustes |

## Ronda de ajustes después de la prueba en el celular (25/11/2026)
| Cambio | Commit |
|---|---|
| Spec v1.1 (mensaje de DE-1 con ¡ y !, nueva DE-9) | `dbc324e` |
| `MAZO_TERMINADO` = "Ya viste a todas tus mascotas compatibles. ¡Vuelve pronto para conocer nuevas!" | `66ad028` |
| CA-06: el Detalle lee el animal y sus fotos del servidor (`getDocFromServer`, `getDocsFromServer`) | `7574502` |
| G-8 se pinta al volver + DE-9 (aviso de 5 s; `aviso.ts` con su prueba) | `1d012d7` |
| Diseño de Descubrir (`BotonCircular`, `TarjetaAnimal`, íconos nuevos) | `59de51f` |
| Diseño del Detalle (tarjeta azul claro, mosaicos, botón fijo) | `7e8d258` |

**Por qué falló la prueba 7 (CA-06):** `getDoc` puede responder con la copia
que Firestore guarda en el teléfono, que todavía decía "Disponible". Con
`getDocFromServer` siempre pregunta al servidor; sin conexión falla y se
muestra el error de conexión (A5).

**Por qué el aviso de G-8 no se pintaba:** Descubrir borraba `?aviso` con
`router.setParams` justo al recibir el foco, mientras Expo Router seguía
procesando el `dismissTo` del Detalle. Ese cambio de navegación quedaba en
cola y la pantalla no se repintaba hasta el siguiente toque. Ahora el aviso
y el mazo nuevo se aplican al recibir el foco, y el parámetro se borra al
**salir** de Descubrir, con `navigation.setParams` de su propia ruta.
**No se pudo probar en Expo Go desde esta sesión** (no hay celular aquí).

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
   `check-circle` / `close-circle` (cuidados de salud). En la ronda de
   ajustes se agregaron `close`, `heart-outline`, `arrow-left`, `paw`,
   `cake-variant-outline`, `ruler` y `home-outline`.

## Decisiones de implementación (para explicar en clase)
- **RN-03 / DE-5 (`useDescubrir`):** `useFocusEffect` recalcula cada vez que
  Descubrir recibe el foco. Antes de abrir el Detalle se prende la marca
  `fuiAlDetalle`; al volver, se apaga y no se recalcula.
- **G-8 (`useDetalleAnimal`):** si el Detalle se abrió desde Descubrir,
  `router.dismissTo(rutaDescubrirConAviso())` regresa a ese mismo Descubrir y
  saca el Detalle de la pila; con un enlace directo usa `router.replace`.
  Descubrir ve `?aviso=no-disponible`, muestra el aviso y recalcula (el mazo
  empieza de nuevo). El parámetro se borra al salir de Descubrir.
- **DE-9:** el aviso se quita a los 5 s (`programarQuitarAviso`), con
  "Pasar", al abrir una tarjeta o al salir de Descubrir. También con
  "Ver de nuevo" (lo pidió la PO; en la práctica no coincide con el aviso,
  porque el mazo nuevo empieza en la primera tarjeta).
- **Diseño:** el ícono de usuario del Detalle solo se dibuja (no es botón),
  porque 02-navegacion §4.2 no da una ruta del Detalle a Mi perfil.
- **Los nombres de las pruebas** son los criterios (CA-01 a CA-07, RNF-01,
  RNF-02, A5, DE-9).

## Pendientes para verificar en el celular
- G-8 (prueba 7): al tocar a Wini con su estado cambiado en la consola, regresa
  a Descubrir y **en ese momento** se ven el aviso y el mazo sin Wini.
- DE-9: el aviso se quita solo a los 5 s, o antes con "Pasar".
- Que al volver del Detalle con "←" o "✕" el mazo siga en la misma tarjeta (DE-5).
- El diseño nuevo en un celular chico (que quepan la tarjeta y los dos botones).
- Los datos de prueba de Firebase deben estar cargados con la v1.4 de
  03-modelo-datos (Wini "1 a 3 años · Pequeño"). No se corrió
  `npm run datos:prueba` desde esta sesión.
