/**
 * Íconos de Match y de "¡Solicitud enviada!", de MaterialCommunityIcons
 * (@expo/vector-icons, el mismo juego que F-03). Diseño de Figma (F-06 §4,
 * MS-3, MS-8, MS-12). Está aparte de los componentes para no repetir nombres.
 */
import type { NombreIcono } from '../descubrir/iconosDescubrir';

const ICONOS_MATCH = {
  /** Huella grande del círculo de arriba y huella del encabezado "Garritas". */
  huella: 'paw',
  /** Corazón de contorno: centro de la huella (salvo < 30 %) y botones. */
  corazon: 'heart-outline',
  /** Ícono de usuario del encabezado (solo dibujo, MS-8). */
  usuario: 'account-outline',
  /** Palomita de las dimensiones con mayor aporte. */
  palomita: 'check',
  /** ✕ de las dimensiones con menor coincidencia (< 30 %). */
  tache: 'close',
  /** "←" de Match, igual al del Detalle (F-13 AF-20). */
  atras: 'arrow-left',
} as const satisfies Record<string, NombreIcono>;

export default ICONOS_MATCH;
