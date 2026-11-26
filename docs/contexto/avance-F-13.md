# Avance F-13 · Ajustes de diseño, ronda 3

- **Spec:** `specs/features/F-13-ajustes-diseno-3.md` (v1.1 Aprobada), con
  `03-modelo-datos` v1.9, F-03 v1.4 y F-07 v1.3.
- **Rama:** `style/F-13-ajustes-diseno-3`, creada desde `main` en `24cbd26`
  (PR #49, specs de F-13).
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
| T-10 | Prueba en el celular y `npm run datos:prueba` | — | Pendiente (autora) |

**Verificaciones antes del último push:** typecheck, lint y test en verde
(39 suites, 428 pruebas).

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
4. **Descubrir (AF-5):** las estrellitas son `star-four-points-outline` y la
   del % es `star-four-points` (✦), en azul marino. El texto del % sigue
   siendo "92 % compatible" (con espacio, de F-03); no se cambió.
5. **Hogar con comas (AF-12):** se usaron los mismos textos de hoy (PS-9):
   "Casa, tiene experiencia". El ejemplo de la spec ("Casa, menos de 4 hrs,
   ya ha tenido mascotas") agrega el tiempo solo y un texto que no existe;
   no se inventó. **Pendiente de confirmar.**
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

## Pendientes

- **T-10 (autora):** probar en el celular y correr `npm run datos:prueba`.
- **P-01 de F-13:** Paulina lee AF-1 a AF-6 antes de fusionar.
- **Decisión 5:** confirmar el texto del hogar en la tarjeta.
