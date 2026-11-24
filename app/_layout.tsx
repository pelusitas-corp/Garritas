/**
 * Layout raíz de Expo Router: envuelve TODAS las pantallas de app/.
 *
 * 1. Mantiene visible la pantalla de bienvenida (splash) mientras carga la
 *    fuente Nunito.
 * 2. Pone el `ProveedorSesion` (specs/02-navegacion.md §6): escucha la
 *    sesión de Firebase y lee el rol una sola vez para toda la app. Las
 *    guardas G-1, G-2, G-4 y G-4b las aplica el `_layout.tsx` de cada grupo
 *    con `GuardaDeGrupo`.
 * 3. Muestra la navegación tipo "pila" (Stack) con las tres alas:
 *    (acceso), (adoptante) y (albergue).
 */
import { Nunito_400Regular, Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { ProveedorSesion } from '../src/compartido/navegacion/useSesion';
import { COLORES } from '../src/compartido/tema';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Si el splash ya se ocultó, no hay nada que hacer.
});

export default function LayoutRaiz() {
  const [fuentesListas, errorFuentes] = useFonts({ Nunito_400Regular, Nunito_700Bold });

  useEffect(() => {
    if (fuentesListas || errorFuentes) {
      SplashScreen.hideAsync().catch(() => {
        // Si el splash ya se ocultó, no hay nada que hacer.
      });
    }
  }, [fuentesListas, errorFuentes]);

  if (!fuentesListas && !errorFuentes) {
    return null;
  }

  return (
    <ProveedorSesion>
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORES.crema } }}
      />
    </ProveedorSesion>
  );
}
