/**
 * Tema Soft UI de Garritas (arquitectura §8).
 *
 * Único lugar donde viven los colores, la tipografía y los bordes.
 * Las pantallas importan de aquí; nunca escriben un color o un tamaño
 * de borde directamente.
 *
 * La arquitectura define los 5 colores, pero no dice cuál es el fondo,
 * cuál el texto, etc. Por eso aquí se nombran por cómo se ven; el uso de
 * cada uno se toma del prototipo de Figma en cada spec.
 */

/** Paleta Soft UI (arquitectura §8). */
export const COLORES = {
  crema: '#F5EACC',
  cafe: '#4A2E21',
  menta: '#D3F8E2',
  azulGrisaceo: '#A1B2D0',
  azulMarino: '#25314C',
} as const;

/**
 * Tipografía Nunito (@expo-google-fonts/nunito).
 * Cada valor es el nombre con el que se carga la fuente en app/_layout.tsx.
 */
export const FUENTES = {
  regular: 'Nunito_400Regular',
  negrita: 'Nunito_700Bold',
} as const;

/** Radio mínimo de los bordes en Soft UI: 24 px (arquitectura §8). */
export const RADIO_MINIMO = 24;

/** Radios de borde. Todos cumplen el mínimo de 24 px. */
export const RADIOS = {
  /** Tarjetas, campos y contenedores. */
  tarjeta: RADIO_MINIMO,
  /** Tarjetas grandes del prototipo (Descubrir y Detalle de F-03, DE-10). */
  tarjetaGrande: 32,
  /** Botones píldora: un radio tan grande que los extremos quedan redondos. */
  pildora: 999,
} as const;

/**
 * Opacidad de un botón desactivado (F-11 AD-4, decisión del equipo; no está
 * en el SRS): conserva su color, pero se ve desvanecido.
 */
export const OPACIDAD_DESVANECIDO = 0.4;

/**
 * Grosor del borde de los contenedores, en px (F-11 AD-12, decisión del
 * equipo; no está en el SRS). Va aparte de `RADIOS`: es un grosor, no un radio.
 */
export const BORDE = 2;

/**
 * Tamaños de texto mínimos, en px (F-12 AE-1, decisión del equipo; no está
 * en el SRS). Ningún texto de la app baja de `minimo` (apoyo y etiquetas);
 * los datos (vivienda, tiempo solo, experiencia, teléfono, correo, nombre
 * del albergue en las tarjetas y el texto del estado) usan `dato`.
 * `tests/accesibilidad.test.ts` lo revisa en todo `app/` y `src/`.
 */
export const TAMANOS_TEXTO = {
  minimo: 14,
  dato: 16,
} as const;

/**
 * Fondos con transparencia (F-12 AE-11, decisión del equipo; no está en el
 * SRS). Van aparte de `COLORES` porque no son colores nuevos: son colores de
 * la paleta con opacidad.
 */
export const FONDOS = {
  /** Relleno de los contenedores de Nueva mascota: azul grisáceo (#A1B2D0) al 25 %. */
  contenedor: 'rgba(161, 178, 208, 0.25)',
} as const;

export type NombreColor = keyof typeof COLORES;
