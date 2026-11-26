/**
 * Íconos de la decisión y del Detalle de Solicitud, de MaterialCommunityIcons
 * (@expo/vector-icons, D-51; Figma, plan de F-08). Está aparte de los
 * componentes para poder revisarlo sin dibujar nada.
 */
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { LineaHogar } from './decision';

export type NombreIcono = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const ICONOS_DECISION = {
  /** "✓ Pre-aprobar" y la píldora "✓ Pre-aprobada". */
  preAprobar: 'check',
  /** "✕ Rechazar" (tarjeta) y la píldora "✕ Rechazada". */
  rechazar: 'close',
  /** "←" del encabezado del Detalle. */
  atras: 'arrow-left',
  /** Junto al teléfono que se toca para llamar (F-12 AE-10). */
  llamar: 'phone-outline',
} as const satisfies Record<string, NombreIcono>;

/** Íconos de "Su hogar y sus cuidados" (PA-7): casa, reloj y huella. */
export const ICONOS_HOGAR = {
  viveEn: 'home-outline',
  tiempoSolo: 'clock-outline',
  experiencia: 'paw-outline',
} as const satisfies Record<LineaHogar['clave'], NombreIcono>;
