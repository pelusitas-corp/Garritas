/**
 * Explicación del match para la pantalla "Match" (spec F-05: RN-07, RF-20).
 */
import MENSAJES from '../compartido/mensajes';
import { esNoApto } from './calculo';
import { DIMENSIONES, NOMBRES_DIMENSION, PESOS } from './dimensiones';
import type { Dimension, Explicacion, ValoresPorDimension } from './tipos';

/** Margen para comparar decimales (evita empates falsos por redondeo de la computadora). */
const MARGEN = 1e-9;

/**
 * Ordena las dimensiones por una puntuación. Empates: gana la de mayor peso
 * y, si pesan igual, la que va primero en DIMENSIONES (RN-07).
 */
function ordenarDimensiones(
  puntuacion: (d: Dimension) => number,
  mayorPrimero: boolean,
): Dimension[] {
  return [...DIMENSIONES].sort((d1, d2) => {
    const diferencia = puntuacion(d1) - puntuacion(d2);
    if (Math.abs(diferencia) > MARGEN) {
      return mayorPrimero ? -diferencia : diferencia;
    }
    if (PESOS[d1] !== PESOS[d2]) {
      return PESOS[d2] - PESOS[d1];
    }
    return DIMENSIONES.indexOf(d1) - DIMENSIONES.indexOf(d2);
  });
}

/**
 * RN-07: con 30 % o más, las 3 dimensiones con mayor aporte (peso × coseno).
 * Con menos de 30 %, las 2 con menor coincidencia (coseno más bajo) y el
 * mensaje de RF-20.
 */
export default function explicarMatch(
  porcentaje: number,
  cosenos: ValoresPorDimension,
): Explicacion {
  if (esNoApto(porcentaje)) {
    const menores = ordenarDimensiones((d) => cosenos[d], false).slice(0, 2);
    return {
      tipo: 'menorCoincidencia',
      dimensiones: menores.map((d) => NOMBRES_DIMENSION[d]),
      mensaje: MENSAJES.MASCOTA_PODRIA_NO_ADAPTARSE,
    };
  }
  const mayores = ordenarDimensiones((d) => PESOS[d] * cosenos[d], true).slice(0, 3);
  return {
    tipo: 'mayorAporte',
    dimensiones: mayores.map((d) => NOMBRES_DIMENSION[d]),
  };
}
