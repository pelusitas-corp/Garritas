/**
 * Borrador del cuestionario en el teléfono (spec F-04 §4 y RN-07; RF-16;
 * arquitectura §4).
 *
 * Analogía: es una libreta en el bolsillo. Cada toque se anota aquí al
 * momento, aunque no haya internet. Si la app se cierra, al volver se lee
 * la libreta. Firestore es la copia "en la nube" (src/firebase/cuestionario.ts).
 *
 * Usa AsyncStorage, el almacenamiento sencillo del teléfono que ya usa
 * Firebase Auth para guardar la sesión. Hay una entrada por adoptante
 * (`uid`), así dos cuentas en el mismo teléfono no se mezclan.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Respuestas } from '../../matchmaking';
import { filtrarRespuestasValidas } from './preguntas';
import type { AvanceGuardado } from './recuperacion';

/** Nombre de la entrada del adoptante en AsyncStorage. */
export function claveBorrador(uid: string): string {
  return `garritas/cuestionario/${uid}`;
}

/**
 * Lee el borrador del adoptante. Devuelve `null` si no hay, o si lo que hay
 * no se puede leer (en ese caso se trata como "sin avance", RF-16).
 */
export async function leerBorrador(uid: string): Promise<AvanceGuardado | null> {
  try {
    const texto = await AsyncStorage.getItem(claveBorrador(uid));
    if (!texto) {
      return null;
    }
    const datos: unknown = JSON.parse(texto);
    if (typeof datos !== 'object' || datos === null) {
      return null;
    }
    if (!('actualizadoEn' in datos) || typeof datos.actualizadoEn !== 'number') {
      return null;
    }
    const respuestas = 'respuestas' in datos ? datos.respuestas : undefined;
    return {
      respuestas: filtrarRespuestasValidas(respuestas),
      actualizadoEn: datos.actualizadoEn,
    };
  } catch {
    return null;
  }
}

/**
 * Guarda las respuestas con la hora del teléfono. Recibe el `uid` y las
 * respuestas ya limpias (avance.ts). No devuelve nada.
 */
export async function guardarBorrador(uid: string, respuestas: Respuestas): Promise<void> {
  const avance: AvanceGuardado = { respuestas, actualizadoEn: Date.now() };
  await AsyncStorage.setItem(claveBorrador(uid), JSON.stringify(avance));
}

/** Borra el borrador cuando el cuestionario queda completo (§6, paso 6). */
export async function borrarBorrador(uid: string): Promise<void> {
  await AsyncStorage.removeItem(claveBorrador(uid));
}
