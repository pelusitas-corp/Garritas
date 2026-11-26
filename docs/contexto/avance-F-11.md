# Avance F-11 · Ajustes de diseño visual

- **Spec:** `specs/features/F-11-ajustes-diseno.md` (v1.0 Aprobada; la v1.1 con
  las respuestas del plan la sube Jennifer aparte).
- **Rama:** `style/F-11-ajustes-diseno`, creada desde `main` en `ad69c85`
  (ya incluye F-06, PR #41: el ícono opcional de `BotonPildora`).
- **Tipo:** decisión del equipo; no está en el SRS. No cambia textos,
  mensajes, validaciones, rutas, reglas ni datos de Firestore.

## Tareas

| # | Tarea | Estado |
|---|---|---|
| T-1 | `OPACIDAD_DESVANECIDO` y `BORDE` en `tema.ts` con sus pruebas | Hecha |
| T-2 | `BotonPildora`: tamaño chico y desactivado desvanecido | Hecha |
| T-3 | Logo y "Iniciar sesión" chico (Selección de Rol y "Crea tu cuenta") | Hecha |
| T-4 | Casilla al final del aviso y desplazamiento con el error | Hecha |
| T-5 | `EncabezadoMarca` y su uso en Descubrir | Hecha |
| T-6 | Decoraciones del perfil y encabezado de marca | Hecha |
| T-7 | Subtítulo de Descubrir y espacios parejos | Pendiente |
| T-8 | Deslizar la tarjeta para "Pasar" o "Me encanta" | Pendiente |
| T-9 | Foto completa del Detalle con alto flexible | Pendiente |
| T-10 | Pestaña activa en píldora | Pendiente |
| T-11 | Nombre del albergue más grande que "Tus animales" | Pendiente |
| T-12 | Nueva mascota en 4 contenedores | Pendiente |
| T-13 | Cierre de la nota con la guía de prueba en el celular | Pendiente |

**Último commit:** T-6 (ver `git log`).

## Decisiones del plan (confirmadas por Jennifer el 25/11/2026)

1. **AD-4 en todos los `desactivado`:** también "Añadir una foto" y "Tomar
   foto" de F-02 se ven desvanecidos. `SeccionFotos.tsx` no se toca; F-02 se
   actualiza después (P-04 de F-11).
2. **Pestañas:** margen vertical 6 y horizontal **8** (no 12), para que
   "Mis solicitudes" quepa en teléfonos de 360 de ancho.
3. **Decoraciones del perfil** (zona de 240 × 220 con el círculo de 180 al
   centro; posiciones desde arriba a la izquierda):
   - estrellita de contorno de 20 en (4, 24);
   - puntito azul marino de 10 en (214, 10);
   - estrellita de 18 en (218, 168);
   - puntito azul grisáceo de 8 en (14, 184).
4. **Medidas:** botón chico con relleno 10 × 24, texto 16 y
   `alignSelf: 'center'`; logo con `marginTop 8` y título con `marginTop 16`;
   en Descubrir, 12 debajo del subtítulo y dos espacios flexibles iguales de
   mínimo 12. El borde superior del pie de Nueva mascota usa `BORDE`.
5. `BORDE` va aparte de `RADIOS`, así la prueba "todos los bordes miden al
   menos 24 px" no cambia.

## Qué falta

T-7 a T-13, las verificaciones finales, el push y el PR (sin fusionar).

## Pendientes

- **Unir `EncabezadoGarritas` y `EncabezadoMarca`** (tarea aparte, para
  después de la entrega). F-06 creó `src/adoptante/match/EncabezadoGarritas.tsx`
  (huella, "Garritas" y el círculo de usuario) con las mismas medidas que
  `src/compartido/EncabezadoMarca.tsx`. F-11 no toca `src/adoptante/match/`,
  así que por ahora existen los dos.

## Notas por tarea

- **T-2:** `BotonPildora` conserva el `icono` de F-06 y agrega `tamano`
  (`normal` | `chico`). La función pura `aspectoBoton(variante, { gris,
  desactivado, cargando })` devuelve `{ fondo, colorTexto, opacidad,
  responde }` y `MEDIDAS_BOTON` guarda las medidas de cada tamaño; las dos se
  prueban en `tests/compartido/botonPildora.test.ts`. `cargando` no se
  desvanece: solo muestra el indicador.
- **T-3:** logo de 240 × 189 (`Math.round(240 × 456 / 580)`) centrado, con
  `marginTop 8`, antes de "Bienvenido a Garritas" (que pasa a `marginTop 16`),
  con `accessibilityLabel` "Logo de Garritas". "Iniciar sesión" usa
  `tamano="chico"` en Selección de Rol y en "Crea tu cuenta". Expo 58 ya no
  declara los `.png` para TypeScript y ESLint prohíbe `require()`, así que se
  agregó `src/compartido/imagenes.d.ts` (solo tipos) para poder hacer
  `import LOGO from '…/logo-garritas.png'`.
- **T-4:** el enlace "Ver aviso completo", la casilla y el mensaje de CA-02
  van dentro del `ScrollView` menta, después del aviso (separación 16).
  "Continuar" queda fijo debajo, gris pero activo (F-01 A1). Un contador
  `intentosSinCasilla` sube en cada "Continuar" sin la casilla y un
  `useEffect` llama a `scrollToEnd` cuando cambia: así también baja la
  segunda vez. En RN 0.88 el ref usa el tipo `ScrollViewInstance`.
- **T-5:** `EncabezadoMarca({ texto, derecha? })` dibuja la huella `paw` de
  24 y el texto en negrita 24 café, con alto 48, `marginTop 8` y margen
  lateral 24; `derecha` es opcional. El nombre del ícono vive en el mismo
  archivo porque `src/compartido` no importa `ICONOS_DESCUBRIR`. Descubrir
  le pasa `TEXTO_GARRITAS` y su botón de usuario: se ve igual que antes.
- **T-6:** `TarjetaPerfilGarritas` dibuja una zona de 240 × 220 con el
  círculo menta de 180 al centro (el ícono sigue de 88) y, con posición
  absoluta, las 4 decoraciones confirmadas: estrellitas
  `star-four-points-outline` café de 20 en (4, 24) y de 18 en (218, 168), y
  puntitos de 10 azul marino en (214, 10) y de 8 azul grisáceo en (14, 184).
  Van en una capa con `pointerEvents="none"`, `accessibilityElementsHidden`
  e `importantForAccessibility="no-hide-descendants"`. El nombre pasa a
  negrita 32. Perfil Garritas y Mi perfil muestran `EncabezadoMarca` con
  `TEXTO_GARRITAS` y `TEXTO_MI_PERFIL`; en Mi perfil el nombre y la tarjeta
  quedan centrados (`flex 1`) entre el encabezado y "Cerrar sesión".
