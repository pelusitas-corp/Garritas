// Prueba mínima del setup: comprueba que Jest funciona y que el tema
// Soft UI respeta la arquitectura §8.
import {
  BORDE,
  CIRCULOS,
  COLORES,
  FONDOS,
  FUENTES,
  OPACIDAD_ATENUADA,
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

describe('F-12 · T-1 · Tamaños de texto (AE-1, RN-02)', () => {
  test('F-12 válido: el texto mínimo es 14 y el de los datos 16', () => {
    expect(TAMANOS_TEXTO.minimo).toBe(14);
    expect(TAMANOS_TEXTO.dato).toBe(16);
  });
});

describe('F-13 · T-1 · Fondos, opacidad y medidas nuevas (AF-10, AF-11, AF-14, RN-02)', () => {
  test('F-13 válido: el fondo de "N solicitudes nuevas" es el azul marino de la paleta al 15 %', () => {
    const [rojo, verde, azul] = hexARgb(COLORES.azulMarino);
    expect(FONDOS.nuevas).toBe(`rgba(${rojo}, ${verde}, ${azul}, 0.15)`);
  });

  test('F-13 válido: el círculo de "No Apto" es el azul grisáceo de la paleta al 50 %', () => {
    const [rojo, verde, azul] = hexARgb(COLORES.azulGrisaceo);
    expect(FONDOS.noApto).toBe(`rgba(${rojo}, ${verde}, ${azul}, 0.5)`);
  });

  test('F-13 válido: la tarjeta "Rechazada" se atenúa con opacidad 0.6', () => {
    expect(OPACIDAD_ATENUADA).toBe(0.6);
  });

  test('F-13 válido: los círculos miden 64 y 96 (%), 96 (foto) y 72 (hogar y cámara)', () => {
    expect(CIRCULOS).toEqual({
      porcentaje: 64,
      porcentajeDetalle: 96,
      fotoAnimal: 96,
      hogar: 72,
      camara: 72,
    });
  });

  test('F-13 válido: ya no hay relleno transparente de contenedores (AF-15 reemplaza AE-11)', () => {
    expect(Object.keys(FONDOS).sort()).toEqual(['noApto', 'nuevas']);
  });

  test('F-13 no válido: ningún tamaño de texto nuevo baja de 14', () => {
    Object.values(TAMANOS_TEXTO).forEach((tamano) => {
      expect(tamano).toBeGreaterThanOrEqual(TAMANOS_TEXTO.minimo);
    });
  });
});
