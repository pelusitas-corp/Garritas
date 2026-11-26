// Prueba mínima del setup: comprueba que Jest funciona y que el tema
// Soft UI respeta la arquitectura §8.
import {
  BORDE,
  COLORES,
  FONDOS,
  FUENTES,
  OPACIDAD_DESVANECIDO,
  RADIOS,
  RADIO_MINIMO,
  TAMANOS_TEXTO,
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

/** Convierte "#A1B2D0" en [161, 178, 208]. */
function hexARgb(hex: string): number[] {
  return [1, 3, 5].map((inicio) => parseInt(hex.slice(inicio, inicio + 2), 16));
}

describe('F-12 · T-1 · Tamaños de texto y fondo de contenedor (AE-1, AE-11, RN-02)', () => {
  test('F-12 válido: el texto mínimo es 14 y el de los datos 16', () => {
    expect(TAMANOS_TEXTO).toEqual({ minimo: 14, dato: 16 });
  });

  test('F-12 válido: el relleno de los contenedores es el azul grisáceo de la paleta al 25 %', () => {
    const [rojo, verde, azul] = hexARgb(COLORES.azulGrisaceo);
    expect(FONDOS.contenedor).toBe(`rgba(${rojo}, ${verde}, ${azul}, 0.25)`);
  });
});
