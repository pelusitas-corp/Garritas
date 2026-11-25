/**
 * Decisión del Detalle (spec F-03: CA-05, CA-06; G-8, A5, A6).
 * El nombre de cada prueba es su criterio de aceptación.
 */
import { decidirDetalle } from '../../src/adoptante/descubrir/detalle';
import { animalDePrueba } from './datosDescubrir';

describe('F-03 · CA-05 · RF-28 válido', () => {
  test('RF-28 válido: un animal "Disponible" se muestra en el Detalle', () => {
    const wini = animalDePrueba('wini');

    expect(decidirDetalle({ estado: 'ok', animal: wini })).toEqual({
      accion: 'mostrar',
      animal: wini,
    });
  });
});

describe('F-03 · CA-06 · RF-28 no válido', () => {
  test('RF-28 no válido: un animal "En pre-adopción" da no-disponible (G-8)', () => {
    expect(decidirDetalle({ estado: 'ok', animal: animalDePrueba('rocky') })).toEqual({
      accion: 'no-disponible',
    });
  });

  test('RF-28 no válido: un animalId que no existe da no-disponible (G-8, N-7)', () => {
    expect(decidirDetalle({ estado: 'no-existe' })).toEqual({ accion: 'no-disponible' });
  });
});

describe('F-03 · Estados del Detalle', () => {
  test('A5: sin conexión se muestra el error de conexión', () => {
    expect(decidirDetalle({ estado: 'sin-conexion' })).toEqual({ accion: 'error' });
  });

  test('RNF-02: una lectura rechazada se muestra como sin permiso', () => {
    expect(decidirDetalle({ estado: 'sin-permiso' })).toEqual({ accion: 'sin-permiso' });
  });
});
