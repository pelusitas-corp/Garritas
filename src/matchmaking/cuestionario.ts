/**
 * Valores del adoptante por dimensión (spec F-05: RN-03).
 *
 * Cada opción del cuestionario vale 0, 0.5 o 1. El valor del adoptante en
 * una dimensión es el promedio, sin redondear, de sus preguntas que aplican.
 */
import { DIMENSIONES } from './dimensiones';
import type { Dimension, IdPregunta, Respuestas, Valor, ValoresPorDimension } from './tipos';

/** Las preguntas que solo sirven para filtros (P1, P3, P4, P7) no están aquí. */
type PreguntaConValor = {
  [P in IdPregunta]: {
    id: P;
    dimension: Dimension;
    /** `null` = la opción no cuenta ("Me adapto a cualquiera"). */
    valores: Record<NonNullable<Respuestas[P]>, Valor | null>;
  };
}[IdPregunta];

/** Tabla de ESTADO §6.3 (spec F-05 §5). */
export const PREGUNTAS_CON_VALOR: readonly PreguntaConValor[] = [
  { id: 'p2', dimension: 'espacio', valores: { casa: 1, departamento: 0 } },
  { id: 'p5', dimension: 'espacio', valores: { si: 1, no: 0 } },
  { id: 'p6', dimension: 'espacio', valores: { pequeno: 0, mediano: 0.5, grande: 1 } },
  { id: 'p8', dimension: 'convivencia', valores: { si: 1, no: 0 } },
  { id: 'p9', dimension: 'convivencia', valores: { menosDe6: 1, seisOMas: 0.5 } },
  { id: 'p10', dimension: 'convivencia', valores: { si: 1, no: 0 } },
  { id: 'p11', dimension: 'convivencia', valores: { si: 0, noSe: 0.5, no: 1 } },
  { id: 'p12', dimension: 'tiempo', valores: { menosDe4: 1, de4a8: 0.5, masDe8: 0 } },
  { id: 'p13', dimension: 'tiempo', valores: { si: 1, no: 0 } },
  { id: 'p14', dimension: 'tiempo', valores: { seguido: 0, aVeces: 0.5, casiNunca: 1 } },
  { id: 'p15', dimension: 'energia', valores: { una: 0, dos: 0.5, tresOMas: 1 } },
  { id: 'p16', dimension: 'energia', valores: { min15: 0, min30: 0.5, horaOMas: 1 } },
  { id: 'p17', dimension: 'energia', valores: { enCasa: 0, unPocoDeTodo: 0.5, aireLibre: 1 } },
  { id: 'p18', dimension: 'energia', valores: { casiNunca: 0, aVeces: 0.5, seguido: 1 } },
  { id: 'p19', dimension: 'experiencia', valores: { primeraVez: 0, yaHeTenido: 1 } },
  { id: 'p20', dimension: 'experiencia', valores: { si: 1, no: 0 } },
  {
    id: 'p21',
    dimension: 'experiencia',
    valores: { paciencia: 1, consejo: 0.5, preocupacion: 0 },
  },
  { id: 'p22', dimension: 'temperamento', valores: { tranquila: 0, normal: 0.5, muyMovida: 1 } },
  { id: 'p23', dimension: 'temperamento', valores: { casiNunca: 0, aVeces: 0.5, seguido: 1 } },
  { id: 'p24', dimension: 'temperamento', valores: { poco: 0, normal: 0.5, mucho: 1 } },
  {
    id: 'p25',
    dimension: 'temperamento',
    valores: { tranquila: 0, juguetona: 0.5, sociable: 1, meAdapto: null },
  },
];

/**
 * Saltos de RF-15 (RN-03): dice si una pregunta aplica según las respuestas
 * anteriores. Las preguntas sin salto siempre aplican.
 */
export function preguntaAplica(id: IdPregunta, respuestas: Respuestas): boolean {
  switch (id) {
    case 'p4':
      return respuestas.p3 === 'rentada';
    case 'p5':
      return respuestas.p2 === 'casa';
    case 'p6':
      return preguntaAplica('p5', respuestas) && respuestas.p5 === 'si';
    case 'p7':
      return respuestas.p1 === 'gatos' || respuestas.p1 === 'ambos';
    case 'p9':
      return respuestas.p8 === 'si';
    case 'p11':
      return respuestas.p10 === 'si';
    default:
      return true;
  }
}

/** Valor de una respuesta, o `null` si no aplica, no se respondió o no cuenta. */
function valorDeRespuesta(pregunta: PreguntaConValor, respuestas: Respuestas): Valor | null {
  const respuesta = respuestas[pregunta.id];
  if (respuesta === undefined || !preguntaAplica(pregunta.id, respuestas)) {
    return null;
  }
  const valores: Record<string, Valor | null> = pregunta.valores;
  return valores[respuesta] ?? null;
}

/**
 * RN-03: valor del adoptante en cada dimensión (promedio sin redondear).
 * Devuelve `null` si alguna dimensión se quedó sin respuestas que cuenten.
 */
export function calcularValoresAdoptante(respuestas: Respuestas): ValoresPorDimension | null {
  const sumas: Record<Dimension, number[]> = {
    energia: [],
    espacio: [],
    tiempo: [],
    convivencia: [],
    temperamento: [],
    experiencia: [],
  };
  PREGUNTAS_CON_VALOR.forEach((pregunta) => {
    const valor = valorDeRespuesta(pregunta, respuestas);
    if (valor !== null) {
      sumas[pregunta.dimension].push(valor);
    }
  });
  if (DIMENSIONES.some((dimension) => sumas[dimension].length === 0)) {
    return null;
  }
  const promedio = (lista: number[]): number => lista.reduce((a, b) => a + b, 0) / lista.length;
  return {
    energia: promedio(sumas.energia),
    espacio: promedio(sumas.espacio),
    tiempo: promedio(sumas.tiempo),
    convivencia: promedio(sumas.convivencia),
    temperamento: promedio(sumas.temperamento),
    experiencia: promedio(sumas.experiencia),
  };
}
