/**
 * Lógica de la decisión del albergue sobre una solicitud y del Detalle de
 * Solicitud (spec F-08, RN-01 a RN-03; PA-6, PA-7, PA-10).
 *
 * Son FUNCIONES PURAS: reciben datos y devuelven un resultado, sin React ni
 * Firebase (solo se importan tipos). `src/firebase/decisionSolicitud.ts`
 * usa `decidirPreAprobacion` y `decidirRechazo` DENTRO de la transacción.
 *
 * Analogía: es la persona que revisa el expediente antes de poner el sello.
 * Mira primero si el expediente sigue "Pendiente" y, para pre-aprobar,
 * después si el animal sigue "Disponible". Si algo no cuadra, no sella y
 * dice por qué.
 */
import MENSAJES from '../../compartido/mensajes';
import { ESTADO_ANIMAL, ESTADO_SOLICITUD } from '../../compartido/modelo';
import type {
  Contacto,
  EstadoAnimal,
  EstadoSolicitud,
  ResumenHogar,
} from '../../compartido/modelo';
import type { LecturaFallida } from '../../firebase/animales';
import type { SolicitudConId } from '../panel/panel';
import { TEXTO_VIVIENDA } from '../panel/textos';
import { ETIQUETAS_HOGAR, TEXTO_TIEMPO_SOLO, TEXTO_TIENE_EXPERIENCIA } from './textos';

// ----- Tipos -----

/** Resultado de pre-aprobar o rechazar (F-08 T-3). */
export type ResultadoDecision =
  'ok' | 'ya-atendida' | 'preadopcion-en-curso' | 'sin-conexion' | 'sin-permiso';

/** Lectura de `solicitudes/{solicitudId}` (src/firebase/decisionSolicitud.ts). */
export type LecturaSolicitud =
  { estado: 'ok'; solicitud: SolicitudConId } | { estado: 'no-existe' } | LecturaFallida;

/** Lectura de `solicitudes/{solicitudId}/privado/contacto` (RF-12). */
export type LecturaContacto =
  { estado: 'ok'; contacto: Contacto } | { estado: 'no-existe' } | LecturaFallida;

/** Cómo se ve el contacto en el Detalle (RF-12; decisión 2 del plan). */
export type VistaContacto =
  /** "Pendiente" o "Rechazada": mensaje de RF-12, sin leer el contacto (A4). */
  | { tipo: 'oculto'; mensaje: string }
  /** "Pre-aprobada" y todavía se lee: indicador en su lugar (§6). */
  | { tipo: 'cargando' }
  /** "Pre-aprobada" y leído: teléfono con formato y correo (PA-6). */
  | { tipo: 'visible'; telefono: string; correo: string }
  /** Falló la lectura después de pre-aprobar, o el contacto no existe. */
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'sin-permiso'; mensaje: string };

/** Lo que dibuja el Detalle de Solicitud (F-08 §6). */
export type PantallaDetalle =
  | { tipo: 'cargando' }
  | { tipo: 'con-datos'; solicitud: SolicitudConId; contacto: VistaContacto }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'sin-permiso'; mensaje: string };

/** Cuándo se lee el contacto: al abrir la pantalla o después de pre-aprobar en ella. */
export type MomentoDetalle = 'al-abrir' | 'despues-de-decidir';

/** Qué se ve en lugar de los botones (PS-10, F-08 flujo principal paso 2). */
export type VistaEstado = 'botones' | 'pre-aprobada' | 'rechazada';

/** Una línea de "Su hogar y sus cuidados" (PA-7). */
export interface LineaHogar {
  clave: keyof typeof ETIQUETAS_HOGAR;
  texto: string;
}

// ----- Decisión (RN-01, RN-03) -----

/**
 * RF-05 y RF-22: recibe la solicitud y el animal tal como están en
 * Firestore (o `null` si no existen). Revisa PRIMERO la solicitud y DESPUÉS
 * el animal (RN-01, 03 §6.2). Devuelve:
 * - `sin-permiso` si falta la solicitud o el animal;
 * - `ya-atendida` si la solicitud ya no está "Pendiente" (RF-05 no válido);
 * - `preadopcion-en-curso` si el animal ya no está "Disponible" (RF-22 no válido);
 * - `ok` si se puede pre-aprobar.
 */
