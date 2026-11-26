/**
 * Íconos de Descubrir y del Detalle, de MaterialCommunityIcons
 * (@expo/vector-icons; decisión 5 del plan de F-03, DE-7 y DE-10).
 * Está aparte de los componentes para poder probarlo con Jest sin dibujar.
 */
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type NombreIcono = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const ICONOS_DESCUBRIR = {
  /** Huella junto a "Garritas" en el encabezado de Descubrir (DE-10). */
  marca: 'paw',
  /** Ícono de usuario del encabezado (círculo azul claro) → Mi perfil. */
  miPerfil: 'account-outline',
  /** Botón "ⓘ" de la tarjeta → Detalle. */
  info: 'information-outline',
  /** Cuidado de salud que sí tiene (✓, DE-7). */
  si: 'check-circle',
  /** Cuidado de salud que no tiene (✕, DE-7). */
  no: 'close-circle',
  /** Botón circular "Pasar" de Descubrir. */
  pasar: 'close',
  /** Botón circular "Me encanta" de Descubrir y corazón junto al nombre del Detalle. */
  meEncanta: 'heart-outline',
  /** "←" del encabezado del Detalle. */
  atras: 'arrow-left',
  /** "✕" de la tarjeta del Detalle. */
  cerrar: 'close',
  /** Mosaico "Especie" del Detalle. */
  especie: 'paw',
  /** Mosaico "Edad" del Detalle. */
  edad: 'cake-variant-outline',
  /** Mosaico "Tamaño" del Detalle. */
  tamano: 'ruler',
  /** Línea del albergue en el Detalle. */
  albergue: 'home-outline',
  /** Estrellita "✦" de la píldora del % en Descubrir (F-13 AF-5). */
  estrellita: 'star-four-points',
  /** Estrellitas de contorno junto al subtítulo de Descubrir (F-13 AF-5). */
  estrellitaContorno: 'star-four-points-outline',
} as const satisfies Record<string, NombreIcono>;

/** Recibe si tiene el cuidado de salud. Devuelve el ícono de sí o de no (DE-7). */
export function iconoCuidado(tiene: boolean): NombreIcono {
  return tiene ? ICONOS_DESCUBRIR.si : ICONOS_DESCUBRIR.no;
}
