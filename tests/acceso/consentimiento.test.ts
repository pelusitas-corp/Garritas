// Pruebas de la aceptación del aviso guardada en memoria (F-01 CA-01, RN-01).
// El nombre de cada prueba es su criterio de aceptación.
import {
  guardarAceptacion,
  leerAceptacion,
  olvidarAceptacion,
} from '../../src/compartido/acceso/consentimiento';

afterEach(() => olvidarAceptacion());

describe('CA-01 · RF-25 válido', () => {
  test('RF-25 válido: al presionar "Continuar" con la casilla marcada guarda la aceptación con su fecha', () => {
    const fecha = new Date('2026-11-25T10:00:00Z');
    guardarAceptacion(fecha);
    expect(leerAceptacion()).toEqual(fecha);
  });
});

describe('RN-01 · El registro solo se abre después de aceptar', () => {
  test('RN-01: sin aceptar el aviso no hay aceptación guardada', () => {
    expect(leerAceptacion()).toBeNull();
  });

  test('P6: después de crear la cuenta la aceptación se borra de memoria', () => {
    guardarAceptacion(new Date());
    olvidarAceptacion();
    expect(leerAceptacion()).toBeNull();
  });
});
