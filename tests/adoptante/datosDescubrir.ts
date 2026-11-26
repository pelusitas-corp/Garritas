/**
 * Animales de prueba (03-modelo-datos §8.2) con la forma que devuelve
 * `src/firebase/animales.ts`. Los usan las pruebas de F-03.
 *
 * Solo los 5 originales: los criterios de F-03 v1.2 ("Ana ve Luna 95, Wini 90,
 * Canela 76 y Toby 73") se escribieron con ellos. Los 4 animales de M-7
 * (03 v1.8) y lo que ve cada adoptante con los 9 los revisa
 * `tests/datos-prueba.test.ts`.
 */
import type { AnimalConId } from '../../src/firebase/animales';
import { ALBERGUE, ANIMALES } from '../../scripts/datos-prueba/datos';

/** IDs de los 5 animales originales de 03 §8.2 (antes de M-7). */
const IDS_ORIGINALES = ['wini', 'luna', 'rocky', 'toby', 'canela'];

/** Los 5 animales originales, con la ficha como si viniera de Firestore. */
export const ANIMALES_FIRESTORE: AnimalConId[] = ANIMALES.filter((animal) =>
  IDS_ORIGINALES.includes(animal.id),
).map((animal) => ({
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
