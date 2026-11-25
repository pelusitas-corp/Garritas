/**
 * Pestañas del albergue (RF-24, N-1): Solicitudes (inicio) · Mascotas
 * (Alta de mascota). Textos de Figma (specs/02-navegacion.md §4.3).
 *
 * Estilo e íconos compartidos con el adoptante (F-07 PS-13, PO-34, PO-26):
 * `useOpcionesPestanas()` suma el espacio inferior de Android una sola vez.
 * Íconos: Solicitudes portapapeles y Mascotas huella; relleno si la pestaña
 * está activa y de contorno si no.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/tabs';

import {
  ICONOS_PESTANAS,
  TAMANO_ICONO_PESTANA,
  iconoDePestana,
  useOpcionesPestanas,
} from '../../../src/compartido/navegacion/estiloPestanas';
import type { IconosPestana } from '../../../src/compartido/navegacion/estiloPestanas';
import { COLORES } from '../../../src/compartido/tema';

/** Recibe los íconos de una pestaña. Devuelve el componente que la dibuja (PS-13). */
function iconoPestana(iconos: IconosPestana) {
  return function IconoPestana({ focused }: { focused: boolean }) {
    return (
      <MaterialCommunityIcons
        name={iconoDePestana(iconos, focused)}
        size={TAMANO_ICONO_PESTANA}
        color={COLORES.cafe}
      />
    );
  };
}

const ICONO_SOLICITUDES = iconoPestana(ICONOS_PESTANAS.solicitudes);
const ICONO_MASCOTAS = iconoPestana(ICONOS_PESTANAS.mascotas);

export default function PestanasAlbergue() {
  const opciones = useOpcionesPestanas();

  return (
    <Tabs screenOptions={opciones}>
      <Tabs.Screen
        name="solicitudes"
        options={{ title: 'Solicitudes', tabBarIcon: ICONO_SOLICITUDES }}
      />
      <Tabs.Screen
        name="nueva-mascota"
        options={{ title: 'Mascotas', tabBarIcon: ICONO_MASCOTAS }}
      />
    </Tabs>
  );
}
