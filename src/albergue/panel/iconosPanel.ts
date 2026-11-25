/**
 * Íconos del panel de solicitudes, de MaterialCommunityIcons
 * (@expo/vector-icons, D-51; Figma, PS-11). Está aparte de los componentes
 * para poder revisarlo sin dibujar nada.
 */
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type NombreIcono = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const ICONOS_PANEL = {
  /** Huella de contorno junto a "Solicitudes" en la lista. */
  marca: 'paw-outline',
  /** "←" del encabezado de un animal. */
  atras: 'arrow-left',
  /** Ícono de usuario del encabezado de la lista (N-3). */
  usuario: 'account-outline',
  /** Ícono de salida de "Cerrar sesión" (PS-11). */
  salir: 'logout',
  /** "›" de cada fila de "Tus animales". */
  abrir: 'chevron-right',
  /** Ícono de orden junto a "Mayor compatibilidad" (PS-8). */
  orden: 'sort-descending',
} as const satisfies Record<string, NombreIcono>;