export function decidirPreAprobacion(
  solicitud: { estado: EstadoSolicitud } | null,
  animal: { estado: EstadoAnimal } | null,
): Exclude<ResultadoDecision, 'sin-conexion'> {
  if (!solicitud) {
    return 'sin-permiso';
  }
  if (solicitud.estado !== ESTADO_SOLICITUD.pendiente) {
    return 'ya-atendida';
  }
  if (!animal) {
    return 'sin-permiso';
  }
  return animal.estado === ESTADO_ANIMAL.disponible ? 'ok' : 'preadopcion-en-curso';
}

/**
 * RF-21: recibe la solicitud (o `null`). Devuelve `sin-permiso` si no
 * existe, `ya-atendida` si ya no está "Pendiente" (RF-21 no válido) u `ok`.
 * El estado del animal no importa: con una pre-adopción en curso, las demás
 * solicitudes sí se pueden rechazar (03 §6.2).
 */
export function decidirRechazo(
  solicitud: { estado: EstadoSolicitud } | null,
): 'ok' | 'ya-atendida' | 'sin-permiso' {
  if (!solicitud) {
    return 'sin-permiso';
  }
  return solicitud.estado === ESTADO_SOLICITUD.pendiente ? 'ok' : 'ya-atendida';
}

/**
 * RN-06: recibe el resultado de una decisión. Devuelve el mensaje literal
 * que se muestra junto a los botones, o `null` si salió bien.
 */
export function mensajeDeDecision(resultado: ResultadoDecision): string | null {
  switch (resultado) {
    case 'ya-atendida':
      return MENSAJES.SOLICITUD_YA_ATENDIDA;
    case 'preadopcion-en-curso':
      return MENSAJES.PREADOPCION_EN_CURSO;
    case 'sin-conexion':
      return MENSAJES.ERROR_CONEXION;
    case 'sin-permiso':
      return MENSAJES.SIN_PERMISO;
    default:
      return null;
  }
}

/**
 * PA-10 y A2: recibe el resultado. Devuelve `true` si la pantalla debe volver
 * a leer del servidor (cambió el estado, o ya había cambiado en otro teléfono).
 * Con error de conexión, sin permiso o pre-adopción en curso nada cambió.
 */
export function debeVolverALeer(resultado: ResultadoDecision): boolean {
  return resultado === 'ok' || resultado === 'ya-atendida';
}

/** RN-02: recibe el estado. Devuelve `botones` solo con "Pendiente"; si no, la píldora final. */
export function vistaDelEstado(estado: EstadoSolicitud): VistaEstado {
  if (estado === ESTADO_SOLICITUD.preAprobada) {
    return 'pre-aprobada';
  }
  return estado === ESTADO_SOLICITUD.rechazada ? 'rechazada' : 'botones';
}

// ----- Detalle: contacto y hogar (PA-6, PA-7) -----

/**
 * PA-6: recibe el teléfono guardado. Si son exactamente 10 dígitos, devuelve
 * "646 000 0001" (grupos 3-3-4); si no, lo devuelve tal cual.
 */
export function formatoTelefono(telefono: string): string {
  return /^\d{10}$/.test(telefono)
    ? `${telefono.slice(0, 3)} ${telefono.slice(3, 6)} ${telefono.slice(6)}`
    : telefono;
}

/**
 * PA-7: recibe `resumenHogar`. Devuelve las 3 líneas de "Su hogar y sus
 * cuidados", con la etiqueta y el valor juntos: "Vive en: Casa",
 * "Tiempo solo: Menos de 4 hrs" y "Experiencia: Sí".
 */
