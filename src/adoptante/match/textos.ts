/**
 * Textos de Match y de "¡Solicitud enviada!" (spec F-06 §3.1, MS-10).
 *
 * Son textos de Figma confirmados por la PO (PO-21), salvo los marcados
 * como literales del SRS. Los mensajes de error, vacío y estado NO van
 * aquí: están en src/compartido/mensajes.ts (F-06 §5).
 *
 * "Garritas", "Mi perfil" y "Reintentar" ya existen en los textos de
 * Descubrir (F-03) y se reutilizan desde allá.
 */

export const TEXTOS_MATCH = {
  /** Título de Match con 30 % o más (Figma y 02 §4.2). */
  esUnMatch: '¡Es un match!',
  /** Debajo del porcentaje (Figma). */
  compatible: 'compatible',
  /** Título de la tarjeta de dimensiones con 30 % o más (Figma). */
  porQueHacenMatch: '¿Por qué hacen match?',
  /** Título de la tarjeta de dimensiones con menos de 30 % (Figma, PO-21). */
  menorCoincidencia: 'Dimensiones con menor coincidencia',
  /** Botón de Match (literal de RF-11). */
  enviarSolicitud: 'Enviar solicitud',
  /** Botón de Match con un animal excluido por un filtro (G-9, MS-2). */
  irADescubrir: 'Ir a Descubrir',
} as const;

export const TEXTOS_SOLICITUD_ENVIADA = {
  /** Título (literal de RF-11). */
  titulo: '¡Solicitud enviada!',
  /** Subtítulo (Figma, PO-21). */
  subtitulo: 'El albergue revisará tu solicitud. Puedes ver su estado en Mis solicitudes.',
  /** Botón que abre la pestaña Mis solicitudes (Figma, PO-21). */
  verMisSolicitudes: 'Ver mis solicitudes',
} as const;

/** Recibe el nombre del animal. Devuelve "{nombre} y tú podrían ser la pareja perfecta." (Figma). */
export function textoParejaPerfecta(nombre: string): string {
  return `${nombre} y tú podrían ser la pareja perfecta.`;
}

/** Recibe el % del motor. Devuelve "{porcentaje}%", sin espacio, como en Figma ("92%"). */
export function textoPorcentajeMatch(porcentaje: number): string {
  return `${porcentaje}%`;
}
