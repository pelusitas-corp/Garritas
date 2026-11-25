/**
 * Pre-aprobar, rechazar y leer el contacto (spec F-08 T-3: RF-05, RF-21,
 * RF-22, RF-12; RN-01, RN-03, RN-07; PA-2).
 *
 * Es el ÚNICO lugar que escribe en `solicitudes` y en `animales.estado`
 * desde el albergue, y el único que lee `privado/contacto` para el albergue
 * (RN-07). F-06 crea solicitudes en su propio archivo. Las pantallas no
 * llaman a Firestore: usan los hooks de `src/albergue/`.
 *
 * Analogía: la transacción (`runTransaction`) es la ventanilla que revisa y
 * sella en un solo movimiento. Lee el expediente y la ficha del animal, y si
 * todo sigue igual, sella los dos juntos. Si otro teléfono selló primero,
 * Firestore repite la revisión y esta vez ve que "ya fue atendida".
 *
 * - Cada operación espera 10 s como máximo (`conTiempoLimite`). Si no
 *   responde, es error de conexión (A5). Los 10 s no cancelan la
 *   transacción: si la red vuelve justo después, Firestore podría terminar
 *   de guardar (aceptado para el MVP, igual que F-02 AL-8).
 * - Las lecturas preguntan siempre al servidor (`getDocFromServer`), nunca a
 *   la copia del teléfono (F-07 PS-6).
 */
import { FirebaseError } from 'firebase/app';
import { doc, getDocFromServer, runTransaction, serverTimestamp } from 'firebase/firestore';

import { decidirPreAprobacion, decidirRechazo } from '../albergue/solicitud/decision';
import type {
  LecturaContacto,
  LecturaSolicitud,
  ResultadoDecision,
} from '../albergue/solicitud/decision';
import { COLECCIONES, ESTADO_ANIMAL, ESTADO_SOLICITUD, ID_CONTACTO } from '../compartido/modelo';
import type { Animal, Solicitud } from '../compartido/modelo';
import { ESPERA_ESCRITURA_MS, conTiempoLimite } from './acceso';
import type { LecturaFallida } from './animales';
import { db } from './config';
import { ESPERA_GUARDAR_MS } from './cuestionario';

/** Lo que decide la transacción (sin conexión lo pone `conResultado`). */
type Decidida = Exclude<ResultadoDecision, 'sin-conexion'>;

/** Recibe el error de una lectura. Devuelve `sin-permiso` si las reglas la rechazaron; si no, `sin-conexion`. */
function lecturaFallida(error: unknown): LecturaFallida {
  return error instanceof FirebaseError && error.code === 'permission-denied'
    ? { estado: 'sin-permiso' }
    : { estado: 'sin-conexion' };
}

/** Referencia a `solicitudes/{solicitudId}`. */
function referenciaSolicitud(solicitudId: string) {
  return doc(db, COLECCIONES.solicitudes, solicitudId);
}

// ----- Lecturas del Detalle -----

/**
 * Detalle de Solicitud: lee `solicitudes/{solicitudId}` del servidor.
 * Recibe el `solicitudId` de la ruta. Devuelve `ok` con la solicitud,
 * `no-existe`, `sin-conexion` o `sin-permiso` (G-11: las reglas rechazan la
 * de otro albergue). Quién es el dueño lo revisa `decidirPantallaDetalle`.
 */
export async function leerSolicitud(solicitudId: string): Promise<LecturaSolicitud> {
  try {
    const instantanea = await conTiempoLimite(
      getDocFromServer(referenciaSolicitud(solicitudId)),
      ESPERA_GUARDAR_MS,
    );
    const datos = instantanea.data();
    return datos
      ? { estado: 'ok', solicitud: { ...(datos as Solicitud), id: instantanea.id } }
      : { estado: 'no-existe' };
  } catch (error) {
    return lecturaFallida(error);
  }
}

/**
 * RF-12: lee `solicitudes/{solicitudId}/privado/contacto` del servidor. Solo
 * se llama con la solicitud "Pre-aprobada" (A4): las reglas lo niegan si no.
 * Recibe el `solicitudId`. Devuelve `ok` con `{ telefono, correo }`,
 * `no-existe`, `sin-conexion` o `sin-permiso`.
 */
