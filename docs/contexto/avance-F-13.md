# Avance F-13 · Ajustes de diseño, ronda 3

- **Spec:** `specs/features/F-13-ajustes-diseno-3.md` (v1.2 Aprobada), con
  `03-modelo-datos` v1.9, F-03 v1.4, F-07 v1.3 y `02-navegacion` v1.4.
- **Rama:** `style/F-13-ajustes-diseno-3`, creada desde `main` en `24cbd26`
  (PR #49, specs de F-13). El 26/11 se unió `origin/main` (PR #50, F-13 v1.2
  y 02 v1.4) con `git merge`, sin rebase ni force (`2094dd9`).
- **Tipo:** decisión del equipo; no está en el SRS. No cambia
  `firestore.rules`, `mensajes.ts`, rutas ni campos de Firestore. Sin
  dependencias nuevas.
- **No se corrió** `npm run datos:prueba`: lo corre la autora (T-10).

## Tareas

| # | Tarea | Commit | Estado |
|---|---|---|---|
| T-1 | `tema.ts`: `FONDOS.nuevas`, `FONDOS.noApto`, `OPACIDAD_ATENUADA`, tamaños y medidas nuevas | `3fdb6d3` | Hecha |
| T-2 | Mi perfil: "¡Hola, {nombre}!", "Tu perfil Garritas es:" y píldora "Cerrar sesión" arriba | `4af380d` | Hecha |
| T-3 | Mis solicitudes: estado con puntito, subtítulo, "Descubrir más animales" y deslizar para actualizar | `7133b03` | Hecha (push) |
| T-4 | Descubrir: `foto-0` sobre la miniatura, `contain`, estrellitas y % en menta | `2770c64` | Hecha |
| T-5 | Solicitudes de un animal: foto en círculo, "Un hogar para:" y nombre grande | `75f6890` | Hecha |
| T-6 | Tarjeta de solicitud: % en círculo, No Apto aparte, comas, margen 16, "Ver solicitud ›", Rechazada | `782f7be` | Hecha (push) |
| T-7 | Detalle de solicitud: % en círculo, 3 círculos del hogar, Rechazada | `56c108b` | Hecha |
| T-8 | Nueva mascota: opciones azul grisáceo, contenedores crema y "Añadir una foto" punteado | `a3a9430` | Hecha |
| T-9 | Datos de prueba: Virginia, Lebron, Sombra, 3 fotos y 12 miniaturas | `cec0825` | Hecha (push) |
| T-11 | Ajustes finales v1.2 (AF-16 a AF-22) | `7234733` a `370b02c` | Hecha (push) |
| T-10 | Prueba en el celular y `npm run datos:prueba` | — | Pendiente (autora) |

### T-11 por decisión

| AF | Cambio | Commit |
|---|---|---|
| AF-19 | Descubrir: foto con `cover` y el mismo tamaño y posición de `24cbd26`, con `foto-0`; sin estrellitas ni puntito junto al subtítulo | `7234733` |
| AF-16, AF-17 | Mi perfil: saludo sin tarjeta; modal `ConfirmarCerrarSesion` en Mi perfil y en el menú del albergue | `f8d00de` |
| AF-18 | Mis solicitudes: subtítulo dentro de la lista | `4574c38` |
| AF-20 | Match: botón "←" (Regresar) | `18bb52d` |
| AF-21 | "Ingresa a tu cuenta": `KeyboardAvoidingView` y logo; "Crea tu cuenta" con el mismo teclado | `5e3eeac` |
| AF-22 | Solicitudes de un animal sin solicitudes: animal y vacío centrados juntos, 40 entre ellos | `370b02c` |

**Verificaciones antes del último push:** typecheck, lint y test en verde
(40 suites, 430 pruebas).

## Decisiones de implementación (para revisar)

1. **Mi perfil, vacía y sin permiso:** la píldora "Cerrar sesión" va debajo
   del mensaje, donde estaba el botón de texto (esas pantallas no tienen
   encabezado). Aprobado por Paulina el 26/11.
2. **Mis solicitudes:** al final de la lista, primero "Cada paso te acerca a
   su hogar." y luego "Descubrir más animales". El puntito del estado lleva
   el borde de `BORDE` (2). Aprobado por Paulina el 26/11.
