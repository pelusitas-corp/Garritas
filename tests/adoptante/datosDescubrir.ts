/**
 * Animales de prueba (03-modelo-datos §8.2) con la forma que devuelve
 * `src/firebase/animales.ts`. Los usan las pruebas de F-03.
 */
import type { AnimalConId } from '../../src/firebase/animales';
import { ALBERGUE, ANIMALES } from '../../scripts/datos-prueba/datos';

/** Recibe un animal de prueba. Devuelve la ficha como si viniera de Firestore. */
export const ANIMALES_FIRESTORE: AnimalConId[] = ANIMALES.map((animal) => ({
  ...animal,
  albergueId: ALBERGUE.uid,
  nombreAlbergue: ALBERGUE.nombre,
  miniatura: `data:image/jpeg;base64,${animal.id}`,
  creadoEn: null as never,
}));

/** Recibe el id. Devuelve ese animal de prueba (o falla la prueba si no existe). */
export function animalDePrueba(id: string): AnimalConId {
  const animal = ANIMALES_FIRESTORE.find((candidato) => candidato.id === id);
  if (!animal) {
    throw new Error(`No hay animal de prueba con id ${id}`);
  }
  return animal;
}
