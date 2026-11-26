/**
 * Gesto de deslizar la tarjeta de Descubrir (spec F-11 §4.6, AD-8; decisión
 * del equipo, no está en el SRS).
 *
 * Solo funciones puras: deciden qué hacer con el movimiento del dedo. El
 * componente `TarjetaAnimal` mueve la tarjeta con `PanResponder` y
 * `Animated` (ya vienen en React Native) y llama a estas funciones.
 *
 * Analogía: es el árbitro de la línea. La tarjeta se mueve con el dedo; al
 * soltarla, el árbitro mira si cruzó la línea del 25 % y hacia qué lado.
 */

/** Hay que soltar la tarjeta MÁS ALLÁ del 25 % del ancho de la pantalla. */
export const UMBRAL_DESLIZAR = 0.25;

/** Píxeles en horizontal que debe moverse el dedo para que empiece el gesto. */
export const MINIMO_PARA_EMPEZAR = 10;

/** Lo más que gira la tarjeta, en grados, al llegar a la orilla. */
export const GIRO_MAXIMO = 10;

/** Qué pasa al soltar la tarjeta. */
export type DecisionDeslizamiento = 'pasar' | 'me-encanta' | 'regresar';

/**
 * Recibe cuánto se movió el dedo en horizontal (`desplazamientoX`, negativo
 * hacia la izquierda) y el ancho de la pantalla. Devuelve:
 * - `me-encanta` si pasó MÁS del 25 % hacia la derecha;
 * - `pasar` si pasó MÁS del 25 % hacia la izquierda;
 * - `regresar` si no (justo en el 25 % también regresa).
 */
export function decidirDeslizamiento(
  desplazamientoX: number,
  anchoPantalla: number,
): DecisionDeslizamiento {
  const umbral = anchoPantalla * UMBRAL_DESLIZAR;
  if (desplazamientoX > umbral) {
    return 'me-encanta';
  }
  if (desplazamientoX < -umbral) {
    return 'pasar';
  }
  return 'regresar';
}

/**
 * Recibe cuánto se movió el dedo en horizontal (`dx`) y en vertical (`dy`).
 * Devuelve `true` solo si se movió más de 10 px en horizontal y más en
 * horizontal que en vertical. Si no, el toque sigue siendo un toque normal
 * (abre el Detalle o el botón "ⓘ").
 */
export function debeEmpezarDeslizamiento(dx: number, dy: number): boolean {
  return Math.abs(dx) > MINIMO_PARA_EMPEZAR && Math.abs(dx) > Math.abs(dy);
}
