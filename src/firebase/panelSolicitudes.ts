/**
 * Lecturas del panel de solicitudes del albergue (spec F-07 T-3: RF-04,
 * RNF-02; 03-modelo-datos §7.1; PS-6 y PS-12).
 *
 * Este archivo SOLO LEE, y es el único lugar que lee las solicitudes del
 * albergue (RN-04). F-06 las escribe en su propio archivo. Las pantallas no
 * llaman a Firestore: usan los hooks de `src/albergue/panel/`.
 *
 * Analogía: es la ventanilla del archivero donde el albergue pide copias
 * de SUS expedientes. Solo entrega los que llevan su nombre (`albergueId`),
 * porque las reglas de seguridad no dejan pedir los de otro.
 *
 * - Las consultas son las de 03 §7.1 y usan `getDocsFromServer`: siempre
 *   preguntan al servidor, nunca responden con la copia del teléfono. Así,
 *   sin conexión sale el error de CA-08 y al volver de F-08 se ve el estado
 *   nuevo (decisión del plan; se registra en PS-6 de la spec v1.1).
 * - Cada lectura espera 10 s como máximo (`conTiempoLimite`, F-01, con
 *   `ESPERA_GUARDAR_MS`, F-04). Si no responde, es error de conexión (A4).
 */
import { FirebaseError } from 'firebase/app';
import { collection, getDocsFromServer, query, where } from 'firebase/firestore';
import type { Query } from 'firebase/firestore';

import type { LecturaSolicitudes, SolicitudConId } from '../albergue/panel/panel';
import { COLECCIONES } from '../compartido/modelo';
import type { Animal, Solicitud } from '../compartido/modelo';
import { conTiempoLimite } from './acceso';
import type { AnimalConId, LecturaAnimales, LecturaFallida } from './animales';
import { auth, db } from './config';
import { ESPERA_GUARDAR_MS } from './cuestionario';
import { leerNombreUsuario } from './usuarios';
import type { LecturaNombre } from './usuarios';

/**
 * `uid` del albergue con sesión, o `null` si no hay sesión. Las guardas ya
 * aseguran la sesión y el rol antes de abrir el panel (G-1, G-3).
 */
export function uidDelAlbergue(): string | null {
  return auth.currentUser ? auth.currentUser.uid : null;
}

/**
 * Subtítulo de las dos pantallas ("Refugio Patitas", F-07 §3): reutiliza
 * `leerNombreUsuario` (F-04), que no tiene tiempo límite, y le pone los 10 s (A4).
 * Recibe el `uid` del albergue. Devuelve `ok` con el nombre, `sin-conexion` o `sin-permiso`.
 */
export function leerNombreDelAlbergue(uid: string): Promise<LecturaNombre> {
  return conTiempoLimite(leerNombreUsuario(uid), ESPERA_GUARDAR_MS).catch((): LecturaNombre => ({
    estado: 'sin-conexion',
  }));
}

/** Recibe el error de una lectura. Devuelve `sin-permiso` si las reglas la rechazaron; si no, `sin-conexion`. */
function lecturaFallida(error: unknown): LecturaFallida {
  return error instanceof FirebaseError && error.code === 'permission-denied'
    ? { estado: 'sin-permiso' }
    : { estado: 'sin-conexion' };
}

/**
 * Recibe una consulta. La pregunta al servidor con 10 s de espera.
 * Devuelve cada documento con su ID (`{ ...datos, id }`).
 */
async function leerDelServidor<T>(consulta: Query): Promise<(T & { id: string })[]> {
  const instantanea = await conTiempoLimite(getDocsFromServer(consulta), ESPERA_GUARDAR_MS);
  return instantanea.docs.map((documento) => ({ ...(documento.data() as T), id: documento.id }));
}

/**
 * CA-05: lee `animales` donde `albergueId == uid` (03 §7.1).
 * Recibe el `uid` del albergue. Devuelve `ok` con sus animales, `sin-conexion` o `sin-permiso`.
 */
export async function leerMisAnimales(uid: string): Promise<LecturaAnimales> {
  try {
    const consulta = query(collection(db, COLECCIONES.animales), where('albergueId', '==', uid));
    const animales: AnimalConId[] = await leerDelServidor<Animal>(consulta);
    return { estado: 'ok', animales };
  } catch (error) {
    return lecturaFallida(error);
  }
}

/**
 * CA-05 y M-3: lee `solicitudes` donde `albergueId == uid` para contar las
 * de cada animal (03 §7.1). Recibe el `uid` del albergue.
 * Devuelve `ok` con sus solicitudes, `sin-conexion` o `sin-permiso`.
 */
export async function leerSolicitudesDelAlbergue(uid: string): Promise<LecturaSolicitudes> {
  try {
    const consulta = query(collection(db, COLECCIONES.solicitudes), where('albergueId', '==', uid));
    const solicitudes: SolicitudConId[] = await leerDelServidor<Solicitud>(consulta);
    return { estado: 'ok', solicitudes };
  } catch (error) {
    return lecturaFallida(error);
  }
}

/**
 * RF-04: lee `solicitudes` donde `albergueId == uid` y `animalId == animalId`
 * (03 §7.1). Son dos filtros de igualdad: no necesitan índice compuesto
 * (RC-02). El orden por % se hace en el teléfono (RN-03).
 * Recibe el `uid` del albergue y el `animalId` de la ruta.
 * Devuelve `ok` con las solicitudes del animal, `sin-conexion` o `sin-permiso`.
 */
export async function leerSolicitudesDeAnimal(
  uid: string,
  animalId: string,
): Promise<LecturaSolicitudes> {
  try {
    const consulta = query(
      collection(db, COLECCIONES.solicitudes),
      where('albergueId', '==', uid),
      where('animalId', '==', animalId),
    );
    const solicitudes: SolicitudConId[] = await leerDelServidor<Solicitud>(consulta);
    return { estado: 'ok', solicitudes };
  } catch (error) {
    return lecturaFallida(error);
  }
}