export async function leerContacto(solicitudId: string): Promise<LecturaContacto> {
  try {
    const instantanea = await conTiempoLimite(
      getDocFromServer(
        doc(db, COLECCIONES.solicitudes, solicitudId, COLECCIONES.privado, ID_CONTACTO),
      ),
      ESPERA_GUARDAR_MS,
    );
    const datos = instantanea.data();
    return datos
      ? {
          estado: 'ok',
          contacto: { telefono: String(datos.telefono), correo: String(datos.correo) },
        }
      : { estado: 'no-existe' };
  } catch (error) {
    return lecturaFallida(error);
  }
}

// ----- Decisiones con transacción (PA-2) -----

/**
 * Recibe el trabajo de una transacción. Lo espera 10 s como máximo.
 * Devuelve lo que decidió la transacción, `sin-permiso` si las reglas la
 * rechazaron (A7) o `sin-conexion` si no respondió a tiempo o falló la red (A5).
 */
async function conResultado(trabajo: () => Promise<Decidida>): Promise<ResultadoDecision> {
  try {
    return await conTiempoLimite(trabajo(), ESPERA_ESCRITURA_MS);
  } catch (error) {
    return error instanceof FirebaseError && error.code === 'permission-denied'
      ? 'sin-permiso'
      : 'sin-conexion';
  }
}

/**
 * RF-05 y RF-22 (RN-01): en UNA transacción,
 * 1. lee la solicitud; si no existe o ya no está "Pendiente", termina sin
 *    leer el animal ni escribir (`sin-permiso` o `ya-atendida`);
 * 2. lee el animal de la solicitud;
 * 3. `decidirPreAprobacion` decide. Solo con `ok` escribe, juntos: la
 *    solicitud a "Pre-aprobada" (con `actualizadaEn` = hora del servidor) y
 *    el animal a "En pre-adopción". Si no, termina sin escribir nada.
 */
function transaccionPreAprobar(solicitudId: string): Promise<Decidida> {
  return runTransaction(db, async (transaccion) => {
    const refSolicitud = referenciaSolicitud(solicitudId);
    const solicitud = (await transaccion.get(refSolicitud)).data() as Solicitud | undefined;
    if (!solicitud || solicitud.estado !== ESTADO_SOLICITUD.pendiente) {
      return decidirPreAprobacion(solicitud ?? null, null);
    }
    const refAnimal = doc(db, COLECCIONES.animales, solicitud.animalId);
    const animal = (await transaccion.get(refAnimal)).data() as Animal | undefined;
    const decision = decidirPreAprobacion(solicitud, animal ?? null);
    if (decision === 'ok') {
      transaccion.update(refSolicitud, {
        estado: ESTADO_SOLICITUD.preAprobada,
        actualizadaEn: serverTimestamp(),
      });
      transaccion.update(refAnimal, { estado: ESTADO_ANIMAL.enPreAdopcion });
    }
    return decision;
  });
}

/**
 * RF-21: en una transacción lee la solicitud; con `decidirRechazo` = `ok`,
 * la cambia a "Rechazada" (con `actualizadaEn`). El animal no se toca.
 */
function transaccionRechazar(solicitudId: string): Promise<Decidida> {
  return runTransaction(db, async (transaccion) => {
    const refSolicitud = referenciaSolicitud(solicitudId);
    const solicitud = (await transaccion.get(refSolicitud)).data() as Solicitud | undefined;
    const decision = decidirRechazo(solicitud ?? null);
    if (decision === 'ok') {
      transaccion.update(refSolicitud, {
        estado: ESTADO_SOLICITUD.rechazada,
        actualizadaEn: serverTimestamp(),
      });
    }
    return decision;
  });
}

/**
 * "Pre-aprobar" (RF-05, RF-22). Recibe el `solicitudId`. Devuelve `ok`,
 * `ya-atendida`, `preadopcion-en-curso`, `sin-conexion` o `sin-permiso`.
 */
export function preAprobarSolicitud(solicitudId: string): Promise<ResultadoDecision> {
  return conResultado(() => transaccionPreAprobar(solicitudId));
}

/**
 * "Rechazar" (RF-21). Recibe el `solicitudId`. Devuelve `ok`,
 * `ya-atendida`, `sin-conexion` o `sin-permiso`.
 */
export function rechazarSolicitud(solicitudId: string): Promise<ResultadoDecision> {
  return conResultado(() => transaccionRechazar(solicitudId));
}
