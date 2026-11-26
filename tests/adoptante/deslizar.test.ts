// Pruebas del gesto de deslizar la tarjeta de Descubrir (spec F-11 T-8:
// AD-8; CA-08, CA-09 y CA-10). Las funciones son puras: no se dibuja nada.
// El nombre de cada prueba es su criterio de aceptación.
import {
  UMBRAL_DESLIZAR,
  debeEmpezarDeslizamiento,
  decidirDeslizamiento,
} from '../../src/adoptante/descubrir/deslizar';

/** Ancho del prototipo: el 25 % son 97.5 px. */
const ANCHO = 390;

describe('F-11 · T-8 · Decidir al soltar la tarjeta (AD-8)', () => {
  test('el umbral es el 25 % del ancho de la pantalla', () => {
    expect(UMBRAL_DESLIZAR).toBe(0.25);
  });

  test('CA-08 F-11 válido: deslizar más del 25 % a la derecha decide "me encanta"', () => {
    expect(decidirDeslizamiento(98, ANCHO)).toBe('me-encanta');
    expect(decidirDeslizamiento(300, ANCHO)).toBe('me-encanta');
  });

  test('CA-09 F-11 válido: deslizar más del 25 % a la izquierda decide "pasar"', () => {
    expect(decidirDeslizamiento(-98, ANCHO)).toBe('pasar');
    expect(decidirDeslizamiento(-300, ANCHO)).toBe('pasar');
  });

  test('CA-10 F-11 no válido: deslizar menos del 25 % regresa la tarjeta al centro', () => {
    expect(decidirDeslizamiento(60, ANCHO)).toBe('regresar');
    expect(decidirDeslizamiento(-60, ANCHO)).toBe('regresar');
    expect(decidirDeslizamiento(0, ANCHO)).toBe('regresar');
  });

  test('CA-10 F-11 no válido: deslizar exactamente el 25 % regresa la tarjeta al centro', () => {
    expect(decidirDeslizamiento(97.5, ANCHO)).toBe('regresar');
    expect(decidirDeslizamiento(-97.5, ANCHO)).toBe('regresar');
  });

  test('CA-08 F-11: el umbral cambia con el ancho de la pantalla', () => {
    // En un teléfono de 360, el 25 % son 90 px.
    expect(decidirDeslizamiento(95, 360)).toBe('me-encanta');
    expect(decidirDeslizamiento(95, 412)).toBe('regresar');
  });
});

describe('F-11 · T-8 · Cuándo empieza el gesto (CA-10: el toque sigue abriendo el Detalle)', () => {
  test('CA-10 F-11: el gesto solo empieza con más de 10 px en horizontal y más horizontal que vertical', () => {
    expect(debeEmpezarDeslizamiento(11, 2)).toBe(true);
    expect(debeEmpezarDeslizamiento(-11, 2)).toBe(true);
  });

  test('CA-10 F-11 no válido: un toque o un movimiento corto no empieza el gesto', () => {
    expect(debeEmpezarDeslizamiento(0, 0)).toBe(false);
    expect(debeEmpezarDeslizamiento(10, 0)).toBe(false);
    expect(debeEmpezarDeslizamiento(-10, 0)).toBe(false);
  });

  test('CA-10 F-11 no válido: un movimiento más vertical que horizontal no empieza el gesto', () => {
    expect(debeEmpezarDeslizamiento(20, 30)).toBe(false);
    expect(debeEmpezarDeslizamiento(20, -20)).toBe(false);
  });
});
