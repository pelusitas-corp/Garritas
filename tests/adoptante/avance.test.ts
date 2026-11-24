/**
 * Avance del cuestionario (spec F-04 §5 y §10).
 * Los adoptantes A y B son los de ESTADO §6.6 (tests/matchmaking/datos.ts).
 */
import {
  posicionDe,
  preguntaAnterior,
  primeraSinResponder,
  puedeTerminar,
  responder,
  siguientePregunta,
} from '../../src/adoptante/cuestionario/avance';
import type { IdPregunta, Respuestas } from '../../src/matchmaking';
import { ADOPTANTE_A, ADOPTANTE_B } from '../matchmaking/datos';

/**
 * Simula al adoptante tocando, desde P1, la opción que dice `objetivo` en
 * cada pregunta que le aparece. Devuelve las preguntas que vio y sus respuestas.
 */
function responderTodo(objetivo: Respuestas): { vistas: IdPregunta[]; respuestas: Respuestas } {
  const vistas: IdPregunta[] = [];
  let respuestas: Respuestas = {};
  let actual: IdPregunta | null = 'p1';
  while (actual !== null) {
    const clave = objetivo[actual];
    if (clave === undefined) {
      throw new Error(`El adoptante de prueba no tiene respuesta para ${actual}`);
    }
    vistas.push(actual);
    respuestas = responder(respuestas, actual, clave);
    actual = siguientePregunta(actual, respuestas);
  }
  return { vistas, respuestas };
}

describe('F-04 · CA-01 · RF-02 válido', () => {
  test('RF-02 válido: el adoptante A responde con un toque cada pregunta y ve 22 en orden', () => {
    const { vistas, respuestas } = responderTodo(ADOPTANTE_A.respuestas);
    expect(vistas).toEqual(Object.keys(ADOPTANTE_A.respuestas));
    expect(vistas).toHaveLength(22);
    expect(respuestas).toEqual(ADOPTANTE_A.respuestas);
  });

  test('RF-02 válido: al responder la última aparece "Ver mi perfil Garritas" (RN-05)', () => {
    const { respuestas } = responderTodo(ADOPTANTE_A.respuestas);
    expect(puedeTerminar(respuestas)).toBe(true);
    expect(primeraSinResponder(respuestas)).toBeNull();
  });

  test('RN-09: el adoptante A ve "Pregunta 22 de 22" y el B "Pregunta 21 de 21" al final', () => {
    expect(posicionDe('p25', ADOPTANTE_A.respuestas)).toEqual({ numero: 22, total: 22 });
    expect(responderTodo(ADOPTANTE_B.respuestas).vistas).toHaveLength(21);
    expect(posicionDe('p25', ADOPTANTE_B.respuestas)).toEqual({ numero: 21, total: 21 });
  });
});

describe('F-04 · RN-05 · terminar', () => {
  test('RF-02: con 10 preguntas respondidas no se puede terminar y sigue la primera sin responder', () => {
    let respuestas: Respuestas = {};
    const { vistas } = responderTodo(ADOPTANTE_A.respuestas);
    vistas.slice(0, 10).forEach((id) => {
      const clave = ADOPTANTE_A.respuestas[id];
      if (clave !== undefined) {
        respuestas = responder(respuestas, id, clave);
      }
    });
    expect(puedeTerminar(respuestas)).toBe(false);
    expect(primeraSinResponder(respuestas)).toBe(vistas[10]);
  });

  test('RF-02: sin respuestas, la primera pregunta es P1', () => {
    expect(primeraSinResponder({})).toBe('p1');
  });
});

describe('F-04 · CA-03 · RF-15 válido', () => {
  test('RF-15 válido: con vivienda "Propia" se omite P4 y sigue P5 si vive en casa', () => {
    const respuestas = responder({ p1: 'perros', p2: 'casa' }, 'p3', 'propia');
    expect(siguientePregunta('p3', respuestas)).toBe('p5');
  });

  test('RF-15 válido: con "Propia" y departamento sigue P7 (gatos o ambos) o P8 (perros)', () => {
    expect(siguientePregunta('p3', { p1: 'ambos', p2: 'departamento', p3: 'propia' })).toBe('p7');
    expect(siguientePregunta('p3', { p1: 'perros', p2: 'departamento', p3: 'propia' })).toBe('p8');
  });

  test('RF-15 válido: "←" desde P5 regresa a P3 si P4 no aplica', () => {
    expect(preguntaAnterior('p5', ADOPTANTE_A.respuestas)).toBe('p3');
    expect(preguntaAnterior('p1', ADOPTANTE_A.respuestas)).toBeNull();
  });
});

describe('F-04 · CA-04 · RF-15 no válido', () => {
  test('RF-15 no válido: al cambiar "Propia" por "Rentada" vuelve a pedir P4 y no deja terminar', () => {
    const antes = ADOPTANTE_A.respuestas;
    const despues = responder(antes, 'p3', 'rentada');
    expect(siguientePregunta('p3', despues)).toBe('p4');
    expect(posicionDe('p25', despues).total).toBe(posicionDe('p25', antes).total + 1);
    expect(puedeTerminar(despues)).toBe(false);
    expect(primeraSinResponder(despues)).toBe('p4');
  });

  test('RN-04: al cambiar "Casa" por "Departamento" se borran las respuestas del patio (P5 y P6)', () => {
    const despues = responder(ADOPTANTE_A.respuestas, 'p2', 'departamento');
    expect(despues.p5).toBeUndefined();
    expect(despues.p6).toBeUndefined();
    expect(puedeTerminar(despues)).toBe(true);
  });
});
