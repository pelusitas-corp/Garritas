/**
 * Lecturas de animales y fotos para Descubrir y el Detalle (spec F-03 T-2:
 * RF-10, RF-28, RNF-02; 03-modelo-datos §4.3, §4.4 y §7.1).
 *
 * Este archivo SOLO LEE. Quien escribe en `animales` y `fotos` es
 * `altaAnimal.ts` (F-02). Las pantallas no llaman a Firestore: usan los
 * hooks de `src/adoptante/descubrir/`, que llaman a estas funciones.
 *
 * Analogía: es la ventanilla de consulta del archivero. Entrega copias de
 * las fichas, pero no deja escribir en ellas.
 *
 * RN-08: sin conexión, Firestore puede quedarse esperando. Cada lectura usa
 * `conTiempoLimite` (de F-01) con `ESPERA_GUARDAR_MS` (10 s, de F-04); si no
 * responde a tiempo, se trata como error de conexión.
 */
import { FirebaseError } from 'firebase/app';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';

import { COLECCIONES, ESTADO_ANIMAL } from '../compartido/modelo';
import type { Animal, Foto } from '../compartido/modelo';
import { conTiempoLimite } from './acceso';
import { db } from './config';
import { ESPERA_GUARDAR_MS } from './cuestionario';

/** Ficha del animal con el ID de su documento (el `animalId` de las rutas). */
export type AnimalConId = Animal & { id: string };

/** Lectura que falló: sin internet o a tiempo agotado, o rechazada por las reglas (RNF-02). */
export type LecturaFallida = { estado: 'sin-conexion' } | { estado: 'sin-permiso' };

export type LecturaAnimales = { estado: 'ok'; animales: AnimalConId[] } | LecturaFallida;

export type LecturaAnimal =
  { estado: 'ok'; animal: AnimalConId } | { estado: 'no-existe' } | LecturaFallida;

export type LecturaFotos = { estado: 'ok'; fotos: Foto[] } | LecturaFallida;

/** Recibe el error de una lectura. Devuelve `sin-permiso` si las reglas la rechazaron; si no, `sin-conexion`. */
function lecturaFallida(error: unknown): LecturaFallida {
  return error instanceof FirebaseError && error.code === 'permission-denied'
    ? { estado: 'sin-permiso' }
    : { estado: 'sin-conexion' };
}

/**
 * Recibe el ID y los datos de un documento de `animales`. Devuelve la ficha
 * con su ID. Los campos los escribe F-02 completos (§4.3); el estado se
 * vuelve a revisar en `mazo.ts` y `detalle.ts`.
 */
function aAnimal(id: string, datos: DocumentData): AnimalConId {
  return { ...(datos as Animal), id };
}

/**
 * Recibe una lista de fotos. Devuelve una copia ordenada por `orden`
 * (la foto 0 va primero, RN-07).
 */
export function ordenarFotos(fotos: readonly Foto[]): Foto[] {
  return [...fotos].sort((a, b) => a.orden - b.orden);
}

/**
 * RF-10: lee `animales` donde `estado == 'Disponible'` (la consulta de 03 §7.1).
 * No recibe nada. Devuelve `ok` con los animales, `sin-conexion` o `sin-permiso`.
 */
export async function leerAnimalesDisponibles(): Promise<LecturaAnimales> {
  try {
    const consulta = query(
      collection(db, COLECCIONES.animales),
      where('estado', '==', ESTADO_ANIMAL.disponible),
    );
    const instantanea = await conTiempoLimite(getDocs(consulta), ESPERA_GUARDAR_MS);
    return {
      estado: 'ok',
      animales: instantanea.docs.map((documento) => aAnimal(documento.id, documento.data())),
    };
  } catch (error) {
    return lecturaFallida(error);
  }
}

/**
 * RF-28: lee `animales/{animalId}`. Recibe el `animalId` de la ruta.
 * Devuelve `ok` con la ficha, `no-existe`, `sin-conexion` o `sin-permiso`.
 * No revisa el estado: eso lo decide `decidirDetalle` (G-8).
 */
export async function leerAnimal(animalId: string): Promise<LecturaAnimal> {
  try {
    const instantanea = await conTiempoLimite(
      getDoc(doc(db, COLECCIONES.animales, animalId)),
      ESPERA_GUARDAR_MS,
    );
    const datos = instantanea.data();
    return datos
      ? { estado: 'ok', animal: aAnimal(instantanea.id, datos) }
      : { estado: 'no-existe' };
  } catch (error) {
    return lecturaFallida(error);
  }
}

/**
 * RN-07: lee `animales/{animalId}/fotos` (de 1 a 3, F-02). Recibe el `animalId`.
 * Devuelve `ok` con las fotos ordenadas por `orden`, `sin-conexion` o `sin-permiso`.
 */
export async function leerFotos(animalId: string): Promise<LecturaFotos> {
  try {
    const instantanea = await conTiempoLimite(
      getDocs(collection(db, COLECCIONES.animales, animalId, COLECCIONES.fotos)),
      ESPERA_GUARDAR_MS,
    );
    const fotos = instantanea.docs.map((documento): Foto => {
      const datos = documento.data();
      return { datos: String(datos.datos), orden: Number(datos.orden) };
    });
    return { estado: 'ok', fotos: ordenarFotos(fotos) };
  } catch (error) {
    return lecturaFallida(error);
  }
}
