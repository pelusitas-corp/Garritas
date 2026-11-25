/**
 * Borrador del cuestionario en el teléfono (spec F-04 §4; RF-16).
 * AsyncStorage se sustituye por su versión de prueba (guarda en memoria).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  borrarBorrador,
  claveBorrador,
  guardarBorrador,
  leerBorrador,
} from '../../src/adoptante/cuestionario/borrador';
import { filtrarRespuestasValidas } from '../../src/adoptante/cuestionario/preguntas';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('F-04 · borrador en el teléfono (RF-16)', () => {
  test('RF-16: cada toque guardado en el teléfono se puede leer al volver a abrir', async () => {
    await guardarBorrador('ana', { p1: 'ambos', p2: 'casa' });
    const avance = await leerBorrador('ana');
    expect(avance?.respuestas).toEqual({ p1: 'ambos', p2: 'casa' });
    expect(typeof avance?.actualizadoEn).toBe('number');
  });

  test('RF-16: cada adoptante tiene su propio borrador', async () => {
    await guardarBorrador('ana', { p1: 'ambos' });
    expect(await leerBorrador('luis')).toBeNull();
  });

  test('RF-16 no válido: sin borrador (datos borrados) devuelve null', async () => {
    await guardarBorrador('ana', { p1: 'ambos' });
    await borrarBorrador('ana');
    expect(await leerBorrador('ana')).toBeNull();
  });

  test('RF-16: un borrador dañado se trata como "sin avance"', async () => {
    await AsyncStorage.setItem(claveBorrador('ana'), '{no es json');
    expect(await leerBorrador('ana')).toBeNull();
  });
});

describe('F-04 · respuestas que vienen de fuera', () => {
  test('D-50: solo se quedan las claves p1 a p25 con opciones que existen', () => {
    expect(
      filtrarRespuestasValidas({ p1: 'ambos', p2: 'depa', p30: 'si', otra: 1, p25: 'meAdapto' }),
    ).toEqual({ p1: 'ambos', p25: 'meAdapto' });
    expect(filtrarRespuestasValidas(null)).toEqual({});
    expect(filtrarRespuestasValidas('hola')).toEqual({});
  });
});
