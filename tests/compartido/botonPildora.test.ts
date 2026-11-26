// Pruebas del aspecto de BotonPildora (spec F-11 T-2: AD-2, AD-4; F-01 RN-09).
// `aspectoBoton` es pura: decide colores, opacidad y si responde sin dibujar
// nada. El nombre de cada prueba es su criterio de aceptación.
import { MEDIDAS_BOTON, aspectoBoton } from '../../src/compartido/BotonPildora';
import { OPACIDAD_DESVANECIDO } from '../../src/compartido/tema';

// Los íconos no se dibujan en estas pruebas: se reemplazan por un "doble".
jest.mock('@expo/vector-icons', () => ({ MaterialCommunityIcons: () => null }));

describe('F-11 · T-2 · Botón desactivado desvanecido (AD-4)', () => {
  test('CA-05 F-11: "desactivado" se ve desvanecido con su mismo color y no responde', () => {
    expect(aspectoBoton('principal', { desactivado: true })).toEqual({
      fondo: 'azulMarino',
      colorTexto: 'crema',
      opacidad: OPACIDAD_DESVANECIDO,
      responde: false,
    });
    expect(aspectoBoton('secundario', { desactivado: true })).toEqual({
      fondo: 'menta',
      colorTexto: 'azulMarino',
      opacidad: OPACIDAD_DESVANECIDO,
      responde: false,
    });
  });

  test('CA-05 F-11: el mismo botón con los campos llenos se ve opaco y responde', () => {
    expect(aspectoBoton('principal')).toEqual({
      fondo: 'azulMarino',
      colorTexto: 'crema',
      opacidad: 1,
      responde: true,
    });
  });

  test('F-11: "gris" no cambia y responde', () => {
    expect(aspectoBoton('principal', { gris: true })).toEqual({
      fondo: 'azulGrisaceo',
      colorTexto: 'azulMarino',
      opacidad: 1,
      responde: true,
    });
  });

  test('F-11: "gris" y "desactivado" juntos se ven gris y no responden', () => {
    expect(aspectoBoton('principal', { gris: true, desactivado: true })).toEqual({
      fondo: 'azulGrisaceo',
      colorTexto: 'azulMarino',
      opacidad: 1,
      responde: false,
    });
  });

  test('F-01: "cargando" no responde y no se desvanece', () => {
    expect(aspectoBoton('principal', { cargando: true })).toMatchObject({
      opacidad: 1,
      responde: false,
    });
  });
});

describe('F-11 · T-2 · Tamaño chico (AD-2)', () => {
  test('CA-02 F-11: el tamaño chico tiene texto 16 y no ocupa todo el ancho', () => {
    expect(MEDIDAS_BOTON.chico).toEqual({
      paddingVertical: 10,
      paddingHorizontal: 24,
      tamanoTexto: 16,
      alignSelf: 'center',
    });
  });

  test('CA-02 F-11: el tamaño chico es más bajo y de texto más chico que el normal', () => {
    expect(MEDIDAS_BOTON.chico.paddingVertical).toBeLessThan(MEDIDAS_BOTON.normal.paddingVertical);
    expect(MEDIDAS_BOTON.chico.tamanoTexto).toBeLessThan(MEDIDAS_BOTON.normal.tamanoTexto);
    expect(MEDIDAS_BOTON.normal).not.toHaveProperty('alignSelf');
  });
});
