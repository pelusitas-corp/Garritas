/**
 * Colores de las opciones y casillas de "Nueva mascota" (spec F-13 §4.7,
 * AF-15; decisión del equipo, no está en el SRS; Figma "Alta de Mascota").
 *
 * Funciones puras: deciden los colores (nombres de `tema.ts`) sin dibujar
 * nada, para poder probarlas con Jest. Las usan `SelectorOpciones` y
 * `CasillaCuidado`.
 */
import type { NombreColor } from '../../compartido/tema';

/** Fondo, borde y texto de una opción o casilla. */
export interface AspectoOpcion {
  fondo: NombreColor;
  borde: NombreColor;
  texto: NombreColor;
}

/**
 * Recibe si la opción está elegida. Devuelve sus colores: sin elegir, azul
 * grisáceo sólido con texto café; elegida, azul marino con texto crema.
 */
export function aspectoOpcion(elegida: boolean): AspectoOpcion {
  return elegida
    ? { fondo: 'azulMarino', borde: 'azulMarino', texto: 'crema' }
    : { fondo: 'azulGrisaceo', borde: 'azulGrisaceo', texto: 'cafe' };
}

/**
 * Recibe si la casilla de "Cuidados de salud" está marcada. Devuelve sus
 * colores: sin marcar, azul grisáceo sólido con texto café; marcada, menta
 * con borde azul marino.
 */
export function aspectoCasilla(marcada: boolean): AspectoOpcion {
  return marcada
    ? { fondo: 'menta', borde: 'azulMarino', texto: 'cafe' }
    : { fondo: 'azulGrisaceo', borde: 'azulGrisaceo', texto: 'cafe' };
}