export function lineasDelHogar(resumen: ResumenHogar): LineaHogar[] {
  return [
    { clave: 'viveEn', texto: `${ETIQUETAS_HOGAR.viveEn}: ${TEXTO_VIVIENDA[resumen.p2]}` },
    {
      clave: 'tiempoSolo',
      texto: `${ETIQUETAS_HOGAR.tiempoSolo}: ${TEXTO_TIEMPO_SOLO[resumen.p12]}`,
    },
    {
      clave: 'experiencia',
      texto: `${ETIQUETAS_HOGAR.experiencia}: ${TEXTO_TIENE_EXPERIENCIA[resumen.p19]}`,
    },
  ];
}

// ----- Estado del Detalle (G-11, §6) -----

/** Recibe una lectura fallida. Devuelve el estado de pantalla completa que le toca. */
function falloDePantalla(lectura: LecturaFallida): PantallaDetalle {
  return lectura.estado === 'sin-permiso'
    ? { tipo: 'sin-permiso', mensaje: MENSAJES.SIN_PERMISO }
    : { tipo: 'error', mensaje: MENSAJES.ERROR_CONEXION };
}

/** Recibe la lectura del contacto (ya pre-aprobada). Devuelve cómo se ve en su lugar. */
function vistaDeContacto(lectura: LecturaContacto): VistaContacto {
  switch (lectura.estado) {
    case 'ok':
      return {
        tipo: 'visible',
        telefono: formatoTelefono(lectura.contacto.telefono),
        correo: lectura.contacto.correo,
      };
    case 'sin-conexion':
      return { tipo: 'error', mensaje: MENSAJES.ERROR_CONEXION };
    default:
      // Las reglas lo rechazaron, o no existe (decisión 2 del plan).
      return { tipo: 'sin-permiso', mensaje: MENSAJES.SIN_PERMISO };
  }
}

/**
 * Detalle de Solicitud (F-08 §6, A4, A6; G-11; decisión 2 del plan).
 * Recibe el `uid` del albergue, la lectura de la solicitud, la del contacto
 * (si ya se hizo) y el momento (al abrir o después de pre-aprobar).
 * Devuelve:
 * - `sin-permiso` si la solicitud no existe, es de otro albergue o las
 *   reglas la rechazan (A6, G-11);
 * - `error` si falla la red al leer la solicitud (A5);
 * - `con-datos` con la solicitud y su contacto:
 *   - "Pendiente" o "Rechazada": contacto `oculto` con el mensaje de RF-12
 *     (A4; no hay que leerlo);
 *   - "Pre-aprobada" sin lectura del contacto: `cargando` (hay que leerlo);
 *   - "Pre-aprobada" con lectura: `visible`, o su fallo. Si falla AL ABRIR,
 *     se muestra en lugar de toda la pantalla; DESPUÉS de pre-aprobar, solo
 *     en el lugar del contacto. Si no existe, "sin permiso" en su lugar.
 */
export function decidirPantallaDetalle(
  uid: string,
  solicitud: LecturaSolicitud,
  contacto?: LecturaContacto,
  momento: MomentoDetalle = 'al-abrir',
): PantallaDetalle {
  if (solicitud.estado === 'no-existe') {
    return { tipo: 'sin-permiso', mensaje: MENSAJES.SIN_PERMISO };
  }
  if (solicitud.estado !== 'ok') {
    return falloDePantalla(solicitud);
  }
  if (solicitud.solicitud.albergueId !== uid) {
    return { tipo: 'sin-permiso', mensaje: MENSAJES.SIN_PERMISO };
  }
  const datos = solicitud.solicitud;
  if (datos.estado !== ESTADO_SOLICITUD.preAprobada) {
    return {
      tipo: 'con-datos',
      solicitud: datos,
      contacto: { tipo: 'oculto', mensaje: MENSAJES.CONTACTO_OCULTO },
    };
  }
  if (!contacto) {
    return { tipo: 'con-datos', solicitud: datos, contacto: { tipo: 'cargando' } };
  }
  if (
    momento === 'al-abrir' &&
    (contacto.estado === 'sin-conexion' || contacto.estado === 'sin-permiso')
  ) {
    return falloDePantalla(contacto);
  }
  return { tipo: 'con-datos', solicitud: datos, contacto: vistaDeContacto(contacto) };
}
