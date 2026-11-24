/**
 * Motor de match (spec F-05 §3, flujo "evaluar animales").
 * F-03 lo llama al abrir "Descubrir" con el cuestionario del adoptante y los
 * animales "Disponible" que leyó de Firestore. El motor no lee ni escribe
 * en Firestore y no ordena la lista (ordenar es RF-26, F-03).
 */
import { calcularCosenos, calcularPorcentaje, calcularValoresAnimal, esNoApto } from './calculo';
import { calcularValoresAdoptante } from './cuestionario';
import explicarMatch from './explicacion';
import { pasaFiltros, tienePerfilCompleto } from './filtros';
import type { AnimalParaMatch, Cuestionario, ResultadoMatch } from './tipos';

export type ResultadoEvaluacion =
  { completo: true; resultados: ResultadoMatch[] } | { completo: false };

/**
 * Pasos 1 a 6 del flujo principal:
 * descarta perfiles incompletos (RF-03) y animales que no pasan un filtro
 * (RF-17), y calcula porcentaje (RF-03), "No Apto" (RF-18) y explicación (RF-20).
 * Con el cuestionario sin terminar devuelve `{ completo: false }` (flujo A1).
 */
export function evaluarAnimales(
  cuestionario: Cuestionario,
  animales: readonly AnimalParaMatch[],
): ResultadoEvaluacion {
  const valoresAdoptante = cuestionario.completo
    ? calcularValoresAdoptante(cuestionario.respuestas)
    : null;
  if (valoresAdoptante === null) {
    return { completo: false };
  }
  const resultados = animales
    .filter(tienePerfilCompleto)
    .filter((animal) => pasaFiltros(cuestionario.respuestas, animal))
    .map((animal): ResultadoMatch => {
      const cosenos = calcularCosenos(
        valoresAdoptante,
        calcularValoresAnimal(animal.perfilCompatibilidad),
      );
      const porcentaje = calcularPorcentaje(cosenos);
      return {
        animalId: animal.animalId,
        porcentaje,
        noApto: esNoApto(porcentaje),
        explicacion: explicarMatch(porcentaje, cosenos),
      };
    });
  return { completo: true, resultados };
}
