/**
 * Pestañas del adoptante (RF-24): Descubrir · Mis solicitudes · Mi perfil.
 * Solo se ven en estas tres pantallas (specs/02-navegacion.md §4.2).
 *
 * Estilo e íconos compartidos con el albergue (F-07 PS-13, PO-34, PO-26):
 * `useOpcionesPestanas()` ya suma el espacio inferior de Android UNA sola
 * vez (antes lo sumaba este archivo, PR #32; ahora vive en
 * `estiloPestanas.ts`). Cada pestaña lleva su ícono: relleno si está activa
 * y de contorno si no.
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

const ICONO_DESCUBRIR = iconoPestana(ICONOS_PESTANAS.descubrir);
const ICONO_MIS_SOLICITUDES = iconoPestana(ICONOS_PESTANAS.misSolicitudes);
const ICONO_MI_PERFIL = iconoPestana(ICONOS_PESTANAS.miPerfil);

export default function PestanasAdoptante() {
  const opciones = useOpcionesPestanas();

  return (
    <Tabs screenOptions={opciones}>
      <Tabs.Screen name="descubrir" options={{ title: 'Descubrir', tabBarIcon: ICONO_DESCUBRIR }} />
      <Tabs.Screen
        name="mis-solicitudes"
        options={{ title: 'Mis solicitudes', tabBarIcon: ICONO_MIS_SOLICITUDES }}
      />
      <Tabs.Screen name="mi-perfil" options={{ title: 'Mi perfil', tabBarIcon: ICONO_MI_PERFIL }} />
    </Tabs>
  );
}
