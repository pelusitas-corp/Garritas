/**
 * Pestañas del albergue (RF-24, N-1): Solicitudes (inicio) · Mascotas
 * (Alta de mascota). Textos de Figma (specs/02-navegacion.md §4.3).
 */
import { Tabs } from 'expo-router/tabs';

import OPCIONES_PESTANAS from '../../../src/compartido/navegacion/estiloPestanas';

export default function PestanasAlbergue() {
  return (
    <Tabs screenOptions={OPCIONES_PESTANAS}>
      <Tabs.Screen name="solicitudes" options={{ title: 'Solicitudes' }} />
      <Tabs.Screen name="nueva-mascota" options={{ title: 'Mascotas' }} />
    </Tabs>
  );
}
