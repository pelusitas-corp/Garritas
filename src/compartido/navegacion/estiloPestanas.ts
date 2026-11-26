/**
 * Estilo Soft UI de las pestañas de los dos roles (adoptante y albergue).
 * Spec F-07 PS-13 (cierra PO-34 y PO-26), medidas del plan de F-07.
 *
 * Como en Figma: sin borde y con fondo crema; la pestaña activa es una
 * píldora azul grisáceo; cada pestaña lleva el ícono arriba y el texto abajo
 * (Nunito negrita 12, café). El ícono va relleno en la activa y de contorno
 * en las inactivas (MaterialCommunityIcons de @expo/vector-icons, D-51).
 *
 * F-11 AD-10 (decisión del equipo; no está en el SRS): la pestaña activa es
 * una píldora de verdad (`RADIOS.pildora` con `overflow: 'hidden'`), con
 * márgenes de 6 vertical y 8 horizontal (8 y no 12, para que "Mis solicitudes"
 * quepa en teléfonos de 360 de ancho; confirmado por Jennifer).
 *
 * Espacio inferior de Android (PO-34): si la barra tiene altura fija,
 * React Navigation ya NO le suma el espacio de la barra del sistema, pero sí
 * le pone ese espacio como relleno de abajo. Por eso la altura debe crecer
 * en la misma cantidad. Esa suma vive en UN SOLO lugar,
 * `estiloBarraPestanas`, y la usan los dos `_layout.tsx` a través de
 * `useOpcionesPestanas()`. Así nunca se suma dos veces.
 */
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { TabsScreenOptions } from 'expo-router/tabs';
import { useMemo } from 'react';
import type { ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORES, FUENTES, RADIOS } from '../tema';

type NombreIcono = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Altura de la barra sin el espacio inferior del sistema (plan de F-07). */
export const ALTURA_BARRA = 72;

/** Márgenes de cada pestaña (F-11 AD-10): 6 arriba y abajo, 8 a los lados. */
export const MARGENES_PESTANA = { vertical: 6, horizontal: 8 } as const;

/** Tamaño de los íconos de las pestañas (plan de F-07). */
export const TAMANO_ICONO_PESTANA = 24;

/** Ícono relleno (pestaña activa) y de contorno (inactiva). */
export interface IconosPestana {
  activo: NombreIcono;
  inactivo: NombreIcono;
}

/**
 * Íconos de Figma (PS-13): Descubrir huella, Mis solicitudes portapapeles,
 * Mi perfil usuario; Solicitudes portapapeles, Mascotas huella.
 */
export const ICONOS_PESTANAS = {
  descubrir: { activo: 'paw', inactivo: 'paw-outline' },
  misSolicitudes: { activo: 'clipboard-text', inactivo: 'clipboard-text-outline' },
  miPerfil: { activo: 'account', inactivo: 'account-outline' },
  solicitudes: { activo: 'clipboard-text', inactivo: 'clipboard-text-outline' },
  mascotas: { activo: 'paw', inactivo: 'paw-outline' },
} as const satisfies Record<string, IconosPestana>;

/** Recibe los íconos de una pestaña y si está activa. Devuelve el que se dibuja. */
export function iconoDePestana(iconos: IconosPestana, activa: boolean): NombreIcono {
  return activa ? iconos.activo : iconos.inactivo;
}

/**
 * PO-34: recibe el espacio inferior del sistema (`useSafeAreaInsets().bottom`;
 * 0 en un teléfono sin barra de navegación). Devuelve la altura y el relleno
 * de abajo de la barra. Es el ÚNICO lugar donde se suma ese espacio.
 */
export function estiloBarraPestanas(inferior: number): { height: number; paddingBottom: number } {
  return { height: ALTURA_BARRA + inferior, paddingBottom: inferior };
}

/** Opciones comunes de las pestañas, sin la altura (la pone `estiloBarraPestanas`). */
const OPCIONES_PESTANAS: TabsScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: COLORES.cafe,
  tabBarInactiveTintColor: COLORES.cafe,
  tabBarActiveBackgroundColor: COLORES.azulGrisaceo,
  tabBarStyle: {
    backgroundColor: COLORES.crema,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarItemStyle: {
    borderRadius: RADIOS.pildora,
    overflow: 'hidden',
    marginVertical: MARGENES_PESTANA.vertical,
    marginHorizontal: MARGENES_PESTANA.horizontal,
  },
  tabBarLabelStyle: { fontFamily: FUENTES.negrita, fontSize: 12 },
  tabBarLabelPosition: 'below-icon',
};

/**
 * Hook de los dos `_layout.tsx` de pestañas. No recibe nada. Devuelve las
 * opciones de las pestañas con la barra ya ajustada al espacio inferior del
 * teléfono (una sola vez).
 */
export function useOpcionesPestanas(): TabsScreenOptions {
  const { bottom } = useSafeAreaInsets();
  return useMemo(
    () => ({
      ...OPCIONES_PESTANAS,
      tabBarStyle: [OPCIONES_PESTANAS.tabBarStyle, estiloBarraPestanas(bottom)],
    }),
    [bottom],
  );
}

export default OPCIONES_PESTANAS;
