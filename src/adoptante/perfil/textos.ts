/**
 * Textos de Mi perfil (spec F-13 §4.1 y §5, AF-1; decisión del equipo, no
 * está en el SRS). Los mensajes de error y de estado NO van aquí: están en
 * src/compartido/mensajes.ts.
 */

/**
 * Recibe el nombre del adoptante (p. ej. "Ana Torres"). Devuelve el saludo
 * de la tarjeta del nombre: "¡Hola, Ana Torres!".
 */
export function textoSaludo(nombre: string): string {
  return `¡Hola, ${nombre}!`;
}

/** Va debajo de la tarjeta del saludo, antes de la tarjeta del perfil Garritas. */
export const TEXTO_TU_PERFIL = 'Tu perfil Garritas es:';
