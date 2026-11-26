/**
 * Textos de Mis solicitudes (spec F-06 §3.1, flujo D, MS-10).
 *
 * Son textos de Figma confirmados por la PO (PO-21). El estado de cada
 * solicitud ("Pendiente", "Pre-aprobada", "Rechazada") no va aquí: se
 * muestra el valor de `estado` tal como está guardado (RF-27, 03 §6).
 * Los mensajes de vacío y de error están en src/compartido/mensajes.ts.
 */

const TEXTOS_MIS_SOLICITUDES = {
  /** Encabezado, junto a la huella, y nombre de la pestaña (Figma). */
  encabezado: 'Mis solicitudes',
  /** Debajo de la píldora, solo con "Pre-aprobada" (Figma, PO-21). */
  teContactara: 'El albergue te contactará para conocerse.',
  /** Debajo de la lista (Figma, PO-21). */
  cadaPaso: 'Cada paso te acerca a su hogar.',
} as const;

export default TEXTOS_MIS_SOLICITUDES;
