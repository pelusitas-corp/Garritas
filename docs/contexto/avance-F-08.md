# Avance de F-08 · Pre-aprobar, rechazar y revelar el contacto

Nota para retomar el trabajo si se corta la sesión. Se actualiza en cada commit.

- **Spec:** `specs/features/F-08-preaprobar-rechazar.md` v1.0 (Aprobada) · `02-navegacion` v1.2 · `03-modelo-datos` v1.6 · `F-07` v1.1
- **RF:** RF-05, RF-21, RF-22, RF-12 · RC-05 · RNF-02
- **Rama:** `feature/F-08-preaprobar-rechazar` (desde `main` en `622fdb3`)
- **Último commit:** T-5
- **PR:** "feat(decision): pre-aprobar, rechazar y revelar el contacto del adoptante (F-08, RF-05, RF-21, RF-22, RF-12)". No se fusiona. Enlace: https://github.com/pelusitas-corp/garritas/pull/new/feature/F-08-preaprobar-rechazar

## Tareas (§10)
| # | Tarea | Estado |
|---|---|---|
| T-1 | Mensajes `SOLICITUD_YA_ATENDIDA`, `PREADOPCION_EN_CURSO`, `CONTACTO_OCULTO`; `src/albergue/solicitud/textos.ts`; texto final de la lista en `panel/textos.ts` | ✅ Hecha (`7d71bdd`) |
| T-2 | `src/albergue/solicitud/decision.ts` y `tests/albergue/decision.test.ts` | ✅ Hecha (`9b92642`) (24 pruebas) |
| T-3 | `src/firebase/decisionSolicitud.ts` (`runTransaction`, 10 s) y `tests/firebase/decisionSolicitud.test.ts` | ✅ Hecha (`5113425`) (16 pruebas; transacción con 10 s; RN-01 no lee el animal si ya fue atendida) |
| T-4 | Reglas de §9 y casos de CA-13 | ✅ Hecha (`2d7fc38`) (sin publicar; se prueba el viernes) |
| T-5 | `ConfirmarDecision` y `BotonesDecision` | ✅ Hecha (Modal propio; `iconosDecision.ts`; texto de los botones del Detalle en negrita 16 café, igual que la tarjeta) |
| T-6 | Botones y píldoras en la tarjeta de F-07; volver a leer sin indicador | Pendiente |
| T-7 | `useDetalleSolicitud` y pantalla "Detalle de Solicitud" | Pendiente |
| T-8 | Prueba en el celular, publicar reglas y reiniciar datos (Jennifer) | Pendiente |

## Decisiones aceptadas en el plan (Jennifer, 25/11/2026)
1. **Medidas de Figma (solo colores de `tema.ts`):**
   - Botones de la tarjeta: una fila, cada uno de la mitad del ancho, alto 56, píldora, negrita 16 café. "✕ Rechazar" en crema con el ícono `close`; "✓ Pre-aprobar" en menta con el ícono `check`. 12 entre ellos y 12 con los datos de arriba.
   - Píldoras de la tarjeta: "✓ Pre-aprobada" en menta y "✕ Rechazada" en crema, alto 32, negrita 13.
   - Detalle: "Solicitud de …" negrita 24. En la misma línea, "Para adoptar a …" negrita 17 a la izquierda y la píldora del % a la derecha (menta, negrita 16, alto 44). Ya decidida, la misma píldora dice "Pre-aprobada" (menta) o "Rechazada" (crema).
   - Tarjeta del adoptante: azul grisáceo, radio 28, círculo de iniciales; nombre negrita 22; mensaje de RF-12 o contacto en negrita 13; "Contacto desbloqueado" regular 12.
   - "Su hogar y sus cuidados": título negrita 20; cada línea con ícono de 22 (casa, reloj, huella), y etiqueta y valor juntos en negrita 15 ("Vive en: Departamento").
   - Botones del Detalle: uno encima del otro, a lo ancho, alto 60: primero "Rechazar" (azul grisáceo, sin ícono) y debajo "✓ Pre-aprobar" (menta); 12 entre ellos. Arriba, "Al pre-aprobar, podrás coordinar una visita." regular 13 centrado.
   - Confirmación: tarjeta crema (radio 24, relleno 24), pregunta negrita 18 centrada; "Cancelar" azul grisáceo; "Pre-aprobar" menta; "Rechazar" azul marino con texto crema. Fondo oscuro con `azulMarino` y opacidad (sin colores nuevos).
