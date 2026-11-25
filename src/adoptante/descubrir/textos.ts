/**
 * Textos de Descubrir y del Detalle (spec F-03 §6, "Textos de pantalla").
 * Son textos de Figma confirmados por la PO (PO-21, 2026-11-25), salvo los
 * marcados como literales del SRS. Los mensajes de error y de estado NO van
 * aquí: están en src/compartido/mensajes.ts.
 */
import type { Especie } from '../../matchmaking';

/** Título de la pantalla y de la pestaña (02-navegacion §4.2). */
export const TEXTO_DESCUBRIR = 'Descubrir';

/** Botones de la tarjeta (N-2, Figma). "ⓘ" se dibuja como ícono y este es su nombre accesible. */
export const TEXTO_PASAR = 'Pasar';
export const TEXTO_ME_ENCANTA = 'Me encanta';
export const TEXTO_INFO = 'ⓘ';

/** Botón del mazo terminado (DE-1). */
export const TEXTO_VER_DE_NUEVO = 'Ver de nuevo';

/** Botón de los errores de conexión (DE-6). */
export const TEXTO_REINTENTAR = 'Reintentar';

/** Botón del Detalle (RF-28, literal del SRS; D-30). */
export const TEXTO_QUIERO_ADOPTARLO = '¡Quiero adoptarlo!';

/** Ícono de usuario del encabezado: lleva a Mi perfil (02 §4.2). Es su nombre accesible. */
export const TEXTO_MI_PERFIL = 'Mi perfil';

/** Etiquetas del Detalle (RF-28 los datos, Figma las etiquetas). */
export const ETIQUETAS_DETALLE = {
  especie: 'Especie',
  edad: 'Edad',
  tamano: 'Tamaño',
  cuidados: 'Cuidados de salud',
  vacunado: 'Vacunado',
  esterilizado: 'Esterilizado',
  albergue: 'Albergue',
} as const;

/** Especie como se lee en pantalla: 'perro' → "Perro" y 'gato' → "Gato" (§6). */
export const NOMBRE_ESPECIE: Readonly<Record<Especie, string>> = {
  perro: 'Perro',
  gato: 'Gato',
};

/** Recibe el % del motor. Devuelve "{n} % compatible" (RF-03, RF-10). */
export function textoPorcentaje(porcentaje: number): string {
  return `${porcentaje} % compatible`;
}

/** Recibe el nombre del animal. Devuelve el título del Detalle, "Conoce a {nombre}" (Figma). */
export function textoConoceA(nombre: string): string {
  return `Conoce a ${nombre}`;
}
