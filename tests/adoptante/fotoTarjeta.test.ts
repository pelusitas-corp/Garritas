// Pruebas de la foto de la tarjeta de Descubrir (spec F-13 T-4: AF-4, CA-03,
// CA-04; F-03 v1.4). Son funciones puras: no se lee Firestore.
// El nombre de cada prueba es su criterio de aceptación.
import { animalesPorLeer, fotoDeTarjeta } from '../../src/adoptante/descubrir/fotoTarjeta';
import type { EstadoMazo, TarjetaMazo } from '../../src/adoptante/descubrir/mazo';

/** Recibe un `animalId`. Devuelve una tarjeta de mentira con su miniatura. */
function tarjeta(animalId: string): TarjetaMazo {
  return {
    animalId,
    nombre: animalId,
    especie: 'perro',
    miniatura: `miniatura-${animalId}`,
    porcentaje: 90,
  };
}

const MAZO: EstadoMazo = {
  tarjetas: [tarjeta('luna'), tarjeta('sombra'), tarjeta('tostado'), tarjeta('wini')],
  indice: 0,
};

describe('F-13 · CA-03 y CA-04 · Foto nítida en Descubrir (AF-4)', () => {
  test('F-13 válido: la tarjeta usa la foto completa cuando llega y la miniatura mientras tanto', () => {
    const sombra = tarjeta('sombra');
    expect(fotoDeTarjeta(sombra, {})).toBe('miniatura-sombra');
    expect(fotoDeTarjeta(sombra, { sombra: 'foto-completa-sombra' })).toBe('foto-completa-sombra');
  });

  test('F-13 no válido: si la foto completa no llega, la tarjeta se queda con la miniatura', () => {
    // Llegó la de otro animal, pero la de Sombra no (su lectura falló).
    expect(fotoDeTarjeta(tarjeta('sombra'), { luna: 'foto-completa-luna' })).toBe(
      'miniatura-sombra',
    );
  });
});

describe('F-13 · T-4 · Qué fotos se leen (AF-4)', () => {
  test('F-13 válido: lee solo foto-0 del animal visible y, como mucho, la del siguiente', () => {
    expect(animalesPorLeer(MAZO, new Set())).toEqual(['luna', 'sombra']);
    expect(animalesPorLeer({ ...MAZO, indice: 2 }, new Set())).toEqual(['tostado', 'wini']);
  });

  test('F-13 no válido: no vuelve a leer una foto que ya está en memoria o se está leyendo', () => {
    expect(animalesPorLeer({ ...MAZO, indice: 1 }, new Set(['luna', 'sombra']))).toEqual([
      'tostado',
    ]);
    expect(animalesPorLeer(MAZO, new Set(['luna', 'sombra']))).toEqual([]);
  });

  test('F-13: en la última tarjeta o con el mazo terminado no pide de más', () => {
    expect(animalesPorLeer({ ...MAZO, indice: 3 }, new Set())).toEqual(['wini']);
    expect(animalesPorLeer({ ...MAZO, indice: 4 }, new Set())).toEqual([]);
  });
});