2. **Falla del contacto** *(pasar a la spec v1.1)*: al **abrir** el Detalle, error en lugar de toda la pantalla (§6). **Después de pre-aprobar** dentro del Detalle, "Error de conexión, verifica tu conexión a internet" solo en el lugar del contacto, con la píldora en "Pre-aprobada"; se vuelve a leer al regresar a la pantalla. Si `privado/contacto` no existe, "No tienes permiso para ver esta sección" en su lugar.
3. **Los 10 s no cancelan la transacción** (igual que F-02 AL-8, aceptado para el MVP): si la red vuelve justo después del error, Firestore podría terminar de guardar aunque se mostró "Error de conexión". Al volver a abrir la pantalla se ve el estado real; un segundo intento daría "Esta solicitud ya fue atendida".
4. **Texto final de la lista** *(pasar a la spec v1.1)*: "Al pre-aprobar, podrás coordinar una visita." al final de la lista **solo si hay al menos una "Pendiente"**.
5. **Volver a leer sin indicador** *(pasar a la spec v1.1)*: después de decidir desde la tarjeta, la lista vuelve a leer **sin** el indicador de pantalla completa (se queda la lista hasta que llegan los datos nuevos). El mensaje de cada tarjeta se guarda por `solicitudId` y sigue visible hasta volver a presionar o salir de la pantalla.
6. No se tocan `specs/` ni nada fuera de la spec. Sin dependencias nuevas.

## Casos de CA-13 para el emulador (viernes 27, PO-31)
Datos: `usuarios/refugio-patitas` y `usuarios/otro-albergue` (`rol: 'albergue'`), `usuarios/adoptante-a` y `usuarios/adoptante-b` (`rol: 'adoptante'`), los animales y las solicitudes s1 a s6 de 03 §8 (Wini "Disponible", Rocky "En pre-adopción"), cada solicitud con su `privado/contacto`. "Pre-aprobar s1" = una transacción que cambia `s1` a `{ estado: 'Pre-aprobada', actualizadaEn: serverTimestamp() }` y `animales/wini` a `{ estado: 'En pre-adopción' }`.

| # | Caso | Esperado |
|---|---|---|
| 1 | Refugio Patitas pre-aprueba s1 junto con Wini a "En pre-adopción" (misma transacción) | ✅ Permitido |
| 2 | Refugio Patitas rechaza s2 (`estado: 'Rechazada'`, `actualizadaEn` del servidor) | ✅ Permitido |
| 3 | Refugio Patitas rechaza s5 aunque Rocky esté "En pre-adopción" | ✅ Permitido |
| 4 | Pre-aprobar s1 **sin** cambiar a Wini | ❌ Negado |
| 5 | Pre-aprobar s5 (Rocky ya "En pre-adopción") junto con Rocky | ❌ Negado |
| 6 | Cambiar s4 ("Pre-aprobada") o s6 ("Rechazada") a cualquier estado | ❌ Negado |
| 7 | Cambiar s1 de vuelta a "Pendiente" o a un estado que no existe | ❌ Negado |
| 8 | Cambiar `porcentaje`, `noApto` u otro campo de s1 (aunque cambie también `estado`) | ❌ Negado |
| 9 | Cambiar s1 con `actualizadaEn` que no es la hora del servidor | ❌ Negado |
| 10 | Otro albergue pre-aprueba o rechaza s1 | ❌ Negado |
| 11 | Adoptante A cambia el estado de su solicitud s1 | ❌ Negado |
| 12 | Sin sesión, cambia s1 | ❌ Negado |
| 13 | Refugio Patitas cambia en Wini algo distinto de `estado` (p. ej. `nombre`) | ❌ Negado |
| 14 | Refugio Patitas cambia Wini a un estado distinto de "En pre-adopción", o Rocky de "En pre-adopción" a "Disponible" | ❌ Negado |
| 15 | Otro albergue cambia Wini a "En pre-adopción" | ❌ Negado |
| 16 | Reintento de F-02 (A9): `set` completo de una ficha que ya existe | ❌ Negado (sigue igual que en F-02) |
| 17 | Refugio Patitas lee `solicitudes/s4/privado/contacto` ("Pre-aprobada") | ✅ Permitido |
| 18 | Refugio Patitas lee el contacto de s1 ("Pendiente") o de s6 ("Rechazada") | ❌ Negado |
| 19 | Adoptante A lee el contacto de s1 (suya, "Pendiente") | ✅ Permitido |
| 20 | Adoptante B lee el contacto de s1 (de A) · otro albergue lee el contacto de s4 · sin sesión | ❌ Negado |
| 21 | Cualquiera borra una solicitud, un animal o un contacto | ❌ Negado |
| 22 | Cualquiera escribe en `privado/contacto` | ❌ Negado (lo abre F-06 al crear) |

Límite conocido (PA-9): las reglas no ligan el cambio del animal a una solicitud concreta. Un albergue podría pasar su propio animal a "En pre-adopción" sin pre-aprobar nada (no hay forma de regresarlo). Se acepta para el MVP.

## Qué falta
- Todo lo de la tabla de arriba marcado como Pendiente.
