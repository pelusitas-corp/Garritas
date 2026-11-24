/**
 * Ala del albergue (specs/02-navegacion.md §4.3).
 * Guardas: sin sesión → Selección de Rol (G-1); otro rol → "No tienes
 * permiso para ver esta sección" (G-3, RF-24).
 */
import { Stack } from 'expo-router';

import GuardaDeGrupo from '../../src/compartido/navegacion/GuardaDeGrupo';

export default function LayoutAlbergue() {
  return (
    <GuardaDeGrupo grupo="albergue">
      <Stack screenOptions={{ headerShown: false }} />
    </GuardaDeGrupo>
  );
}
