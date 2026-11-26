Hecha |Hecha |Hecha |Hecha |Hecha |Hecha |Hecha |# Avance F-12 · Ajustes de diseño, ronda 2 · Parte A

- **Spec:** `specs/features/F-12-ajustes-diseno-2.md` (v1.0 Aprobada), solo la
  Parte A (§4.1 a §4.11, T-1 a T-11). La corrección a 9 animales va aparte en
  el PR #45 y no cambia la Parte A.
- **Rama:** `style/F-12-ajustes-diseno-2`, creada desde `main` en `4cd8ccd`.
- **Tipo:** decisión del equipo; no está en el SRS. No cambia textos,
  mensajes, validaciones, rutas, `firestore.rules` ni datos de Firestore.
- **Fuera de esta rama:** la Parte B (T-12: `scripts/` y fotos), "Cancelar
  solicitud" (D-33) y abrir el detalle desde Mis solicitudes.

## Tareas

| # | Tarea | Estado |
|---|---|---|
| T-1 | `TAMANOS_TEXTO` y `FONDOS.contenedor` en `tema.ts`; prueba de `fontSize` mínimo | Hecha |
| T-2 | Subir a 14/16 todos los textos chicos | Hecha |
| T-3 | Selección de Rol y accesos centrados | Pendiente |
| T-4 | Perfil Garritas centrado | Pendiente |
| T-5 | Tarjeta de Descubrir más grande | Pendiente |
| T-6 | `BotonTexto` y "Cerrar sesión" sin píldora | Pendiente |
| T-7 | Mi perfil con tarjeta del nombre y sin rebote | Pendiente |
| T-8 | Miniatura de 112 en Mis solicitudes | Pendiente |
| T-9 | Solicitudes de un animal: encabezado, orden, vacía con logo y tarjeta pareja | Pendiente |
| T-10 | `enlaceTelefono` y Detalle de solicitud unificado | Pendiente |
| T-11 | Relleno de los contenedores de Nueva mascota | Pendiente |

**Último commit:** T-9 (ver `git log`).

**Pushes acordados:** después de T-4, T-8 y T-11, con typecheck, lint y test
en verde. Entre T-1 y T-2 la prueba de accesibilidad queda en rojo a
propósito (marca los textos que T-2 corrige), así que no hay push hasta T-2.

## Medidas "a confirmar" del plan (aprobadas por Jennifer el 25/11/2026)

1. Ingresa a tu cuenta: 24 entre los campos y los botones de abajo.
2. `BotonTexto`: ícono de 20.
3. Mi perfil: ícono de cuenta (`account-outline`) de 28 en la tarjeta del nombre.
4. Píldora chica de Descubrir y del Detalle (`Pildora.tsx`): alto de 26 a 30.
5. Píldora de estado de la tarjeta de solicitud (`TarjetaSolicitud.tsx`): alto de 32 a 36.
6. Detalle de solicitud: el mensaje de RF-12 (contacto oculto) en negrita 16.

## Respuestas de Jennifer al plan

1. **Nombre en el Detalle de solicitud:** se queda en el encabezado y en la
   tarjeta. Solo se quita "Vive en" de la tarjeta; queda en "Su hogar y sus
   cuidados" (AE-9; reemplaza lo que pedía F-08 PA-7).
2. **Etiquetas de las pestañas en 14:** si en el celular "Mis solicitudes" se
   corta, el margen horizontal de la pestaña baja de 8 a 4 y se actualiza su
   prueba (`tests/navegacion/estiloPestanas.test.ts`).
3. **`app/(adoptante)/match/` y `solicitud-enviada/`:** solo cambia el
   `fontSize` (13 → 14 y 14 → 16). Nada más en esos archivos.
4. **`MenuUsuario`:** el menú no flota sin fondo. Conserva su contenedor como
   tarjeta (fondo crema, radio 24, borde azul grisáceo de `BORDE`, sin
   sombra) y dentro va `BotonTexto` en lugar de la píldora azul marino.

## Pendientes

- **Prueba en el celular (Jennifer):** revisar si "Mis solicitudes" cabe en
  la barra de pestañas con el texto en 14 (respuesta 2).

## Notas por tarea

- **T-1:** `TAMANOS_TEXTO = { minimo: 14, dato: 16 }` y
  `FONDOS = { contenedor: 'rgba(161, 178, 208, 0.25)' }` van aparte de
  `COLORES`, así la prueba de "los 5 colores" no cambia.
  `tests/accesibilidad.test.ts` lee cada `.ts` y `.tsx` de `app/` y `src/` y
  revisa cada `fontSize:`: acepta un número o una constante conocida
  (`TAMANOS_TEXTO.minimo`, `TAMANOS_TEXTO.dato`, `MEDIDAS_BOTON.x.tamanoTexto`)
  y falla con archivo y línea si mide menos de 14 o si no sabe de dónde sale.
  Antes de T-2 marcaba los 20 textos de la lista del plan.
