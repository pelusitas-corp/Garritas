/**
 * Recuperar el avance del cuestionario (spec F-04: RF-16, RN-06 a RN-08).
 */
import { decidirInicio, elegirRespuestas } from '../../src/adoptante/cuestionario/recuperacion';
import type { AvanceGuardado, LecturaRemota } from '../../src/adoptante/cuestionario/recuperacion';
import MENSAJES from '../../src/compartido/mensajes';
import type { Respuestas } from '../../src/matchmaking';
import { ADOPTANTE_A } from '../matchmaking/datos';

/** Adoptante A con P1 a P10 respondidas (P4, P9 y P11 no le aplican). */
const A_HASTA_P10: Respuestas = {
  p1: 'ambos',
  p2: 'casa',
  p3: 'propia',
  p5: 'si',
  p6: 'mediano',
  p7: 'si',
  p8: 'no',
  p10: 'no',
};

const NO_EXISTE: LecturaRemota = { estado: 'no-existe' };
const SIN_CONEXION: LecturaRemota = { estado: 'sin-conexion' };
const EMPEZADO_VACIO: LecturaRemota = {
  estado: 'existe',
  respuestas: {},
  completo: false,
  actualizadoEn: 1000,
};

function local(respuestas: Respuestas, actualizadoEn = 2000): AvanceGuardado {
  return { respuestas, actualizadoEn };
}

describe('F-04 · CA-05 · RF-16 válido', () => {
  test('RF-16 válido: con 10 preguntas respondidas, al volver a abrir muestra la siguiente sin responder con "Recuperamos tu cuestionario en progreso"', () => {
    const inicio = decidirInicio(local(A_HASTA_P10), EMPEZADO_VACIO, false);
    expect(inicio).toEqual({
      accion: 'mostrar',
      respuestas: A_HASTA_P10,
      preguntaInicial: 'p12',
      mensaje: MENSAJES.CUESTIONARIO_RECUPERADO,
      crearDocumento: false,
    });
  });

  test('RF-16 válido: si se borraron los datos del teléfono, recupera el avance de Firestore', () => {
    const remota: LecturaRemota = {
      estado: 'existe',
      respuestas: A_HASTA_P10,
      completo: false,
      actualizadoEn: 1000,
    };
    const inicio = decidirInicio(null, remota, false);
    expect(inicio).toMatchObject({
      preguntaInicial: 'p12',
      mensaje: MENSAJES.CUESTIONARIO_RECUPERADO,
    });
  });

  test('RN-07: se usa el avance más reciente entre el teléfono y Firestore', () => {
    const remota: LecturaRemota = {
      estado: 'existe',
      respuestas: { p1: 'gatos' },
      completo: false,
      actualizadoEn: 3000,
    };
    expect(elegirRespuestas(local({ p1: 'perros' }, 2000), remota)).toEqual({ p1: 'gatos' });
    expect(elegirRespuestas(local({ p1: 'perros' }, 4000), remota)).toEqual({ p1: 'perros' });
  });

  test('A5 · RN-07: sin conexión usa el avance del teléfono', () => {
    const inicio = decidirInicio(local(A_HASTA_P10), SIN_CONEXION, false);
    expect(inicio).toMatchObject({
      preguntaInicial: 'p12',
      mensaje: MENSAJES.CUESTIONARIO_RECUPERADO,
      crearDocumento: false,
    });
  });
});

describe('F-04 · CA-06 · RF-16 no válido', () => {
  test('RF-16 no válido: sin avance guardado empieza en la pregunta 1 con "No encontramos tu avance. Empecemos desde el inicio"', () => {
    const inicio = decidirInicio(null, EMPEZADO_VACIO, false);
    expect(inicio).toEqual({
      accion: 'mostrar',
      respuestas: {},
      preguntaInicial: 'p1',
      mensaje: MENSAJES.CUESTIONARIO_SIN_AVANCE,
      crearDocumento: false,
    });
  });

  test('RN-08: la primera vez empieza en la pregunta 1 sin mensaje y crea el documento', () => {
    expect(decidirInicio(null, NO_EXISTE, false)).toEqual({
      accion: 'mostrar',
      respuestas: {},
      preguntaInicial: 'p1',
      mensaje: null,
      crearDocumento: true,
    });
  });

  test('A6: sin conexión y sin borrador empieza en la pregunta 1 sin mensaje', () => {
    expect(decidirInicio(null, SIN_CONEXION, false)).toMatchObject({
      preguntaInicial: 'p1',
      mensaje: null,
      crearDocumento: false,
    });
  });
});

describe('F-04 · otros inicios', () => {
  test('RF-02 no válido: desde la guarda G-5 muestra "Termina tu cuestionario para ver tus matches"', () => {
    const inicio = decidirInicio(local(A_HASTA_P10), EMPEZADO_VACIO, true);
    expect(inicio).toMatchObject({
      preguntaInicial: 'p12',
      mensaje: MENSAJES.CUESTIONARIO_INCOMPLETO,
    });
  });

  test('RN-06: con el cuestionario completo va a Descubrir', () => {
    const remota: LecturaRemota = {
      estado: 'existe',
      respuestas: ADOPTANTE_A.respuestas,
      completo: true,
      actualizadoEn: 1000,
    };
    expect(decidirInicio(null, remota, false)).toEqual({ accion: 'ir-a-descubrir' });
  });

  test('RN-05: con todo respondido pero sin terminar, abre la última pregunta para presionar "Ver mi perfil Garritas"', () => {
    const inicio = decidirInicio(local(ADOPTANTE_A.respuestas), NO_EXISTE, false);
    expect(inicio).toMatchObject({ preguntaInicial: 'p25' });
  });
});
