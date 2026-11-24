/**
 * Ala del adoptante (specs/02-navegacion.md §4.2).
 * Guardas: sin sesión → Selección de Rol (G-1); otro rol → "No tienes
 * permiso para ver esta sección" (G-3, RF-24); cuestionario incompleto en
 * Descubrir, Detalle o Match → cuestionario con el aviso de RF-02 (G-5).
 */
import { Stack } from 'expo-router';

import GuardaDeGrupo from '../../src/compartido/navegacion/GuardaDeGrupo';

export default function LayoutAdoptante() {
  return (
    <GuardaDeGrupo grupo="adoptante">
      <Stack screenOptions={{ headerShown: false }} />
    </GuardaDeGrupo>
  );
}
