/**
 * Qué estado dibuja Descubrir o el Detalle (spec F-03 §6; 02-navegacion §7).
 * Decisión 3 del plan de F-03: se separa de las pantallas para probar con
 * Jest los mensajes de RF-10, RF-26, RNF-01, RNF-02 y DE-1 sin dibujar nada.
 *
 * Función pura: recibe el estado del hook y devuelve las props de
 * `EstadoPantalla`, o `null` cuando hay que dibujar el mazo o el animal.
 */
import MENSAJES from '../../compartido/mensajes';
import type { TipoEstado } from '../../compartido/EstadoPantalla';
import type { EstadoMazo } from './mazo';
import { mazoTerminado } from './mazo';
import { TEXTO_REINTENTAR, TEXTO_VER_DE_NUEVO } from './textos';

/** Estado de Descubrir que entrega `useDescubrir`. */
export type EstadoDescubrir =
  | { tipo: 'cargando' }
  | { tipo: 'con-datos'; mazo: EstadoMazo }
  | { tipo: 'error' }
  | { tipo: 'sin-permiso' };

/** Lo que recibe `EstadoPantalla`. */
export interface PropsEstado {
  estado: TipoEstado;
  mensaje?: string;
  mensajeSiTarda?: string;
  boton?: { texto: string; alPresionar: () => void };
}

/** Acciones de los botones de los estados. */
export interface AccionesEstado {
  reintentar: () => void;
  verDeNuevo: () => void;
}

/**
 * Recibe el estado de Descubrir y las acciones de sus botones. Devuelve:
 * - cargando: indicador y, después de 3 s, el mensaje de RNF-01;
 * - error: mensaje de RF-10 con "Reintentar" (A3, DE-6);
 * - sin permiso: mensaje de RNF-02 (A6);
 * - mazo vacío: mensaje de RF-26 (A1);
 * - mazo terminado: `MAZO_TERMINADO` con "Ver de nuevo" (A2, DE-1, RN-05);
 * - `null` si hay una tarjeta que mostrar.
 */
export function pantallaDescubrir(
  estado: EstadoDescubrir,
  acciones: AccionesEstado,
): PropsEstado | null {
  switch (estado.tipo) {
    case 'cargando':
      return { estado: 'cargando', mensajeSiTarda: MENSAJES.CALCULANDO_COMPATIBILIDAD };
    case 'error':
      return {
        estado: 'error',
        mensaje: MENSAJES.ERROR_CARGAR_MASCOTAS,
        boton: { texto: TEXTO_REINTENTAR, alPresionar: acciones.reintentar },
      };
    case 'sin-permiso':
      return { estado: 'sin-permiso', mensaje: MENSAJES.SIN_PERMISO };
    default:
      if (estado.mazo.tarjetas.length === 0) {
        return { estado: 'vacia', mensaje: MENSAJES.SIN_MASCOTAS_COMPATIBLES };
      }
      if (mazoTerminado(estado.mazo)) {
        return {
          estado: 'vacia',
          mensaje: MENSAJES.MAZO_TERMINADO,
          boton: { texto: TEXTO_VER_DE_NUEVO, alPresionar: acciones.verDeNuevo },
        };
      }
      return null;
  }
}

/** Estado del Detalle que entrega `useDetalleAnimal` (sin el caso G-8, que redirige). */
export type EstadoDetalle = 'cargando' | 'con-datos' | 'error' | 'sin-permiso';

/**
 * Recibe el estado del Detalle y qué hacer con "Reintentar". Devuelve:
 * - cargando: solo el indicador (02 §7);
 * - error: "Error de conexión, verifica tu conexión a internet" con "Reintentar" (A5, DE-6);
 * - sin permiso: mensaje de RNF-02 (A6);
 * - `null` si hay animal que mostrar.
 */
export function pantallaDetalle(estado: EstadoDetalle, reintentar: () => void): PropsEstado | null {
  switch (estado) {
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
      return null;
  }
}
