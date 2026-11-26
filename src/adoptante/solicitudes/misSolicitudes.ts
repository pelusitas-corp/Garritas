/**
 * Orden y estados de Mis solicitudes (spec F-06 RN-02: flujo D, A5 a A7;
 * RF-27; MS-7; 02-navegacion §7).
 *
 * Funciones puras: reciben lo que leyó `useMisSolicitudes` y deciden el
 * orden de las tarjetas y qué estado dibujar, sin Firebase ni pantallas.
 */
import MENSAJES from '../../compartido/mensajes';
import { ESTADO_SOLICITUD } from '../../compartido/modelo';
import type { EstadoSolicitud, Solicitud } from '../../compartido/modelo';
import type { NombreColor } from '../../compartido/tema';
import type { PropsEstado } from '../descubrir/estados';
import { TEXTO_REINTENTAR } from '../descubrir/textos';
import TEXTOS_MIS_SOLICITUDES from './textos';

/** Solicitud del adoptante con el ID de su documento (`solicitudes/{solicitudId}`). */
export type MiSolicitud = Solicitud & { id: string };

/** Lo único que se usa de un `Timestamp` de Firestore para ordenar. */
interface Fecha {
  toMillis: () => number;
}

/** Estado de Mis solicitudes que entrega `useMisSolicitudes`. */
export type EstadoMisSolicitudes =
  | { tipo: 'cargando' }
  /** Ya ordenadas, la más reciente primero (MS-7). */
  | { tipo: 'con-datos'; solicitudes: MiSolicitud[] }
  | { tipo: 'error' }
  | { tipo: 'sin-permiso' };

/** Recibe una fecha (o nada). Devuelve sus milisegundos; sin fecha, 0 (va al final). */
function milisegundos(fecha: Fecha | null | undefined): number {
  return fecha ? fecha.toMillis() : 0;
}

/**
 * MS-7 (RF-27): recibe solicitudes. Devuelve una copia ordenada de la más
 * reciente a la más antigua por `creadaEn`. No cambia la lista original.
 */
export function ordenarMisSolicitudes<T extends { creadaEn: Fecha }>(
  solicitudes: readonly T[],
): T[] {
  return [...solicitudes].sort((a, b) => milisegundos(b.creadaEn) - milisegundos(a.creadaEn));
}

/**
 * Recibe el estado de Mis solicitudes y qué hacer con "Reintentar". Devuelve:
 * - cargando: solo el indicador (02 §7);
 * - error: "Error de conexión, verifica tu conexión a internet" con "Reintentar" (A5);
 * - sin permiso: mensaje de RNF-02 (A6);
 * - sin solicitudes: mensaje de RF-27 no válido (A7);
 * - `null` si hay tarjetas que dibujar.
 */
export function pantallaMisSolicitudes(
  estado: EstadoMisSolicitudes,
  reintentar: () => void,
): PropsEstado | null {
  switch (estado.tipo) {
    case 'cargando':
      return { estado: 'cargando' };
    case 'error':
      return {
        estado: 'error',
        mensaje: MENSAJES.ERROR_CONEXION,
        boton: { texto: TEXTO_REINTENTAR, alPresionar: reintentar },
      };
    case 'sin-permiso':
      return { estado: 'sin-permiso', mensaje: MENSAJES.SIN_PERMISO };
    default:
      return estado.solicitudes.length === 0
        ? { estado: 'vacia', mensaje: MENSAJES.SIN_SOLICITUDES_ADOPTANTE }
        : null;
  }
}

/**
 * Recibe el estado de una solicitud. Devuelve el texto que va debajo de su
 * estado: "El albergue te contactará para conocerse." solo con
 * "Pre-aprobada" (Figma, PO-21); con los demás estados, `null`.
 */
export function apoyoDelEstado(estado: EstadoSolicitud): string | null {
  return estado === ESTADO_SOLICITUD.preAprobada ? TEXTOS_MIS_SOLICITUDES.teContactara : null;
}

/** Colores del puntito del estado: su relleno y su borde (nombres de `tema.ts`). */
export interface ColoresPuntito {
  relleno: NombreColor;
  borde: NombreColor;
}

/**
 * F-13 AF-3 (§4.2, decisión del equipo; no está en el SRS): el estado ya no
 * es píldora, sino texto café con un puntito de color. Recibe el estado y
 * devuelve los colores del puntito:
 * - "Pendiente": crema con borde azul marino;
 * - "Pre-aprobada": menta con borde azul marino;
 * - "Rechazada": café.
 */
export function coloresDelPuntito(estado: EstadoSolicitud): ColoresPuntito {
  switch (estado) {
    case ESTADO_SOLICITUD.pendiente:
      return { relleno: 'crema', borde: 'azulMarino' };
    case ESTADO_SOLICITUD.preAprobada:
      return { relleno: 'menta', borde: 'azulMarino' };
    default:
      return { relleno: 'cafe', borde: 'cafe' };
  }
}

/**
 * F-13 AF-3: "deslizar hacia abajo para actualizar". Recibe con qué prender
 * o apagar el indicador de arriba y la lectura que hay que hacer. Prende el
 * indicador, espera la lectura y lo apaga, aunque la lectura falle (el error
 * de conexión lo muestra la propia lectura). No devuelve nada.
 */
export async function actualizarConIndicador(
  marcarActualizando: (actualizando: boolean) => void,
  leer: () => Promise<void>,
): Promise<void> {
  marcarActualizando(true);
  try {
    await leer();
  } finally {
    marcarActualizando(false);
  }
}
