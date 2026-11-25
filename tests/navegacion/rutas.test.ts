/**
 * Ruta de G-8 (spec F-03: CA-06, DE-4). El nombre de la prueba es su criterio.
 */
import { rutaDescubrirConAviso } from '../../src/compartido/navegacion/rutas';

describe('F-03 · CA-06 · RF-28 no válido', () => {
  test('RF-28 no válido: G-8 regresa a /descubrir?aviso=no-disponible (DE-4)', () => {
    expect(rutaDescubrirConAviso()).toEqual({
      pathname: '/descubrir',
      params: { aviso: 'no-disponible' },
    });
  });
});
