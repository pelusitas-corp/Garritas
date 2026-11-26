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
| T-3 | Logo y "Iniciar sesión" chico (Selección de Rol y "Crea tu cuenta") | Pendiente |
| T-4 | Casilla al final del aviso y desplazamiento con el error | Pendiente |
| T-5 | `EncabezadoMarca` y su uso en Descubrir | Pendiente |
| T-6 | Decoraciones del perfil y encabezado de marca | Pendiente |
| T-7 | Subtítulo de Descubrir y espacios parejos | Pendiente |
| T-8 | Deslizar la tarjeta para "Pasar" o "Me encanta" | Pendiente |
| T-9 | Foto completa del Detalle con alto flexible | Pendiente |
| T-10 | Pestaña activa en píldora | Pendiente |
| T-11 | Nombre del albergue más grande que "Tus animales" | Pendiente |
| T-12 | Nueva mascota en 4 contenedores | Pendiente |
| T-13 | Cierre de la nota con la guía de prueba en el celular | Pendiente |

**Último commit:** T-2 (ver `git log`).

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

T-3 a T-13, las verificaciones finales, el push y el PR (sin fusionar).

## Notas por tarea

- **T-2:** `BotonPildora` conserva el `icono` de F-06 y agrega `tamano`
  (`normal` | `chico`). La función pura `aspectoBoton(variante, { gris,
  desactivado, cargando })` devuelve `{ fondo, colorTexto, opacidad,
  responde }` y `MEDIDAS_BOTON` guarda las medidas de cada tamaño; las dos se
  prueban en `tests/compartido/botonPildora.test.ts`. `cargando` no se
  desvanece: solo muestra el indicador.
