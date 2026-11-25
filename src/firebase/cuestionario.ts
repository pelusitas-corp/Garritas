/**
 * Cuestionario del adoptante en Cloud Firestore: `cuestionarios/{uid}`
 * (spec F-04 §4 y §6; arquitectura §4 y §5; claves de F-05 §5, D-50).
 *
 * Analogía: si el borrador del teléfono es la libreta del bolsillo, este
 * archivo es la ventanilla que entrega una copia al archivero de la nube.
 * Las pantallas no llaman a Firestore directamente: usan estas funciones.
 *
 * Campos del documento: `respuestas` (p1 a p25), `completo`,
 * `perfilGarritas` (al terminar) y `actualizadoEn` (hora del servidor).
 */
import { FirebaseError } from 'firebase/app';
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';

import { filtrarRespuestasValidas } from '../adoptante/cuestionario/preguntas';
import type { LecturaRemota } from '../adoptante/cuestionario/recuperacion';
import type { PerfilGarritas, Respuestas } from '../matchmaking';
import { auth, db } from './config';

/** Nombre del campo "cuestionario completo" (P-02 de 02-navegacion; igual que sesion.ts). */
const CAMPO_COMPLETO = 'completo';

/**
 * Si al terminar Firestore no confirma en este tiempo, se considera que no
 * hay conexión (CA-09). Sin conexión, el SDK no falla: deja la escritura en
 * espera, por eso hace falta un límite. Detalle de implementación; la spec
 * solo pide mostrar el error de conexión.
 */
export const ESPERA_GUARDAR_MS = 10000;

/** Resultado de una lectura o escritura que la pantalla debe mostrar. */
export type ResultadoGuardado = 'ok' | 'sin-conexion' | 'sin-permiso';

/**
 * `uid` del adoptante con sesión, o `null` si no hay sesión. Las guardas ya
 * aseguran la sesión antes de abrir estas pantallas (G-1).
 */
export function uidDelAdoptante(): string | null {
  return auth.currentUser ? auth.currentUser.uid : null;
}

function referencia(uid: string) {
  return doc(db, 'cuestionarios', uid);
}

/** Distingue "las reglas lo rechazaron" (RNF-02) de cualquier otro error. */
function esSinPermiso(error: unknown): boolean {
  return error instanceof FirebaseError && error.code === 'permission-denied';
}

/**
 * Lee `cuestionarios/{uid}`. Recibe el `uid`.
 * Devuelve `no-existe`, `existe` (respuestas válidas, `completo` y la hora
 * en milisegundos), `sin-conexion`, o `sin-permiso` si las reglas lo rechazan.
 */
export async function leerCuestionario(
  uid: string,
): Promise<LecturaRemota | { estado: 'sin-permiso' }> {
  try {
    const instantanea = await getDoc(referencia(uid));
    if (!instantanea.exists()) {
      return { estado: 'no-existe' };
    }
    const hora: unknown = instantanea.get('actualizadoEn', { serverTimestamps: 'estimate' });
    return {
      estado: 'existe',
      respuestas: filtrarRespuestasValidas(instantanea.get('respuestas')),
      completo: instantanea.get(CAMPO_COMPLETO) === true,
      actualizadoEn: hora instanceof Timestamp ? hora.toMillis() : null,
    };
  } catch (error) {
    return esSinPermiso(error) ? { estado: 'sin-permiso' } : { estado: 'sin-conexion' };
  }
}

/**
 * RN-08: la primera vez crea el documento con respuestas vacías y
 * `completo: false`. Con `merge` nunca borra algo que ya existiera.
 */
export function crearCuestionario(uid: string): Promise<void> {
  return setDoc(
    referencia(uid),
    { respuestas: {}, [CAMPO_COMPLETO]: false, actualizadoEn: serverTimestamp() },
    { merge: true },
  );
}

/**
 * Guarda las respuestas de un toque (RF-02, RF-16). Reemplaza el mapa
 * `respuestas` completo, así se borran las que dejaron de aplicar (RN-04).
 * Sin conexión, Firestore la deja en espera y la sube al volver la red:
 * la pantalla NO espera esta promesa para pasar a la siguiente pregunta.
 */
export function guardarRespuestas(uid: string, respuestas: Respuestas): Promise<void> {
  return setDoc(
    referencia(uid),
    { respuestas, [CAMPO_COMPLETO]: false, actualizadoEn: serverTimestamp() },
    { mergeFields: ['respuestas', CAMPO_COMPLETO, 'actualizadoEn'] },
  );
}

/** Espera la promesa o, si tarda más de `ms`, responde `'tiempo'`. */
function conLimite<T>(promesa: Promise<T>, ms: number): Promise<T | 'tiempo'> {
  return new Promise((resolver, rechazar) => {
    const reloj = setTimeout(() => resolver('tiempo'), ms);
    promesa.then(
      (valor) => {
        clearTimeout(reloj);
        resolver(valor);
      },
      (error: unknown) => {
        clearTimeout(reloj);
        rechazar(error);
      },
    );
  });
}

/**
 * "Ver mi perfil Garritas" (RF-02, RF-19): guarda `completo: true` y el
 * perfil. Esta sí espera la confirmación de Firestore, porque las guardas
 * leen `completo` del servidor.
 * Devuelve `ok`, `sin-conexion` (CA-09) o `sin-permiso` (RNF-02).
 */
export async function completarCuestionario(
  uid: string,
  respuestas: Respuestas,
  perfilGarritas: PerfilGarritas,
): Promise<ResultadoGuardado> {
  try {
    const resultado = await conLimite(
      setDoc(referencia(uid), {
        respuestas,
        [CAMPO_COMPLETO]: true,
        perfilGarritas,
        actualizadoEn: serverTimestamp(),
      }),
      ESPERA_GUARDAR_MS,
    );
    return resultado === 'tiempo' ? 'sin-conexion' : 'ok';
  } catch (error) {
    return esSinPermiso(error) ? 'sin-permiso' : 'sin-conexion';
  }
}
