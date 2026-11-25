/**
 * Mazo de Descubrir (spec F-03: CA-01, CA-03, CA-04, CA-07; RN-01, RN-02, RN-04, RN-05).
 * El nombre de cada prueba es su criterio de aceptación.
 */
import {
  armarMazo,
  crearMazo,
  mazoTerminado,
  ordenarMazo,
  pasar,
  tarjetaActual,
  verDeNuevo,
} from '../../src/adoptante/descubrir/mazo';
import type { TarjetaMazo } from '../../src/adoptante/descubrir/mazo';
import type { Cuestionario } from '../../src/matchmaking';
import { ADOPTANTES } from '../../scripts/datos-prueba/datos';
import { ANIMALES_FIRESTORE, animalDePrueba } from './datosDescubrir';

const ANA = ADOPTANTES.a.cuestionario;
const LUIS = ADOPTANTES.b.cuestionario;

/** Recibe un mazo. Devuelve "Nombre %" de cada tarjeta, para comparar fácil. */
function resumen(tarjetas: readonly TarjetaMazo[] | null): string[] {
  return (tarjetas ?? []).map((t) => `${t.nombre} ${t.porcentaje}`);
}

/** Tarjeta de mentira con un % dado. */
function tarjeta(nombre: string, porcentaje: number): TarjetaMazo {
  return { animalId: nombre, nombre, especie: 'perro', miniatura: '', porcentaje };
}

describe('F-03 · CA-01 · RF-10 válido', () => {
  test('RF-10 válido: el mazo no incluye un animal "En pre-adopción" (RN-01)', () => {
    const rocky = animalDePrueba('rocky');
    expect(rocky.estado).toBe('En pre-adopción');

    const mazo = armarMazo(ANA, [rocky, animalDePrueba('wini')]);

    expect(mazo?.map((t) => t.animalId)).toEqual(['wini']);
  });

  test('RF-10 válido: cada tarjeta trae miniatura, nombre, especie y %', () => {
    const [primera] = armarMazo(ANA, [animalDePrueba('wini')]) ?? [];

    expect(primera).toEqual({
      animalId: 'wini',
      nombre: 'Wini',
      especie: 'perro',
      miniatura: 'data:image/jpeg;base64,wini',
      porcentaje: 90,
    });
  });

  test('RF-10 válido: con los datos de prueba, Ana ve Luna 95, Wini 90, Canela 76 y Toby 73', () => {
    expect(resumen(armarMazo(ANA, ANIMALES_FIRESTORE))).toEqual([
      'Luna 95',
      'Wini 90',
      'Canela 76',
      'Toby 73',
    ]);
  });
});

describe('F-03 · CA-03 · RF-26 válido', () => {
  test('RF-26 válido: con 25 %, 85 % y 60 % el orden es 85, 60 y 25', () => {
    const ordenadas = ordenarMazo([tarjeta('A', 25), tarjeta('B', 85), tarjeta('C', 60)]);

    expect(ordenadas.map((t) => t.porcentaje)).toEqual([85, 60, 25]);
  });

  test('RF-26 válido: Luis ve Wini 70, Luna 66 y Toby 24, con Toby al final y sin "No Apto"', () => {
    const mazo = armarMazo(LUIS, ANIMALES_FIRESTORE);

    expect(resumen(mazo)).toEqual(['Wini 70', 'Luna 66', 'Toby 24']);
    expect(mazo?.every((t) => !('noApto' in t))).toBe(true);
  });

  test('RF-26 válido: con el mismo %, se ordena por nombre (DE-2)', () => {
    const wini = animalDePrueba('wini');
    const copia = { ...wini, id: 'abril', nombre: 'Abril' };

    expect(resumen(armarMazo(ANA, [wini, copia]))).toEqual(['Abril 90', 'Wini 90']);
  });
});

describe('F-03 · CA-04 · RF-26 no válido', () => {
  test('RF-26 no válido: con P3 Rentada y P4 No ningún animal pasa los filtros y el mazo queda vacío', () => {
    const rentaSinMascotas: Cuestionario = {
      ...LUIS,
      respuestas: { ...LUIS.respuestas, p3: 'rentada', p4: 'no' },
    };

    expect(armarMazo(rentaSinMascotas, ANIMALES_FIRESTORE)).toEqual([]);
  });

  test('RF-26 no válido: sin animales "Disponible" el mazo queda vacío (RN-05)', () => {
    expect(armarMazo(ANA, [animalDePrueba('rocky')])).toEqual([]);
  });

  test('G-5: con el cuestionario incompleto no arma el mazo', () => {
    expect(armarMazo({ ...ANA, completo: false }, ANIMALES_FIRESTORE)).toBeNull();
  });
});

describe('F-03 · CA-07 · Mazo terminado (DE-1)', () => {
  const mazoDeLuis = crearMazo(armarMazo(LUIS, ANIMALES_FIRESTORE) ?? []);

  test('CA-07: después de pasar las 3 tarjetas de Luis el mazo está terminado y no vacío', () => {
    const alFinal = pasar(pasar(pasar(mazoDeLuis)));

    expect(tarjetaActual(alFinal)).toBeNull();
    expect(mazoTerminado(alFinal)).toBe(true);
    expect(alFinal.tarjetas).toHaveLength(3);
  });

  test('CA-07: "Pasar" muestra la siguiente tarjeta (RN-04)', () => {
    expect(tarjetaActual(mazoDeLuis)?.nombre).toBe('Wini');
    expect(tarjetaActual(pasar(mazoDeLuis))?.nombre).toBe('Luna');
    expect(mazoTerminado(pasar(mazoDeLuis))).toBe(false);
  });

  test('CA-07: "Ver de nuevo" vuelve a mostrar a Wini', () => {
    const otraVez = verDeNuevo(pasar(pasar(pasar(mazoDeLuis))));

    expect(tarjetaActual(otraVez)?.nombre).toBe('Wini');
    expect(mazoTerminado(otraVez)).toBe(false);
  });

  test('RN-05: un mazo vacío no cuenta como terminado', () => {
    expect(mazoTerminado(crearMazo([]))).toBe(false);
  });
});
