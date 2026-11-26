// Prueba mínima del setup: comprueba que Jest funciona y que el tema
// Soft UI respeta la arquitectura §8.
import {
  BORDE,
  COLORES,
  FUENTES,
  OPACIDAD_DESVANECIDO,
  RADIOS,
  RADIO_MINIMO,
} from '../src/compartido/tema';

describe('Tema Soft UI (arquitectura §8)', () => {
  test('usa exactamente los 5 colores de la arquitectura', () => {
    expect(Object.values(COLORES).sort()).toEqual(
      ['#F5EACC', '#4A2E21', '#D3F8E2', '#A1B2D0', '#25314C'].sort(),
    );
  });

  test('todos los bordes miden al menos 24 px', () => {
    expect(RADIO_MINIMO).toBe(24);
    Object.values(RADIOS).forEach((radio) => {
      expect(radio).toBeGreaterThanOrEqual(RADIO_MINIMO);
    });
  });

  test('la tipografía es Nunito', () => {
    Object.values(FUENTES).forEach((fuente) => {
      expect(fuente.startsWith('Nunito_')).toBe(true);
    });
  });
});

describe('F-11 · T-1 · Opacidad de desvanecido y borde (AD-4, AD-12, RN-02)', () => {
  test('F-11 válido: la opacidad de desvanecido está entre 0 y 1', () => {
    expect(OPACIDAD_DESVANECIDO).toBeGreaterThan(0);
    expect(OPACIDAD_DESVANECIDO).toBeLessThan(1);
  });

  test('F-11 válido: el borde de los contenedores es positivo', () => {
    expect(BORDE).toBeGreaterThan(0);
  });
});
