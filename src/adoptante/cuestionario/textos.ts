/**
 * Textos de botones y apoyo del cuestionario y del perfil (spec F-04).
 * Los mensajes de error y de estado NO van aquí: están en
 * src/compartido/mensajes.ts.
 */

/** Botón final del cuestionario (RF-02, RF-19, D-24). Literal del SRS. */
export const TEXTO_VER_MI_PERFIL = 'Ver mi perfil Garritas';

/** Botón de Perfil Garritas (PO-21; decisión del equipo, no está en el SRS). */
export const TEXTO_VER_MIS_MATCHES = 'Ver mis matches';

/** Texto de apoyo debajo de las opciones (PO-21; decisión del equipo, no está en el SRS). */
export const TEXTO_APOYO = 'No hay una respuesta perfecta. Lo importante es el cariño.';

/** RN-09: "Pregunta N de M". */
export function textoPosicion(numero: number, total: number): string {
  return `Pregunta ${numero} de ${total}`;
}
