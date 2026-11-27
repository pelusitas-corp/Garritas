// Pruebas del modal "¿Quieres cerrar sesión?" (spec F-13 T-11: AF-17, CA-14,
// CA-15; 02 v1.4 N-3 y CA-14). `responderCerrarSesion` es pura: decide qué
// pasa al responder sin dibujar nada. El nombre de cada prueba es su criterio.
import { responderCerrarSesion } from '../../src/compartido/respuestaCerrarSesion';
import TEXTOS_COMPARTIDOS from '../../src/compartido/textos';

describe('F-13 · CA-14 y CA-15 · Confirmar "Cerrar sesión" (AF-17)', () => {
  test('F-13 válido: al confirmar se cierra la sesión', () => {
    const ocultar = jest.fn();
    const cerrarSesion = jest.fn();

    responderCerrarSesion('confirmar', { ocultar, cerrarSesion });

    expect(ocultar).toHaveBeenCalledTimes(1);
    expect(cerrarSesion).toHaveBeenCalledTimes(1);
    expect(TEXTOS_COMPARTIDOS.quieresCerrarSesion).toBe('¿Quieres cerrar sesión?');
  });

  test('F-13 no válido: al cancelar no se cierra la sesión', () => {
    // "Cancelar", "atrás" de Android y tocar fuera de la tarjeta responden 'cancelar'.
    const ocultar = jest.fn();
    const cerrarSesion = jest.fn();

    responderCerrarSesion('cancelar', { ocultar, cerrarSesion });

    expect(ocultar).toHaveBeenCalledTimes(1);
    expect(cerrarSesion).not.toHaveBeenCalled();
    expect(TEXTOS_COMPARTIDOS.cancelar).toBe('Cancelar');
  });
});
