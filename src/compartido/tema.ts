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
  /**
   * Los siguientes son de F-13 (decisión del equipo; no está en el SRS).
   * "Un hogar para:" y "✕ Rechazada" del Detalle de solicitud (AF-7, AF-14).
   */
  subtitulo: 18,
  /** Nombre del refugio arriba y % dentro del círculo de la tarjeta (AF-7, AF-11). */
  destacado: 20,
  /** "¡Hola, {nombre}!" de Mi perfil (AF-1). */
  saludo: 26,
  /** % dentro del círculo del Detalle de solicitud (AF-11). */
  porcentajeDetalle: 28,
  /** Nombre del animal en el encabezado de sus solicitudes (AF-7). */
  nombreGrande: 32,
} as const;

/**
 * Fondos con transparencia (decisión del equipo; no está en el SRS). Van
 * aparte de `COLORES` porque no son colores nuevos: son colores de la paleta
 * con opacidad. F-13 AF-15 quitó `contenedor` (F-12 AE-11): los contenedores
 * de Nueva mascota vuelven a crema con borde.
 */
export const FONDOS = {
  /** Píldora "N solicitudes nuevas": azul marino (#25314C) al 15 % (F-13 AF-10). */
  nuevas: 'rgba(37, 49, 76, 0.15)',
  /** Círculo del % cuando es "No Apto": azul grisáceo (#A1B2D0) al 50 % (F-13 AF-11). */
  noApto: 'rgba(161, 178, 208, 0.5)',
  /** Velo detrás del modal "¿Quieres cerrar sesión?": azul marino (#25314C) al 40 % (F-13 AF-17). */
  velo: 'rgba(37, 49, 76, 0.4)',
} as const;

/**
 * Opacidad de una tarjeta de solicitud "Rechazada" (F-13 AF-14, decisión del
 * equipo; no está en el SRS): se ve atenuada, pero se sigue leyendo.
 */
export const OPACIDAD_ATENUADA = 0.6;

/**
 * Diámetros de los círculos de F-13, en px (decisión del equipo; no está en
 * el SRS). Se dibujan con `RADIOS.pildora` para que queden redondos.
 */
export const CIRCULOS = {
  /** % de la tarjeta de solicitud (AF-11). */
  porcentaje: 64,
  /** % del Detalle de solicitud (AF-11). */
  porcentajeDetalle: 96,
  /** Miniatura del animal en el encabezado de sus solicitudes (AF-7). */
  fotoAnimal: 96,
  /** Cada dato de "Su hogar y sus cuidados" (AF-13). */
  hogar: 72,
  /** Ícono de cámara de "Añadir una foto" (AF-15). */
  camara: 72,
} as const;

/** Puntitos de color de F-13, en px (decisión del equipo; no está en el SRS). */
export const PUNTITOS = {
  /** Estado de Mis solicitudes (AF-3) y píldora de solicitudes nuevas (AF-10). */
  estado: 12,
} as const;

/** Tamaños de íconos de F-13, en px (decisión del equipo; no está en el SRS). */
export const ICONOS = {
  /** Íconos crema de "Su hogar y sus cuidados" (AF-13). */
  hogar: 32,
  /** `camera-plus` de "Añadir una foto" (AF-15). */
  camara: 36,
} as const;

/** Alto mínimo de un enlace tocable, como "Ver solicitud ›" (F-13 AF-8). */
export const AREA_TOQUE = 44;

/** Alto de la píldora "✕ Rechazada" del Detalle de solicitud (F-13 AF-14). */
export const ALTO_PILDORA_GRANDE = 40;

/** Margen lateral de las tarjetas de solicitud del albergue (F-13 AF-12; antes 24). */
export const MARGEN_TARJETA_SOLICITUD = 16;

/**
 * Separación entre el encabezado del animal y el bloque vacío de "Solicitudes
 * de un animal" sin solicitudes (F-13 AF-22).
 */
export const SEPARACION_VACIA = 40;

/**
 * Ancho del logo grande de Garritas, el de Selección de Rol (F-11 §4.1). F-13
 * AF-21 lo usa también en "Ingresa a tu cuenta". El alto sale de su proporción.
 */
export const ANCHO_LOGO = 240;

/** Proporción del logo (580 : 456). Recibe el ancho y devuelve el alto. */
export function altoLogo(ancho: number): number {
  return Math.round((ancho * 456) / 580);
}

export type NombreColor = keyof typeof COLORES;
