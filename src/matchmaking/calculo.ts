/**
 * Porcentaje de compatibilidad con similitud de coseno ponderada
 * (spec F-05: RN-05 y RN-06, RF-03 y RF-18).
 *
 * Analogía: cada dimensión es la manecilla de un reloj que se mueve en
 * medio círculo (0 a un lado, 1 al lado contrario). El coseno mide qué tan
 * igual apuntan la manecilla del adoptante y la del animal: 1 si apuntan
 * igual, 0 en ángulo recto y −1 si apuntan al lado contrario.
 */
import { DIMENSIONES, PESOS, VALORES_ANIMAL } from './dimensiones';
import type { Dimension, PerfilCompatibilidad, ValoresPorDimension } from './tipos';

/** Límite de RF-18: con menos de este porcentaje la solicitud es "No Apto". */
export const UMBRAL_NO_APTO = 30;

/** RN-04: convierte las opciones del animal a números (0, 0.5 o 1). */
export function calcularValoresAnimal(perfil: PerfilCompatibilidad): ValoresPorDimension {
  return {
    energia: VALORES_ANIMAL.energia[perfil.energia],
    espacio: VALORES_ANIMAL.espacio[perfil.espacio],
    tiempo: VALORES_ANIMAL.tiempo[perfil.tiempo],
    convivencia: VALORES_ANIMAL.convivencia[perfil.convivencia],
    temperamento: VALORES_ANIMAL.temperamento[perfil.temperamento],
    experiencia: VALORES_ANIMAL.experiencia[perfil.experiencia],
  };
}

/** RN-05 paso 1: diferencia entre adoptante (a) y animal (n) en una dimensión. */
export function calcularDiferencia(dimension: Dimension, a: number, n: number): number {
  switch (dimension) {
    case 'energia':
    case 'temperamento':
      return Math.abs(a - n);
    case 'convivencia':
      // El animal tolera más de lo que hay en casa: sin pérdida.
      return Math.max(0, a - n);
    default:
      // Espacio, Tiempo y Experiencia: "lo que sobra no resta".
      return Math.max(0, n - a);
  }
}

/** RN-05 paso 2: coseno de cada dimensión, `cos(π × diferencia)`. */
export function calcularCosenos(
  adoptante: ValoresPorDimension,
  animal: ValoresPorDimension,
): ValoresPorDimension {
  const coseno = (d: Dimension): number =>
    Math.cos(Math.PI * calcularDiferencia(d, adoptante[d], animal[d]));
  return {
    energia: coseno('energia'),
    espacio: coseno('espacio'),
    tiempo: coseno('tiempo'),
    convivencia: coseno('convivencia'),
    temperamento: coseno('temperamento'),
    experiencia: coseno('experiencia'),
  };
}

/** RN-05 pasos 3 y 4: `redondear(50 × (1 + Σ peso × coseno))`, entero de 0 a 100. */
export function calcularPorcentaje(cosenos: ValoresPorDimension): number {
  const cosenoPonderado = DIMENSIONES.reduce(
    (suma, dimension) => suma + PESOS[dimension] * cosenos[dimension],
    0,
  );
  const porcentaje = Math.round(50 * (1 + cosenoPonderado));
  return Math.min(100, Math.max(0, porcentaje));
}

/** RN-06 (RF-18): `true` si el porcentaje es menor a 30. */
export function esNoApto(porcentaje: number): boolean {
  return porcentaje < UMBRAL_NO_APTO;
}
