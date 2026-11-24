// Pruebas de la pantalla de inicio de cada rol (specs/02-navegacion.md §5).
// El nombre de cada prueba es su criterio de aceptación.
import { inicioDelRol } from '../../src/compartido/navegacion/inicioDelRol';

describe('CA-01 · RF-09 válido: abre la pantalla de inicio de su rol', () => {
  test('RF-09 válido: un albergue inicia sesión y se abre Solicitudes', () => {
    expect(inicioDelRol('albergue', false)).toBe('/solicitudes');
  });

  test('RF-09 válido: un adoptante con el cuestionario completo inicia sesión y se abre Descubrir', () => {
    expect(inicioDelRol('adoptante', true)).toBe('/descubrir');
  });

  test('RF-02: un adoptante con el cuestionario incompleto inicia sesión y se abre el cuestionario', () => {
    expect(inicioDelRol('adoptante', false)).toBe('/cuestionario');
  });
});