3. **Descubrir (AF-4):** `leerFotoPrincipal` lee un solo documento
   (`fotos/foto-0`) con `getDoc`. Se lee la foto del animal visible y la del
   siguiente; las que llegan se guardan en memoria mientras Descubrir está
   abierta y no se vuelven a leer. Si una lectura falla, se queda la
   miniatura y esa foto se puede pedir otra vez la próxima vez que se vea su
   tarjeta. La regla `allow read: if haySesion()` de `fotos` ya lo permitía.
4. **Descubrir (AF-5 y AF-19):** la estrellita del % es `star-four-points`
   (✦), en azul marino. El texto del % sigue siendo "92 % compatible" (con
   espacio, de F-03); no se cambió. Las estrellitas del subtítulo se
   quitaron por AF-19.
5. **Hogar con comas (AF-12):** "Casa, tiene experiencia", con los mismos
   textos de hoy (PS-9). F-13 v1.2 corrigió el ejemplo de la spec: resuelto.
6. **No Apto:** la tarjeta sigue deslavada (opacidad 0.6), como en F-07; F-13
   no dice que se quite. `textoCompatible` se reemplazó por `etiquetaNoApto`.
7. **Detalle de solicitud (AF-11):** el % en círculo solo se ve mientras está
   "Pendiente"; con "Pre-aprobada" o "Rechazada" se ve la píldora del estado,
   como antes (PA-5). Bajo cada círculo del hogar va el mismo texto de hoy
   ("Vive en: Casa").
8. **"Ver solicitud ›":** se ve en todas las tarjetas, también en las ya
   atendidas (CA-08: "cada tarjeta").
9. **Nueva mascota (AF-15):** la casilla de "Cuidados de salud" es una
   píldora como las opciones y conserva su ícono de casilla. Se quitó
   `FONDOS.contenedor` y el ícono de orden de `iconosPanel.ts`, que ya nadie
   usaba.
10. **Accesibilidad:** la prueba de `fontSize` ahora acepta cualquier tamaño
    de `TAMANOS_TEXTO`; un número menor a 14 escrito directo sigue fallando
    (se comprobó con un archivo temporal con `fontSize: 12`).
11. **Modal de cerrar sesión (AF-17):** los 2 botones van uno encima del
    otro ("Cancelar" arriba, "Cerrar sesión" abajo), para que quepan en
    pantallas angostas. En el albergue, la tarjeta se dibuja dentro del mismo
    `Modal` del menú (`TarjetaCerrarSesion`), porque iOS no deja abrir un
    segundo modal mientras el primero se cierra. La lógica está en
    `respuestaCerrarSesion.ts` (función pura, con las 2 pruebas de CA-14 y
    CA-15). El archivo no se llama `confirmarCerrarSesion.ts` porque en
    Windows chocaba con `ConfirmarCerrarSesion.tsx` (solo cambia la
    mayúscula). La guarda `GuardaDeGrupo` (rol equivocado) no lleva modal:
    AF-17 solo habla de Mi perfil y del menú del albergue.
12. **Mis solicitudes (AF-18):** con lista, el subtítulo va dentro; en
    cargando, vacía, error o sin permiso no hay lista, así que el subtítulo
    se queda fijo debajo del título.
13. **Match (AF-20):** el "←" va a la izquierda de la huella, dentro de
    `EncabezadoGarritas` (prop `alRegresar`). "¡Solicitud enviada!" usa el
    mismo encabezado sin el "←". AF-20 ajusta el "no hay ←" de F-06 MS-8
    solo en Match.
14. **Acceso (AF-21):** "Crea tu cuenta" no tenía `KeyboardAvoidingView`,
    así que se le aplicó lo mismo, como pide §4.9. El ancho del logo (240)
    pasó a `tema.ts` (`ANCHO_LOGO`) para que Selección de Rol y "Ingresa a
    tu cuenta" usen el mismo.
15. **Sin solicitudes (AF-22):** `EstadoPantalla` tiene una opción nueva,
    `ajustado`, para no ocupar todo el espacio y poder centrarse junto con el
    bloque del animal.

## Pendientes

- **T-10 (autora):** probar en el celular y correr `npm run datos:prueba`.
- **P-01 de F-13:** Paulina lee AF-1 a AF-6 antes de fusionar.
- **Prueba en iPhone y Android:** revisar el modal de cerrar sesión (las dos
  formas de cancelar) y el teclado en "Ingresa a tu cuenta" y "Crea tu cuenta".