- **T-2:** los textos de apoyo y etiquetas suben a `TAMANOS_TEXTO.minimo` (14) y los
  datos a `TAMANOS_TEXTO.dato` (16): vivienda y tiempo solo del Detalle de solicitud,
  teléfono y correo, nombre del albergue en Mis solicitudes y en el Detalle del
  animal, resumen del hogar y estado de la tarjeta de solicitud, y el estado de
  Mis solicitudes. La píldora chica (`Pildora.tsx`) pasa de 26 a 30 de alto y la
  de estado de `TarjetaSolicitud` de 32 a 36. En `match/[animalId].tsx` (13 → 14)
  y `solicitud-enviada/[solicitudId].tsx` (14 → 16) solo cambió el número del
  `fontSize`, sin tocar los imports (respuesta 3). Las medidas propias de cada
  pantalla (28 del refugio, 18 del contacto…) llegan en T-9 y T-10.
- **T-3:** en Selección de Rol el logo y "Bienvenido a Garritas" van en un
  `View` con `flex: 1` y `justifyContent: 'center'`, así quedan a media altura
  entre el encabezado y los botones de rol, que siguen abajo. El logo perdió
  su `marginTop: 8` (lo centra el `flex`). En `FormularioAcceso` (lo usan
  Acceso de Adoptante y Acceso de Albergue) el `ScrollView` centra todo el
  formulario y los botones quedan a 24 de los campos (8 + el `gap` de 16).
- **T-4:** en Perfil Garritas se quitó el `space-between` que dejaba
  "Ver mis matches" pegado abajo. Ahora el contenido es un solo grupo con
  `justifyContent: 'center'` y `gap: 32`: el perfil y el botón quedan juntos a
  media pantalla. El botón sigue a lo ancho, con el margen de 24.
- **T-5:** en `TarjetaAnimal` se quitaron los dos espacios flexibles de F-11
  AD-7 y el alto escalado de la foto (270 en 390 de ancho). Ahora el arrastre
  y la tarjeta tienen `flex: 1` y la foto también (mínimo 120): la tarjeta
  crece con el espacio libre. Entre la tarjeta y los botones y entre los
  botones y la barra de pestañas hay 16 fijos (`gap` y `paddingBottom`), y
  Descubrir deja 16 entre el subtítulo y la tarjeta. El ancho sigue siendo
  el de la pantalla menos 2 × 24, y el gesto y los botones no cambian.
- **T-6:** nuevo `src/compartido/BotonTexto.tsx`, que recibe
  `{ texto, icono, alPresionar }` y dibuja un ícono de 20 y el texto en negrita
  16 café, sin fondo ni borde, con `minHeight: 44`. `EstadoPantalla` tiene la
  prop opcional `botonTexto` (además de `boton`, que sigue siendo píldora) para
  los estados vacía y sin permiso de Mi perfil. En Mi perfil, "Cerrar sesión"
  usa `BotonTexto` con el ícono `logout`. En `MenuUsuario` el menú conserva su
  contenedor como tarjeta (crema, radio 24, borde azul grisáceo de `BORDE`, sin
  sombra; respuesta 4) y dentro va `BotonTexto` con `ICONOS_PANEL.salir`. La
  "Cerrar sesión" de las guardas (`GuardaDeGrupo`) no cambia: AE-6 solo
  menciona Mi perfil y el menú del albergue.
- **T-7:** en Mi perfil, debajo del encabezado va la tarjeta del nombre
  (azul grisáceo, `RADIOS.tarjeta` = 24, relleno 20, ícono `account-outline` de
  28 y el nombre en negrita 24, centrados). 32 debajo, la tarjeta del perfil
  Garritas queda centrada con `flex: 1`, y abajo "Cerrar sesión" (T-6). El
  `ScrollView` lleva `alwaysBounceVertical={false}` (iOS) y
  `overScrollMode="never"` (Android): si todo cabe no se mueve, y en un
  celular chico se puede desplazar.
- **T-8:** en `TarjetaMiSolicitud` la miniatura pasa de 76 a **112** (radio 16
  igual) y el nombre del animal pierde `numberOfLines={1}`: si no cabe en una
  línea, sigue en la siguiente y no se corta. El nombre del albergue (16) y el
  estado (16) ya se subieron en T-2. Tocar la tarjeta sigue sin abrir nada.
- **T-9:** en Solicitudes de un animal el nombre del refugio pasa a 28 y
  "Un hogar para…" a 20 (como la lista, F-11 AD-11); "Mayor compatibilidad"
  pasa a negrita 16 y su ícono de ordenar (`sort-descending`) de 16 a 18.
  `EstadoPantalla` tiene la prop opcional `conLogo`, que dibuja el logo de 200
  de ancho (proporción 580 : 456) arriba del mensaje; la pantalla la usa solo
  en el estado vacía, con el mensaje de RF-04 en 18 que ya salía de
  `mensajes.ts`. En `TarjetaSolicitud` el relleno pasa de 16 a 20; las filas ya
  iban a 12 y las iniciales, el bloque nombre + hogar y el % ya estaban
  centrados en la fila (`alignItems: 'center'`). Los textos de la tarjeta se
  subieron en T-2 (hogar 16, "compatible" 14, estado 16).
