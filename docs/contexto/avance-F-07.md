# Avance de F-07 · Panel priorizado de solicitudes

Nota para retomar el trabajo si se corta la sesión. Se actualiza en cada commit.

- **Spec:** `specs/features/F-07-panel-solicitudes.md` v1.0 (Aprobada) · `02-navegacion` v1.1 · `03-modelo-datos` v1.6
- **RF:** RF-04, RF-18 · RNF-02 · RF-24 (pestañas) · prepara RC-05
- **Rama:** `feature/F-07-panel-solicitudes` (desde `main` en `a5de767`)
- **Último commit:** T-9
- **PR:** "feat(panel): solicitudes del albergue ordenadas por compatibilidad con "No Apto" (F-07, RF-04, RF-18)". No se fusiona.
- **Línea base en `main` (25/11, después de `npm ci`):** typecheck ✅, lint ✅, Jest 24 suites / 213 pruebas ✅.

## Tareas (§10)
| # | Tarea | Estado |
|---|---|---|
| T-1 | `SIN_ANIMALES_ALBERGUE` y `src/albergue/panel/textos.ts` | ✅ Hecha (`ac5d716`) |
| T-2 | `src/albergue/panel/panel.ts` (funciones puras) y `tests/albergue/panel.test.ts` | ✅ Hecha (`79bfb02`; 24 pruebas; `PALABRAS_CONTEO` en `textos.ts`) |
| T-3 | `src/firebase/panelSolicitudes.ts` y `tests/firebase/panelSolicitudes.test.ts` | ✅ Hecha (`99127c7`; 10 pruebas; `getDocsFromServer` + 10 s; `uidDelAlbergue`) |
| T-4 | Bloque de `solicitudes` en `firestore.rules` y casos de CA-11 | ✅ Hecha (`d5df00b`; sin publicar; se prueba el viernes) |
| T-5 | `useMisAnimales` y `useSolicitudesDeAnimal` | ✅ Hecha (`d444b62`; `useFocusEffect` + turno; `leerNombreDelAlbergue` con 10 s en `panelSolicitudes.ts`, 2 pruebas más) |
| T-6 | `FilaAnimal`, `TarjetaSolicitud`, `MenuUsuario` e `iconosPanel.ts` | ✅ Hecha (`4d12f56`; menú en un `Modal` transparente) |
| T-7 | Pantalla "Solicitudes · lista de mis animales" | ✅ Hecha (`b4f47d9`; encabezado, nombre del albergue y "Tus animales" solo cuando hay datos o está vacía) |
| T-8 | Pantalla "Solicitudes de un animal" | ✅ Hecha (`feacc50`; "←" visible en todos los estados; el título se ve mientras se leen las solicitudes) |
| T-9 | Pestañas de los dos roles (PS-13, PO-34, PO-26) | ✅ Hecha (`useOpcionesPestanas` + `estiloBarraPestanas`; 5 pruebas) |
| T-10 | Prueba en el celular y publicar reglas (Jennifer) | Pendiente |

## Decisiones aceptadas en el plan (Jennifer, 25/11/2026)
1. `npm ci` para sincronizar `node_modules` con `package-lock.json` (faltaban `@expo/vector-icons`, `expo-image-picker` y `expo-image-manipulator`). Sin dependencias nuevas.
2. **Medidas de Figma (solo colores de `tema.ts`):**
   - Fila de animal: fondo azul grisáceo, radio 32, alto ~92, relleno 14; miniatura cuadrada 64 px con radio 16; nombre negrita 22; conteo negrita 13; "›" café.
   - Tarjeta de solicitud: fondo azul grisáceo, radio 28, relleno 16, 12 entre tarjetas. Iniciales: círculo crema de 44 px, negrita 16 café. Nombre negrita 17; resumen regular 12. "90%" negrita 22 a la derecha y "compatible" negrita 11 debajo.
   - "No Apto": la misma tarjeta con opacidad ~0.6.
   - Estado: píldora crema (alto ~32, radio 16), negrita 13 café, debajo del nombre. También para "Pendiente" (F-08 la cambia por los botones).
   - Encabezado: "Solicitudes" negrita 24 con huella de contorno (lista) o "←" (animal). Subtítulo (albergue) negrita 13; título negrita 26. "N solicitudes nuevas" (regular 12) y "Mayor compatibilidad" (negrita 12 con ícono de orden) en la misma línea, a los extremos.
   - Ícono de usuario: círculo azul grisáceo 48 con ícono de contorno 24. "Cerrar sesión": píldora azul marino, texto crema negrita 15 con ícono de salida a la izquierda, 8 px debajo del ícono, a la derecha, con sombra suave.
   - Márgenes laterales de 24.
   - Pestañas: radio 24 (Soft UI), 72 px + espacio inferior, íconos de 24, rellenos en la activa y de contorno en las inactivas.
3. Con 0 "Pendiente": "0 solicitudes nuevas".
4. **Las tres consultas usan `getDocsFromServer`** (no `getDocs`), para que en modo avión salga el error de CA-08 y no la copia del teléfono, y para ver los cambios de F-08 al volver. **Se registra en la spec v1.1 (PS-6) al cerrar.**
5. Sin botón "Reintentar": se vuelve a leer al regresar a la pantalla (A4).
6. `uidDelAlbergue()` vive en `src/firebase/panelSolicitudes.ts`. `decidirPantallaLista` se agrega a `panel.ts` para probar CA-06 y CA-08 con Jest.
7. No se tocan `app/(albergue)/solicitud/[solicitudId].tsx` (F-08) ni `specs/`.

