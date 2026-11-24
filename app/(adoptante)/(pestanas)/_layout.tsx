/**
 * Pestañas del adoptante (RF-24): Descubrir · Mis solicitudes · Mi perfil.
 * Solo se ven en estas tres pantallas (specs/02-navegacion.md §4.2).
 */
import { Tabs } from 'expo-router/tabs';

import OPCIONES_PESTANAS from '../../../src/compartido/navegacion/estiloPestanas';

export default function PestanasAdoptante() {
  return (
    <Tabs screenOptions={OPCIONES_PESTANAS}>
      <Tabs.Screen name="descubrir" options={{ title: 'Descubrir' }} />
      <Tabs.Screen name="mis-solicitudes" options={{ title: 'Mis solicitudes' }} />
      <Tabs.Screen name="mi-perfil" options={{ title: 'Mi perfil' }} />
    </Tabs>
  );
}
