/**
 * Recuperar el avance al abrir el cuestionario (spec F-04: RN-06 a RN-08,
 * flujos A1 a A3, A6 y A7; RF-16).
 *
 * Analogía: es el separador de libro. Hay dos separadores, uno en el
 * teléfono (borrador) y otro en Firestore. Al abrir el libro se usa el que
 * se movió más recientemente, y se decide qué aviso poner en la página.
 *
 * Función pura: la pantalla le pasa lo que leyó del teléfono y de
 * Firestore, y esta función decide en qué pregunta empezar y qué mensaje
 * mostrar. No lee nada por su cuenta.
 */
import type { IdPregunta, Respuestas } from '../../matchmaking';
import MENSAJES from '../../compartido/mensajes';
import { limpiarRespuestas, primeraSinResponder } from './avance';

/** Lo que se guarda en el teléfono en cada toque (RF-16, §4). */
export interface AvanceGuardado {
  respuestas: Respuestas;
  /** Milisegundos desde 1970, con la hora del teléfono. */
  actualizadoEn: number;
}

/** Lo que se pudo leer de `cuestionarios/{uid}` al abrir el cuestionario. */
export type LecturaRemota =
  | { estado: 'sin-conexion' }
  | { estado: 'no-existe' }
  | {
      estado: 'existe';
      respuestas: Respuestas;
      completo: boolean;
      /** `null` si Firestore aún no confirma la hora del servidor. */
      actualizadoEn: number | null;
    };

/** Qué debe hacer la pantalla del cuestionario al abrirse. */
export type Inicio =
  | { accion: 'ir-a-descubrir' }
  | {
      accion: 'mostrar';
      respuestas: Respuestas;
      preguntaInicial: IdPregunta;
      /** Mensaje literal arriba de la pregunta, o `null` si no lleva. */
      mensaje: string | null;
      /** RN-08: crear `cuestionarios/{uid}` porque es la primera vez. */
      crearDocumento: boolean;
    };

/** La última pregunta siempre aplica: ahí aparece "Ver mi perfil Garritas". */
const ULTIMA_PREGUNTA: IdPregunta = 'p25';

/**
 * RN-07: elige el avance más reciente entre el teléfono y Firestore.
 * Sin conexión, usa el del teléfono. Devuelve `{}` si no hay ninguno.
 */
export function elegirRespuestas(local: AvanceGuardado | null, remota: LecturaRemota): Respuestas {
  const remotaUsable = remota.estado === 'existe' ? remota : null;
  if (!local) {
    return remotaUsable ? remotaUsable.respuestas : {};
  }
  if (!remotaUsable) {
    return local.respuestas;
  }
  return (remotaUsable.actualizadoEn ?? 0) > local.actualizadoEn
    ? remotaUsable.respuestas
    : local.respuestas;
}

/**
 * Decide cómo empieza el cuestionario.
 * Recibe el borrador del teléfono, la lectura de Firestore y si el adoptante
 * llegó desde la guarda G-5 (`?aviso=incompleto`).
 * Devuelve `ir-a-descubrir` (ya estaba completo, RN-06) o la pregunta
 * inicial con su mensaje:
 * - G-5 → "Termina tu cuestionario para ver tus matches" (RF-02, A3);
 * - con avance → "Recuperamos tu cuestionario en progreso" (RF-16, A1);
 * - ya empezado y sin avance → "No encontramos tu avance…" (RF-16, A2);
 * - primera vez o sin conexión y sin borrador → sin mensaje (RN-08, A6).
 */
export function decidirInicio(
  local: AvanceGuardado | null,
  remota: LecturaRemota,
  llegoDesdeGuarda: boolean,
): Inicio {
  if (remota.estado === 'existe' && remota.completo) {
    return { accion: 'ir-a-descubrir' };
  }
  const respuestas = limpiarRespuestas(elegirRespuestas(local, remota));
  const hayAvance = Object.keys(respuestas).length > 0;

  let mensaje: string | null = null;
  if (llegoDesdeGuarda) {
    mensaje = MENSAJES.CUESTIONARIO_INCOMPLETO;
  } else if (hayAvance) {
    mensaje = MENSAJES.CUESTIONARIO_RECUPERADO;
  } else if (remota.estado === 'existe') {
    mensaje = MENSAJES.CUESTIONARIO_SIN_AVANCE;
  }

  return {
    accion: 'mostrar',
    respuestas,
    preguntaInicial: primeraSinResponder(respuestas) ?? ULTIMA_PREGUNTA,
    mensaje,
    crearDocumento: remota.estado === 'no-existe',
  };
}
