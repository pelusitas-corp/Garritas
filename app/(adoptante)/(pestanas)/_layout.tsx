/**
 * Pestañas del adoptante (RF-24): Descubrir · Mis solicitudes · Mi perfil.
 * Solo se ven en estas tres pantallas (specs/02-navegacion.md §4.2).
 *
 * PO-34: en Android la barra de navegación del sistema tapaba la parte de
 * abajo de las pestañas. Aquí se le suma el espacio inferior seguro
 * (`useSafeAreaInsets().bottom`) a la altura y al relleno de abajo. El
 * estilo compartido (`estiloPestanas.ts`) no se toca: lo revisa F-07.
 */
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router/tabs';

import OPCIONES_PESTANAS from '../../../src/compartido/navegacion/estiloPestanas';

/** Altura de la barra en el estilo compartido (72), o 0 si no la define. */
const ALTURA_BASE = Number(StyleSheet.flatten(OPCIONES_PESTANAS.tabBarStyle)?.height ?? 0);

export default function PestanasAdoptante() {
  const { bottom } = useSafeAreaInsets();
  const opciones = {
    ...OPCIONES_PESTANAS,
    tabBarStyle: [
      OPCIONES_PESTANAS.tabBarStyle,
      { height: ALTURA_BASE + bottom, paddingBottom: bottom },
    ],
  };

  return (
    <Tabs screenOptions={opciones}>
      <Tabs.Screen name="descubrir" options={{ title: 'Descubrir' }} />
      <Tabs.Screen name="mis-solicitudes" options={{ title: 'Mis solicitudes' }} />
      <Tabs.Screen name="mi-perfil" options={{ title: 'Mi perfil' }} />
    </Tabs>
  );
}
