/**
 * Solicitudes del adoptante en Cloud Firestore (spec F-06 T-4: RF-11, RF-27,
 * RNF-02; RN-03; MS-4, MS-6; 03-modelo-datos §4.5, §4.6 y §7.1).
 *
 * Es el ÚNICO lugar que crea solicitudes y que lee las del adoptante
 * (RN-03, F-07 PS-12). Las pantallas no llaman a Firestore: usan los hooks
 * de `src/adoptante/match/` y `src/adoptante/solicitudes/`.
 *
 * Analogía: enviar la solicitud es meter el expediente en el buzón del
 * albergue con el contacto en un sobre cerrado aparte. El `writeBatch` es la
 * bolsa que lleva los dos: o entran juntos, o no entra ninguno (MS-4).
 *
 * - Las lecturas preguntan siempre al servidor (`getDocFromServer`,
 *   `getDocsFromServer`), nunca a la copia del teléfono (MS-6).
 * - Cada lectura o escritura espera 10 s como máximo (`conTiempoLimite`).
 *   Si no responde, es error de conexión (A5). Los 10 s no cancelan el lote:
 *   si la red vuelve justo después, Firestore podría terminar de guardar
 *   (aceptado para el MVP, igual que F-02 AL-8). Un segundo intento lee del
 *   servidor y ve la solicitud con `SOLICITUD_YA_ENVIADA` (MS-1).
 */
import { FirebaseError } from 'firebase/app';
import {
  collection,
  doc,
  getDocFromServer,
  getDocsFromServer,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';

import type { CuentaAdoptante, SolicitudNueva } from '../adoptante/match/match';
import type { MiSolicitud } from '../adoptante/solicitudes/misSolicitudes';
import { COLECCIONES, ID_CONTACTO } from '../compartido/modelo';
import type { Contacto, Solicitud } from '../compartido/modelo';
import { ESPERA_ESCRITURA_MS, conTiempoLimite } from './acceso';
import type { LecturaFallida } from './animales';
import { db } from './config';
import { ESPERA_GUARDAR_MS } from './cuestionario';

export type LecturaCuenta = { estado: 'ok'; cuenta: CuentaAdoptante } | LecturaFallida;

export type LecturaMisSolicitudes = { estado: 'ok'; solicitudes: MiSolicitud[] } | LecturaFallida;

export type ResultadoEnvio = { estado: 'ok'; solicitudId: string } | LecturaFallida;

/** Recibe un error. Devuelve `sin-permiso` si las reglas lo rechazaron (RNF-02); si no, `sin-conexion`. */
function resultadoFallido(error: unknown): LecturaFallida {
  return error instanceof FirebaseError && error.code === 'permission-denied'
    ? { estado: 'sin-permiso' }
    : { estado: 'sin-conexion' };
}

/** Recibe un valor cualquiera. Devuelve el texto, o vacío si no es texto. */
const texto = (valor: unknown): string => (typeof valor === 'string' ? valor : '');

/**
 * Flujo B, paso 4: lee `usuarios/{uid}` del servidor (nombre, teléfono y
 * correo, 03 §4.1). Recibe el `uid` del adoptante.
 * Devuelve `ok` con la cuenta, `sin-conexion`, o `sin-permiso` si las reglas
 * la rechazan o si el documento no existe (igual que G-4).
 */
export async function leerCuentaAdoptante(uid: string): Promise<LecturaCuenta> {
  try {
    const instantanea = await conTiempoLimite(
      getDocFromServer(doc(db, COLECCIONES.usuarios, uid)),
      ESPERA_GUARDAR_MS,
    );
    const datos = instantanea.data();
    if (!datos) {
      return { estado: 'sin-permiso' };
    }
    return {
      estado: 'ok',
      cuenta: {
        nombre: texto(datos.nombre),
        telefono: texto(datos.telefono),
        correo: texto(datos.correo),
      },
    };
  } catch (error) {
    return resultadoFallido(error);
  }
}

/**
 * RF-27 y MS-1: lee `solicitudes` donde `adoptanteId == uid` (la consulta de
 * 03 §7.1) del servidor. No ordena: eso lo hace `ordenarMisSolicitudes`.
 * Recibe el `uid` del adoptante. Devuelve `ok` con sus solicitudes (con su
 * `id`), `sin-conexion` o `sin-permiso`.
 */
export async function leerMisSolicitudes(uid: string): Promise<LecturaMisSolicitudes> {
  try {
    const consulta = query(
      collection(db, COLECCIONES.solicitudes),
      where('adoptanteId', '==', uid),
    );
    const instantanea = await conTiempoLimite(getDocsFromServer(consulta), ESPERA_GUARDAR_MS);
    return {
      estado: 'ok',
      solicitudes: instantanea.docs.map((documento) => ({
        ...(documento.data() as Solicitud),
        id: documento.id,
      })),
    };
  } catch (error) {
    return resultadoFallido(error);
  }
}

/**
 * Flujo B, paso 5 (RF-11, MS-4). Recibe la solicitud armada (`armarSolicitud`)
 * y el contacto. Genera el ID automático ANTES del lote y escribe, en un
 * solo `writeBatch`:
 * 1. `solicitudes/{solicitudId}` con `creadaEn` y `actualizadaEn` = hora del servidor;
 * 2. `solicitudes/{solicitudId}/privado/contacto` con `telefono` y `correo`.
 * Devuelve `ok` con el `solicitudId`, `sin-conexion` (A5, 10 s) o
 * `sin-permiso` (A6, las reglas lo rechazaron).
 */
export async function enviarSolicitud(
  solicitud: SolicitudNueva,
  contacto: Contacto,
): Promise<ResultadoEnvio> {
  try {
    const referencia = doc(collection(db, COLECCIONES.solicitudes));
    const lote = writeBatch(db);
    lote.set(referencia, {
      ...solicitud,
      creadaEn: serverTimestamp(),
      actualizadaEn: serverTimestamp(),
    });
    lote.set(doc(referencia, COLECCIONES.privado, ID_CONTACTO), {
      telefono: contacto.telefono,
      correo: contacto.correo,
    });
    await conTiempoLimite(lote.commit(), ESPERA_ESCRITURA_MS);
    return { estado: 'ok', solicitudId: referencia.id };
  } catch (error) {
    return resultadoFallido(error);
  }
}
