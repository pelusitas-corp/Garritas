/**
 * RN-10 (spec F-04): ícono de cada perfil Garritas, de MaterialCommunityIcons
 * (@expo/vector-icons). Equivalen a los emojis de ESTADO §6.7.
 * Está aparte del componente para poder probarlo con Jest sin dibujar nada.
 */
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { PerfilGarritas } from '../../matchmaking';

export type NombreIcono = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const ICONOS_PERFIL: Readonly<Record<PerfilGarritas, NombreIcono>> = {
  caminante: 'hiking',
  espirituExplorador: 'compass-outline',
  nidoTranquilo: 'sofa-outline',
  puertasAbiertas: 'home-heart',
};
