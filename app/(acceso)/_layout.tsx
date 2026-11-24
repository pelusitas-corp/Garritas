/**
 * Ala de acceso (specs/02-navegacion.md §4.1). Dueña del contenido: F-01.
 * Guarda: si ya hay sesión, lleva al inicio del rol (G-2); si no se puede
 * leer el rol, bloquea (G-4, G-4b).
 */
import { Stack } from 'expo-router';

import GuardaDeGrupo from '../../src/compartido/navegacion/GuardaDeGrupo';

export default function LayoutAcceso() {
  return (
    <GuardaDeGrupo grupo="acceso">
      <Stack screenOptions={{ headerShown: false }} />
    </GuardaDeGrupo>
  );
}
