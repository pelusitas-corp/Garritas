/**
 * Publicar un animal: la ficha y sus fotos en una sola operación (F-02:
 * RF-01, RF-13, RF-14; RN-04, RN-06, RN-08; AL-8 y A9).
 *
 * Es el ÚNICO lugar que escribe en `animales` y `fotos` (RN-08). La
 * pantalla no llama a Firestore: usa `useAltaAnimal`, que llama a este
 * archivo. `src/firebase/animales.ts` es de F-03 y solo lee (AL-11).
 *
 * Analogía: el `writeBatch` es un sobre cerrado. La ficha y las fotos van
 * juntas; Firestore acepta el sobre completo o lo rechaza completo, nunca
 * guarda la mitad (RN-04).
 */
import { FirebaseError } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

import type { FotoParaGuardar } from '../albergue/alta/fotos';
import type { DatosAnimal } from '../albergue/alta/validacion';
import { COLECCIONES, ESTADO_ANIMAL } from '../compartido/modelo';
import { ESPERA_ESCRITURA_MS, conTiempoLimite } from './acceso';
import { auth, db } from './config';

/** Resultado de publicar (AL-8): la pantalla lo traduce al mensaje. */
export type ResultadoPublicar = 'ok' | 'sin-conexion' | 'sin-permiso';

/** Lo que se publica: los datos revisados, las fotos y la miniatura de la foto 0. */
export interface AnimalParaPublicar extends DatosAnimal {
  fotos: FotoParaGuardar[];
  miniatura: string;
}

/**
 * No recibe nada. Devuelve un ID nuevo para `animales/{id}`. Se genera en el
 * teléfono, sin internet, UNA vez por formulario (AL-8): si se reintenta,
 * se usa el mismo ID y no se duplica el animal (A9).
 */
export function nuevoIdAnimal(): string {
  return doc(collection(db, COLECCIONES.animales)).id;
}

/** Recibe el orden de la foto (0 a 2). Devuelve su ID fijo: `foto-0`, `foto-1`, `foto-2` (AL-13). */
export function idFoto(orden: number): string {
  return `foto-${orden}`;
}

/** Lee el nombre del albergue para copiarlo en la ficha (RN-06). */
async function leerNombreAlbergue(uid: string): Promise<string> {
  const usuario = await getDoc(doc(db, COLECCIONES.usuarios, uid));
  const nombre: unknown = usuario.get('nombre');
  return typeof nombre === 'string' ? nombre : '';
}

/** Escribe la ficha y sus fotos en un solo `writeBatch` (RN-04). */
async function escribirAnimal(uid: string, id: string, animal: AnimalParaPublicar): Promise<void> {
  const nombreAlbergue = await leerNombreAlbergue(uid);
  const lote = writeBatch(db);
  const ficha = doc(db, COLECCIONES.animales, id);
  lote.set(ficha, {
    albergueId: uid,
    nombreAlbergue,
    nombre: animal.nombre,
    especie: animal.especie,
    edad: animal.edad,
    tamano: animal.tamano,
    vacunado: animal.vacunado,
    esterilizado: animal.esterilizado,
    perfilCompatibilidad: animal.perfilCompatibilidad,
    miniatura: animal.miniatura,
    estado: ESTADO_ANIMAL.disponible,
    creadoEn: serverTimestamp(),
  });
  animal.fotos.forEach((foto) => {
    lote.set(doc(ficha, COLECCIONES.fotos, idFoto(foto.orden)), {
      datos: foto.datos,
      orden: foto.orden,
    });
  });
  await lote.commit();
}

/**
 * A9: las reglas rechazaron porque la ficha YA existe. Si es de este
 * albergue, el primer intento sí llegó y cuenta como publicado. Se lee del
 * servidor (no de la copia del teléfono, que tiene la escritura pendiente).
 */
async function revisarReintento(uid: string, id: string): Promise<ResultadoPublicar> {
  try {
    const ficha = await conTiempoLimite(
      getDocFromServer(doc(db, COLECCIONES.animales, id)),
      ESPERA_ESCRITURA_MS,
    );
    return ficha.exists() && ficha.get('albergueId') === uid ? 'ok' : 'sin-permiso';
  } catch {
    return 'sin-conexion';
  }
}

/**
 * Publica el animal con estado "Disponible" (RF-01, RF-13, RF-14).
 * Recibe el ID del formulario (`nuevoIdAnimal`) y el animal ya validado.
 * Devuelve:
 * - `ok`: Firestore confirmó (o ya estaba publicado, A9);
 * - `sin-conexion`: no confirmó en 10 s, `unavailable` u otro error (AL-8);
 * - `sin-permiso`: las reglas lo rechazaron (A10, RNF-02).
 */
export async function publicarAnimal(
  id: string,
  animal: AnimalParaPublicar,
): Promise<ResultadoPublicar> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    return 'sin-permiso';
  }
  try {
    await conTiempoLimite(escribirAnimal(uid, id, animal), ESPERA_ESCRITURA_MS);
    return 'ok';
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return revisarReintento(uid, id);
    }
    return 'sin-conexion';
  }
}
