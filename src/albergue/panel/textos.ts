/**
 * Textos del panel de solicitudes del albergue (spec F-07 §3.1).
 *
 * Son textos de Figma (D-52, PO-21) y de la spec. Los mensajes de vacía,
 * error y permiso NO van aquí: viven en src/compartido/mensajes.ts (F-07 §5).
 */
import MENSAJES from '../../compartido/mensajes';
import type { ResumenHogar } from '../../compartido/modelo';
import { TEXTOS_DECISION } from '../solicitud/textos';

export const TEXTOS_PANEL = {
  /** Encabezado de las dos pantallas y nombre de la pestaña (N-1). */
  encabezado: 'Solicitudes',
  /** Título de la lista (Figma, D-52, PO-21). */
  tusAnimales: 'Tus animales',
  /**
   * Encima del nombre del animal en "Solicitudes de un animal" (F-13 AF-7;
   * reemplaza el título "Un hogar para {nombre}").
   */
  unHogarPara: 'Un hogar para:',
  /** Indicador del orden; no es un botón (PS-8). */
  mayorCompatibilidad: 'Mayor compatibilidad',
  /** Debajo del porcentaje de cada tarjeta (Figma). */
  compatible: 'compatible',
  /** Botón del ícono de usuario (F-01 RN-08, N-3, D-52 I1). También es el nombre accesible del ícono. */
  cerrarSesion: 'Cerrar sesión',
  /** Flecha del encabezado de un animal; es su nombre accesible (Figma). */
  atras: '←',
  /** Separador del resumen del hogar y de "compatible · No Apto" (Figma). */
  separador: ' · ',
  /**
   * Al final de la lista, solo si queda alguna "Pendiente" (F-08 PA-12 y
   * decisión del plan de F-08). Es el mismo texto del Detalle.
   */
  alPreAprobar: TEXTOS_DECISION.alPreAprobar,
} as const;

/**
 * Palabras de los conteos (Figma, D-52, PO-21, PS-3 y PS-7). Las arma
 * `textoConteo` de panel.ts: "1 solicitud", "0 solicitudes", "1 solicitud nueva"…
 */
export const PALABRAS_CONTEO = {
  solicitudes: { singular: 'solicitud', plural: 'solicitudes' },
  nuevas: { singular: 'solicitud nueva', plural: 'solicitudes nuevas' },
} as const;

/** `p2`: "Casa" · "Departamento" (Figma y texto de la opción, PS-9). */
export const TEXTO_VIVIENDA: Readonly<Record<ResumenHogar['p2'], string>> = {
  casa: 'Casa',
  departamento: 'Departamento',
};

/** `p19`: "tiene experiencia" · "primera vez" (Figma y texto de la opción, PS-9). */
export const TEXTO_EXPERIENCIA: Readonly<Record<ResumenHogar['p19'], string>> = {
  yaHeTenido: 'tiene experiencia',
  primeraVez: 'primera vez',
};

/** Recibe el porcentaje guardado. Devuelve "{porcentaje}%", sin espacio (Figma). */
export function textoPorcentaje(porcentaje: number): string {
  return `${porcentaje}%`;
}

/**
 * Recibe el campo guardado `noApto` (RN-02: no se recalcula). Devuelve
 * "compatible" o, si es `true`, "compatible · No Apto" (RF-18).
 */
export function textoCompatible(noApto: boolean): string {
  return noApto
    ? `${TEXTOS_PANEL.compatible}${TEXTOS_PANEL.separador}${MENSAJES.ETIQUETA_NO_APTO}`
    : TEXTOS_PANEL.compatible;
}
