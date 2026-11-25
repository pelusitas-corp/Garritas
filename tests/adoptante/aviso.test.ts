/**
 * Duración del aviso de G-8 (spec F-03 v1.1, DE-9). El nombre de cada prueba es su criterio.
 */
import { DURACION_AVISO_MS, programarQuitarAviso } from '../../src/adoptante/descubrir/aviso';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('F-03 · DE-9 · Aviso de G-8', () => {
  test('DE-9: el aviso "Esta mascota ya no está disponible para adopción" se quita solo a los 5 s', () => {
    const quitar = jest.fn();
    programarQuitarAviso(quitar);

    jest.advanceTimersByTime(DURACION_AVISO_MS - 1);
    expect(quitar).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(quitar).toHaveBeenCalledTimes(1);
    expect(DURACION_AVISO_MS).toBe(5000);
  });

  test('DE-9: si el adoptante actúa antes ("Pasar", abrir una tarjeta o salir), el temporizador se cancela', () => {
    const quitar = jest.fn();
    const cancelar = programarQuitarAviso(quitar);

    jest.advanceTimersByTime(2000);
    cancelar();
    jest.advanceTimersByTime(DURACION_AVISO_MS);

    expect(quitar).not.toHaveBeenCalled();
  });
});
