/**
 * Duración del aviso de G-8 en Descubrir (spec F-03 v1.1, DE-9).
 *
 * "Esta mascota ya no está disponible para adopción" se quita solo a los
 * 5 s, o antes con la siguiente acción del adoptante ("Pasar", abrir una
 * tarjeta o salir de Descubrir). Está aparte del hook para probar el
 * temporizador con Jest.
 */

/** DE-9: el aviso se quita solo a los 5 segundos. */
export const DURACION_AVISO_MS = 5000;

/**
 * Recibe qué hacer cuando pase el tiempo (quitar el aviso).
 * Devuelve una función que cancela el temporizador: se usa cuando el
 * adoptante actúa antes o sale de Descubrir.
 */
export function programarQuitarAviso(alQuitar: () => void): () => void {
  const reloj = setTimeout(alQuitar, DURACION_AVISO_MS);
  return () => clearTimeout(reloj);
}
