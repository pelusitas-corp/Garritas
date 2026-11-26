// Pruebas de los colores de "Nueva mascota" (spec F-13 T-8: AF-15, CA-12).
// Son funciones puras: no se dibuja nada. El nombre de cada prueba es su
// criterio de aceptación.
import { aspectoCasilla, aspectoOpcion } from '../../src/albergue/alta/aspectoOpcion';
import { BORDE, CIRCULOS, FONDOS, ICONOS } from '../../src/compartido/tema';

describe('F-13 · CA-12 · Nueva mascota (AF-15)', () => {
  test('CA-12 · AF-15: en Nueva mascota las opciones sin elegir son azul grisáceo sólido, los contenedores crema con borde y "Añadir una foto" tiene borde punteado y cámara con "+"; publicar a Max funciona igual', () => {
    expect(aspectoOpcion(false)).toEqual({
      fondo: 'azulGrisaceo',
      borde: 'azulGrisaceo',
      texto: 'cafe',
    });
    expect(aspectoOpcion(true)).toEqual({
      fondo: 'azulMarino',
      borde: 'azulMarino',
      texto: 'crema',
    });
    // Ya no existe el relleno transparente de los contenedores (F-12 AE-11).
    expect(FONDOS).not.toHaveProperty('contenedor');
    expect(BORDE).toBe(2);
    expect(CIRCULOS.camara).toBe(72);
    expect(ICONOS.camara).toBe(36);
    // "Publicar a Max funciona igual": lo revisan las pruebas de F-02 (altaAnimal y validacion), que no cambian.
  });

  test('CA-12 · AF-15: en "Cuidados de salud" la casilla marcada es menta con borde azul marino', () => {
    expect(aspectoCasilla(true)).toEqual({ fondo: 'menta', borde: 'azulMarino', texto: 'cafe' });
    expect(aspectoCasilla(false)).toEqual({
      fondo: 'azulGrisaceo',
      borde: 'azulGrisaceo',
      texto: 'cafe',
    });
  });
});