## Casos de CA-11 para el emulador (viernes 27, PO-31)
Datos del emulador: `usuarios/refugio-patitas` (`rol: 'albergue'`), `usuarios/otro-albergue` (`rol: 'albergue'`), `usuarios/adoptante-a` y `usuarios/adoptante-b` (`rol: 'adoptante'`) y las solicitudes s1 a s6 de 03 §8.3 (todas con `albergueId: 'refugio-patitas'`), cada una con su `privado/contacto`.

| # | Caso | Esperado |
|---|---|---|
| 1 | Refugio Patitas consulta `solicitudes` donde `albergueId == 'refugio-patitas'` | ✅ Permitido |
| 2 | Refugio Patitas consulta donde `albergueId == 'refugio-patitas'` y `animalId == 'wini'` | ✅ Permitido |
| 3 | Refugio Patitas lee `solicitudes/s1` (un documento suyo) | ✅ Permitido |
| 4 | Adoptante A consulta `solicitudes` donde `adoptanteId == 'adoptante-a'` (lo usará F-06) | ✅ Permitido |
| 5 | Adoptante A lee `solicitudes/s1` (suya) | ✅ Permitido |
| 6 | Refugio Patitas consulta `solicitudes` sin filtro | ❌ Negado |
| 7 | Refugio Patitas consulta solo con `animalId == 'wini'` (sin `albergueId`) | ❌ Negado |
| 8 | Otro albergue consulta donde `albergueId == 'refugio-patitas'` | ❌ Negado |
| 9 | Otro albergue lee `solicitudes/s1` | ❌ Negado |
| 10 | Adoptante A lee `solicitudes/s2` (de Adoptante B) | ❌ Negado |
| 11 | Adoptante A consulta donde `adoptanteId == 'adoptante-b'` | ❌ Negado |
| 12 | Sin sesión, lee `solicitudes/s1` o consulta la colección | ❌ Negado |
| 13 | Adoptante A crea una solicitud (con cualquier dato) | ❌ Negado (lo abre F-06) |
| 14 | Refugio Patitas cambia `estado` de `s1` a `"Pre-aprobada"` | ❌ Negado (lo abre F-08) |
| 15 | Cualquiera borra `solicitudes/s1` | ❌ Negado |
| 16 | Refugio Patitas lee `solicitudes/s4/privado/contacto` (aunque esté "Pre-aprobada") | ❌ Negado (lo abre F-08) |

## Notas técnicas
- **PS-2 con los datos de prueba:** `npm run datos:prueba` escribe los 5 animales en un solo lote con `serverTimestamp()`, así que todos tienen el mismo `creadoEn`. Con el empate, `ordenarAnimales` deja el orden en que llegan de Firestore (por ID: Canela, Luna, Rocky, Toby, Wini). Un animal nuevo publicado desde la app sí sale arriba.
- **Iniciales (PS-9):** se toma la primera letra tal como está escrita (no se pasa a mayúsculas, porque la spec no lo pide). Con nombres capturados en minúsculas se verían en minúsculas: se puede decidir en la v1.1.
- Los tipos `SolicitudConId` y `LecturaSolicitudes` viven en `panel.ts` y `panelSolicitudes.ts` los importa como tipo (igual que `cuestionario.ts` usa tipos de `src/adoptante/`).
- `panel.ts` solo importa **tipos** de `src/firebase/` (se borran al compilar): no usa Firebase en tiempo de ejecución (RN-01).

- **Radios:** fila 32 (`RADIOS.tarjetaGrande`), tarjeta 28 (constante local, ≥ 24), píldoras con `RADIOS.pildora` (alto 32 → se ve igual que radio 16). **La miniatura usa radio 16** (constante local en `FilaAnimal`), debajo del mínimo de 24 de arquitectura §8: es la medida de Figma aprobada en el plan. Si se quiere en `tema.ts`, hay que ajustar `tests/tema.test.ts` (todos los `RADIOS` ≥ 24).
- **MenuUsuario (PS-11):** el botón vive en un `Modal` transparente que cubre la pantalla; la capa de fondo cierra el menú (también al tocar el ícono otra vez, porque queda debajo de la capa). La posición se mide con `measureInWindow`. **Revisar en el celular** que el botón quede 8 px debajo del ícono en Android (barra de estado) y en iPhone.

- **Espacio inferior (PO-34):** con `height` fija, React Navigation no suma el espacio inferior a la altura, pero sí pone `paddingBottom = insets.bottom` (revisado en `expo-router/build/react-navigation/bottom-tabs/views/BottomTabBar.js`). `estiloBarraPestanas(inferior)` devuelve `height: 72 + inferior` y `paddingBottom: inferior`: es el único lugar que lo suma. `app/(adoptante)/(pestanas)/_layout.tsx` ya no lo suma (se quitó `ALTURA_BASE` del PR #32) y usa `useOpcionesPestanas()`, igual que el albergue.
- **Aviso a Paulina (P-03):** cambiaron `estiloPestanas.ts` (export por defecto sin `height`, más `useOpcionesPestanas`, `ICONOS_PESTANAS`, `iconoDePestana`, `estiloBarraPestanas`) y `app/(adoptante)/(pestanas)/_layout.tsx` (íconos y hook). Si F-06 toca ese `_layout`, al hacer `git merge origin/main` conservar el hook y los íconos.

## Qué falta
- Todo lo de la tabla de arriba marcado como Pendiente.
