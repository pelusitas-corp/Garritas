/**
 * Avance del cuestionario (spec F-04 §5: RN-02 a RN-05 y RN-09).
 *
 * Analogía: es el entrevistador que sostiene el mazo de `preguntas.ts`.
 * Mira las respuestas que ya hay y decide qué tarjeta va después, cuál
 * estaba antes, en qué número vas y si ya puedes terminar. Para saber si
 * una tarjeta se salta, le pregunta al motor F-05 (`preguntaAplica`, RF-15).
 *
 * Todas son funciones puras: reciben las respuestas y devuelven un
 * resultado, sin Firebase ni pantallas. Por eso se prueban con Jest.
 */
import { preguntaAplica } from '../../matchmaking';
import type { IdPregunta, Respuestas } from '../../matchmaking';
import { PREGUNTAS } from './preguntas';
import type { Pregunta } from './preguntas';

/**
 * RN-02 (RF-15): las preguntas que aplican con las respuestas actuales,
 * en orden P1 → P25. Recibe las respuestas; devuelve entre 19 y 25 preguntas.
 */
export function preguntasQueAplican(respuestas: Respuestas): Pregunta[] {
  return PREGUNTAS.filter((pregunta) => preguntaAplica(pregunta.id, respuestas));
}

/** Busca una pregunta por su id (`p1` a `p25`). */
export function buscarPregunta(id: IdPregunta): Pregunta {
  const pregunta = PREGUNTAS.find((p) => p.id === id);
  if (!pregunta) {
    throw new Error(`No existe la pregunta ${id}`);
  }
  return pregunta;
}

/**
 * RN-05 y RF-16: la primera pregunta que aplica y no tiene respuesta.
 * Devuelve su id, o `null` si ya están todas respondidas.
 */
export function primeraSinResponder(respuestas: Respuestas): IdPregunta | null {
  const pendiente = preguntasQueAplican(respuestas).find(
    (pregunta) => respuestas[pregunta.id] === undefined,
  );
  return pendiente ? pendiente.id : null;
}

/**
 * RN-03: la pregunta que aplica justo después de `actual` (aunque ya tenga
 * respuesta). Devuelve `null` si `actual` es la última que aplica.
 */
export function siguientePregunta(actual: IdPregunta, respuestas: Respuestas): IdPregunta | null {
  const actualNumero = buscarPregunta(actual).numero;
  const siguiente = preguntasQueAplican(respuestas).find((p) => p.numero > actualNumero);
  return siguiente ? siguiente.id : null;
}

/**
 * RN-04: la pregunta que aplica justo antes de `actual` (botón "←").
 * Devuelve `null` en la primera pregunta.
 */
export function preguntaAnterior(actual: IdPregunta, respuestas: Respuestas): IdPregunta | null {
  const actualNumero = buscarPregunta(actual).numero;
  const anteriores = preguntasQueAplican(respuestas).filter((p) => p.numero < actualNumero);
  return anteriores.length > 0 ? anteriores[anteriores.length - 1].id : null;
}

/**
 * RN-09: "Pregunta N de M". `total` (M) son las que aplican con las
 * respuestas actuales; `numero` (N) es la posición de `actual` entre ellas.
 */
export function posicionDe(
  actual: IdPregunta,
  respuestas: Respuestas,
): { numero: number; total: number } {
  const aplican = preguntasQueAplican(respuestas);
  return {
    numero: aplican.findIndex((p) => p.id === actual) + 1,
    total: aplican.length,
  };
}

/**
 * RN-04: quita las respuestas de las preguntas que ya no aplican (por
 * ejemplo, el permiso del dueño si la vivienda pasó a "Propia").
 * Devuelve unas respuestas nuevas; no modifica las que recibe.
 * (No copia `undefined`: Firestore no acepta campos con `undefined`.)
 */
export function limpiarRespuestas(respuestas: Respuestas): Respuestas {
  const quedan = new Set<string>(preguntasQueAplican(respuestas).map((p) => p.id));
  return Object.fromEntries(
    Object.entries(respuestas).filter(
      ([id, respuesta]) => quedan.has(id) && respuesta !== undefined,
    ),
  );
}

/**
 * RN-01 y RN-04: guarda el toque del adoptante. Recibe las respuestas,
 * la pregunta y la opción tocada; devuelve las respuestas nuevas, ya
 * limpias de las preguntas que dejaron de aplicar.
 */
export function responder<P extends IdPregunta>(
  respuestas: Respuestas,
  id: P,
  clave: NonNullable<Respuestas[P]>,
): Respuestas {
  const nuevas: Respuestas = { ...respuestas };
  nuevas[id] = clave;
  return limpiarRespuestas(nuevas);
}

/**
 * RN-05 (RF-02, RF-15): se puede terminar solo si todas las preguntas que
 * aplican tienen respuesta. Es lo que muestra "Ver mi perfil Garritas".
 */
export function puedeTerminar(respuestas: Respuestas): boolean {
  return primeraSinResponder(respuestas) === null;
}
