/**
 * Mazo de preguntas del cuestionario (spec F-04 §4).
 * Revisa que las tarjetas estén completas y en orden, y que cada opción que
 * cuenta para el % sea una que el motor de F-05 sabe leer.
 */
import { PREGUNTAS } from '../../src/adoptante/cuestionario/preguntas';
import { PREGUNTAS_CON_VALOR } from '../../src/matchmaking/cuestionario';

describe('F-04 §4 · preguntas del cuestionario', () => {
  test('RF-02: hay 25 preguntas, de P1 a P25 y en orden', () => {
    expect(PREGUNTAS).toHaveLength(25);
    PREGUNTAS.forEach((pregunta, indice) => {
      expect(pregunta.numero).toBe(indice + 1);
      expect(pregunta.id).toBe(`p${indice + 1}`);
    });
  });

  test('RF-02: cada pregunta tiene al menos 2 opciones de un toque, sin claves repetidas', () => {
    PREGUNTAS.forEach((pregunta) => {
      const claves = pregunta.opciones.map((opcion) => opcion.clave);
      expect(claves.length).toBeGreaterThanOrEqual(2);
      expect(new Set(claves).size).toBe(claves.length);
    });
  });

  test('D-50: las opciones son exactamente las que el motor F-05 sabe valorar', () => {
    PREGUNTAS_CON_VALOR.forEach((conValor) => {
      const pregunta = PREGUNTAS.find((p) => p.id === conValor.id);
      const claves = pregunta?.opciones.map((opcion) => opcion.clave).sort();
      expect(claves).toEqual(Object.keys(conValor.valores).sort());
    });
  });
});
