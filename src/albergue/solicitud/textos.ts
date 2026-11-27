/**
 * Textos de la decisión sobre una solicitud y del Detalle de Solicitud
 * (spec F-08 §3.1).
 *
 * "Pre-aprobar" y "Rechazar" son literales del SRS (RF-05, RF-21); los demás
 * son de Figma (PO-21) o decisión del equipo (PA-1, PA-6, PA-7). Los
 * MENSAJES (ya atendida, pre-adopción en curso, contacto oculto, error y
 * permiso) no van aquí: viven en src/compartido/mensajes.ts (F-08 §5).
 */
import type { ResumenHogar } from '../../compartido/modelo';

/** Las dos decisiones que puede tomar el albergue (RF-05, RF-21). */
export type AccionDecision = 'pre-aprobar' | 'rechazar';

export const TEXTOS_DECISION = {
  /** Botones de la tarjeta, del Detalle y de la confirmación (SRS RF-05 y RF-21). */
  preAprobar: 'Pre-aprobar',
  rechazar: 'Rechazar',
  /** Botón de la confirmación que no guarda nada (PA-1, A1). */
  cancelar: 'Cancelar',
  /** Sección del Detalle (Figma, PA-7). */
  suHogar: 'Su hogar y sus cuidados',
  /** Debajo del contacto ya visible (Figma, PA-6). */
  contactoDesbloqueado: 'Contacto desbloqueado',
  /** Arriba de los botones del Detalle y al final de la lista (Figma, PO-21, PA-12). */
  alPreAprobar: 'Al pre-aprobar, podrás coordinar una visita.',
  /** Abajo del Detalle pre-aprobado (Figma, PO-21, PA-12). */
  coordinaLaVisita: 'Coordina la visita para conocerse.',
  /** "←" del encabezado del Detalle; es su nombre accesible (Figma). */
  atras: '←',
  /** `accessibilityHint` del teléfono, que se toca para llamar (F-12 AE-10). */
  llamar: 'Llamar',
} as const;

/** Etiquetas de "Su hogar y sus cuidados" (Figma, PA-7). */
export const ETIQUETAS_HOGAR = {
  viveEn: 'Vive en',
  tiempoSolo: 'Tiempo solo',
  experiencia: 'Experiencia',
} as const;

/** `p12`: "Menos de 4 hrs" · "De 4 a 8 hrs" · "Más de 8 hrs" (Figma, PA-7). */
export const TEXTO_TIEMPO_SOLO: Readonly<Record<ResumenHogar['p12'], string>> = {
  menosDe4: 'Menos de 4 hrs',
  de4a8: 'De 4 a 8 hrs',
  masDe8: 'Más de 8 hrs',
};

/** `p19`: `yaHeTenido` → "Sí" · `primeraVez` → "No" (Figma, PA-7). */
export const TEXTO_TIENE_EXPERIENCIA: Readonly<Record<ResumenHogar['p19'], string>> = {
  yaHeTenido: 'Sí',
  primeraVez: 'No',
};

/** Recibe el nombre del adoptante. Devuelve el encabezado "Solicitud de {nombre}" (Figma). */
export function textoSolicitudDe(nombreAdoptante: string): string {
  return `Solicitud de ${nombreAdoptante}`;
}

/** Recibe el nombre del animal. Devuelve "Para adoptar a {nombre}" (Figma). */
export function textoParaAdoptarA(nombreAnimal: string): string {
  return `Para adoptar a ${nombreAnimal}`;
}

/**
 * Recibe el teléfono ya con formato (`formatoTelefono` de decision.ts).
 * Devuelve "Tel. 646 000 0001" (Figma, PA-6).
 */
export function textoTelefono(telefono: string): string {
  return `Tel. ${telefono}`;
}

/**
 * Recibe la decisión y el nombre del adoptante. Devuelve la pregunta de la
 * confirmación: "¿Pre-aprobar la solicitud de {nombre}?" o "¿Rechazar la
 * solicitud de {nombre}?" (PA-1).
 */
export function preguntaConfirmacion(accion: AccionDecision, nombreAdoptante: string): string {
  const verbo = accion === 'pre-aprobar' ? TEXTOS_DECISION.preAprobar : TEXTOS_DECISION.rechazar;
  return `¿${verbo} la solicitud de ${nombreAdoptante}?`;
}
