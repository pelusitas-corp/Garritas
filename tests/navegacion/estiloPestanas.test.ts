// Pruebas del estilo compartido de las pestañas (spec F-07 T-9: CA-10,
// PS-13; PO-34 y PO-26). Solo se revisan datos y funciones puras: no se
// dibuja ninguna pantalla. El nombre de cada prueba es su criterio.
import { StyleSheet } from 'react-native';

import OPCIONES_PESTANAS, {
  ALTURA_BARRA,
  ICONOS_PESTANAS,
  estiloBarraPestanas,
  iconoDePestana,
} from '../../src/compartido/navegacion/estiloPestanas';
import { COLORES, RADIO_MINIMO } from '../../src/compartido/tema';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe('F-07 · T-9 · Pestañas de los dos roles', () => {
  test('CA-10: el espacio inferior de Android se suma una sola vez', () => {
    // Android con barra de navegación del sistema (48) y iPhone sin ella (0).
    expect(estiloBarraPestanas(48)).toEqual({ height: ALTURA_BARRA + 48, paddingBottom: 48 });
    expect(estiloBarraPestanas(0)).toEqual({ height: ALTURA_BARRA, paddingBottom: 0 });
  });

  test('CA-10: el estilo base no trae altura ni relleno inferior propios', () => {
    const base = StyleSheet.flatten(OPCIONES_PESTANAS.tabBarStyle) ?? {};

    expect(base).not.toHaveProperty('height');
    expect(base).not.toHaveProperty('paddingBottom');
  });

  test('CA-10: el ícono va arriba y el texto abajo', () => {
    expect(OPCIONES_PESTANAS.tabBarLabelPosition).toBe('below-icon');
    expect(StyleSheet.flatten(OPCIONES_PESTANAS.tabBarIconStyle)).toBeUndefined();
  });

  test('PS-13: sin borde, fondo crema, activa en píldora azul grisáceo de radio 24 y texto café', () => {
    const barra = StyleSheet.flatten(OPCIONES_PESTANAS.tabBarStyle);

    expect(barra).toMatchObject({ backgroundColor: COLORES.crema, borderTopWidth: 0 });
    expect(OPCIONES_PESTANAS.tabBarActiveBackgroundColor).toBe(COLORES.azulGrisaceo);
    expect(StyleSheet.flatten(OPCIONES_PESTANAS.tabBarItemStyle)).toMatchObject({
      borderRadius: RADIO_MINIMO,
    });
    expect(OPCIONES_PESTANAS.tabBarActiveTintColor).toBe(COLORES.cafe);
    expect(OPCIONES_PESTANAS.tabBarInactiveTintColor).toBe(COLORES.cafe);
  });

  test('PS-13: las 5 pestañas de los dos roles tienen su ícono, relleno si está activa', () => {
    expect(Object.keys(ICONOS_PESTANAS)).toEqual([
      'descubrir',
      'misSolicitudes',
      'miPerfil',
      'solicitudes',
      'mascotas',
    ]);
    expect(iconoDePestana(ICONOS_PESTANAS.solicitudes, true)).toBe('clipboard-text');
    expect(iconoDePestana(ICONOS_PESTANAS.solicitudes, false)).toBe('clipboard-text-outline');
    expect(iconoDePestana(ICONOS_PESTANAS.descubrir, false)).toBe('paw-outline');
    expect(iconoDePestana(ICONOS_PESTANAS.miPerfil, true)).toBe('account');
  });
});
