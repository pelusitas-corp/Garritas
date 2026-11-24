/**
 * Pruebas del motor de match (spec F-05 §6). El nombre de cada prueba es su
 * criterio de aceptación.
 */
import MENSAJES from '../../src/compartido/mensajes';
import {
  asignarPerfilGarritas,
  esNoApto,
  evaluarAnimales,
  revisarPostulacion,
  tienePerfilCompleto,
} from '../../src/matchmaking';
import type {
  AnimalParaMatch,
  Cuestionario,
  ResultadoMatch,
  Respuestas,
} from '../../src/matchmaking';
import { calcularValoresAdoptante } from '../../src/matchmaking/cuestionario';
import { ADOPTANTE_A, ADOPTANTE_B, ANIMALES_6_6, LUNA, ROCKY, TOBY, WINI } from './datos';

/** Evalúa y devuelve los resultados (falla la prueba si el cuestionario no está completo). */
function evaluar(cuestionario: Cuestionario, animales: AnimalParaMatch[]): ResultadoMatch[] {
  const evaluacion = evaluarAnimales(cuestionario, animales);
  if (!evaluacion.completo) {
    throw new Error('Se esperaba un cuestionario completo');
  }
  return evaluacion.resultados;
}

const idsDe = (resultados: ResultadoMatch[]): string[] => resultados.map((r) => r.animalId);

const resultadoDe = (cuestionario: Cuestionario, animal: AnimalParaMatch): ResultadoMatch => {
  const [resultado] = evaluar(cuestionario, [animal]);
  if (resultado === undefined) {
    throw new Error(`${animal.animalId} quedó excluido`);
  }
  return resultado;
};

const conRespuestas = (base: Cuestionario, cambios: Respuestas): Cuestionario => ({
  completo: true,
  respuestas: { ...base.respuestas, ...cambios },
});

const PERRO_PATIO: AnimalParaMatch = {
  ...WINI,
  animalId: 'perro-patio',
  perfilCompatibilidad: { ...WINI.perfilCompatibilidad, espacio: 'patioBardeado' },
};

describe('F-05 · RF-17 Filtros no negociables', () => {
  test('RF-17 válido: el adoptante indicó que no tiene patio bardeado y un animal requiere patio bardeado, y ese animal no aparece en "Descubrir"', () => {
    const sinPatio = conRespuestas(ADOPTANTE_A, { p5: 'no' });
    expect(idsDe(evaluar(sinPatio, [PERRO_PATIO, WINI]))).toEqual(['wini']);
  });

  test('RF-17 válido (FN-3): quien vive en departamento no ve al animal que necesita patio bardeado', () => {
    expect(idsDe(evaluar(ADOPTANTE_B, [PERRO_PATIO]))).toEqual([]);
  });

  test('RF-17 válido (FN-1): quien solo convive con perros no ve gatos, y quien solo convive con gatos no ve perros', () => {
    const soloPerros = conRespuestas(ADOPTANTE_A, { p1: 'perros' });
    const soloGatos = conRespuestas(ADOPTANTE_A, { p1: 'gatos' });
    expect(idsDe(evaluar(soloPerros, [WINI, LUNA]))).toEqual(['wini']);
    expect(idsDe(evaluar(soloGatos, [WINI, LUNA]))).toEqual(['luna']);
  });

  test('RF-17 válido (FN-2): quien renta y el dueño no permite mascotas no ve ningún animal', () => {
    const rentaSinPermiso = conRespuestas(ADOPTANTE_A, { p3: 'rentada', p4: 'no' });
    expect(idsDe(evaluar(rentaSinPermiso, ANIMALES_6_6))).toEqual([]);
  });

  test('RF-17 válido (FN-4): quien no tiene red en las ventanas no ve gatos', () => {
    const sinRed = conRespuestas(ADOPTANTE_A, { p7: 'no' });
    expect(idsDe(evaluar(sinRed, [WINI, LUNA]))).toEqual(['wini']);
  });

  test('RF-17 válido (FN-5): con niños en casa no aparece el animal "Solo con mascotas", y con mascotas no aparece el "Solo con niños"', () => {
    const soloConMascotas: AnimalParaMatch = {
      ...WINI,
      animalId: 'solo-mascotas',
      perfilCompatibilidad: { ...WINI.perfilCompatibilidad, convivencia: 'soloConMascotas' },
    };
    const conMascotas = conRespuestas(ADOPTANTE_A, { p10: 'si', p11: 'si' });
    expect(idsDe(evaluar(ADOPTANTE_B, [soloConMascotas, TOBY]))).toEqual(['toby']);
    expect(idsDe(evaluar(conMascotas, [soloConMascotas, TOBY]))).toEqual(['solo-mascotas']);
  });

  test('RF-17 válido (FN-5): el animal "Mejor sin niños ni mascotas" no aparece si hay niños o mascotas', () => {
    const sinCompania: AnimalParaMatch = {
      ...WINI,
      animalId: 'sin-compania',
      perfilCompatibilidad: { ...WINI.perfilCompatibilidad, convivencia: 'sinNinosNiMascotas' },
    };
    expect(idsDe(evaluar(ADOPTANTE_B, [sinCompania]))).toEqual([]);
    expect(idsDe(evaluar(ADOPTANTE_A, [sinCompania]))).toEqual(['sin-compania']);
  });

  test('RF-17 no válido: si el adoptante intenta enviar una solicitud para un animal excluido por un filtro, se bloquea la acción con "Esta mascota no es compatible con las condiciones de tu hogar"', () => {
    if (!tienePerfilCompleto(PERRO_PATIO) || !tienePerfilCompleto(WINI)) {
      throw new Error('Perfiles de prueba incompletos');
    }
    expect(revisarPostulacion(ADOPTANTE_B.respuestas, PERRO_PATIO)).toEqual({
      permitida: false,
      mensaje: MENSAJES.mascotaNoCompatible,
    });
    expect(revisarPostulacion(ADOPTANTE_B.respuestas, WINI)).toEqual({ permitida: true });
  });

  test('Flujo A3: si ningún animal pasa los filtros, el motor devuelve una lista vacía', () => {
    const rentaSinPermiso = conRespuestas(ADOPTANTE_B, { p3: 'rentada', p4: 'no' });
    expect(evaluarAnimales(rentaSinPermiso, ANIMALES_6_6)).toEqual({
      completo: true,
      resultados: [],
    });
  });
});

describe('F-05 · RF-03 Porcentaje de compatibilidad', () => {
  test('RF-03 válido: cada animal recibe un porcentaje entero entre 0 y 100, y las mismas respuestas y el mismo animal siempre dan el mismo porcentaje', () => {
    const primera = evaluar(ADOPTANTE_A, ANIMALES_6_6);
    const segunda = evaluar(ADOPTANTE_A, ANIMALES_6_6);
    expect(primera).toHaveLength(4);
    primera.forEach(({ porcentaje }) => {
      expect(Number.isInteger(porcentaje)).toBe(true);
      expect(porcentaje).toBeGreaterThanOrEqual(0);
      expect(porcentaje).toBeLessThanOrEqual(100);
    });
    expect(segunda).toEqual(primera);
  });

  test('RF-03 no válido: si un animal no tiene completo su perfil de compatibilidad, no se calcula su porcentaje y no aparece en "Descubrir"', () => {
    const { temperamento, ...perfilSinTemperamento } = WINI.perfilCompatibilidad ?? {};
    expect(temperamento).toBe('sociable');
    const incompleto: AnimalParaMatch = {
      animalId: 'incompleto',
      especie: 'perro',
      perfilCompatibilidad: perfilSinTemperamento,
    };
    const sinPerfil: AnimalParaMatch = { animalId: 'sin-perfil', especie: 'perro' };
    expect(idsDe(evaluar(ADOPTANTE_A, [incompleto, sinPerfil, WINI]))).toEqual(['wini']);
  });

  test('Flujo A1: con el cuestionario sin terminar el motor no calcula nada', () => {
    expect(evaluarAnimales({ ...ADOPTANTE_A, completo: false }, ANIMALES_6_6)).toEqual({
      completo: false,
    });
  });
});

describe('F-05 · RF-18 No Apto', () => {
  test('RF-18 válido: con 25 % la solicitud se etiqueta "No Apto"', () => {
    expect(esNoApto(25)).toBe(true);
    expect(esNoApto(29)).toBe(true);
    expect(MENSAJES.etiquetaNoApto).toBeDefined();
  });

  test('RF-18 no válido: con 30 % (o más) no se etiqueta "No Apto"', () => {
    expect(esNoApto(30)).toBe(false);
    expect(esNoApto(31)).toBe(false);
  });

  test('RF-18 válido: Toby con el Adoptante B (24 %) sale como "No Apto"', () => {
    expect(resultadoDe(ADOPTANTE_B, TOBY)).toMatchObject({ porcentaje: 24, noApto: true });
    expect(resultadoDe(ADOPTANTE_B, ROCKY)).toMatchObject({ porcentaje: 31, noApto: false });
  });
});

describe('F-05 · RF-19 Perfil Garritas', () => {
  test('RF-19 válido: las mismas respuestas siempre dan el mismo perfil (A = Caminante, B = Puertas abiertas)', () => {
    expect(asignarPerfilGarritas(ADOPTANTE_A)).toMatchObject({
      completo: true,
      perfil: 'caminante',
      nombre: 'Caminante',
    });
    expect(asignarPerfilGarritas(ADOPTANTE_A)).toEqual(asignarPerfilGarritas(ADOPTANTE_A));
    expect(asignarPerfilGarritas(ADOPTANTE_B)).toMatchObject({
      completo: true,
      perfil: 'puertasAbiertas',
      nombre: 'Puertas abiertas',
    });
  });

  test('RF-19 válido: hay 4 perfiles según Energía y Temperamento (umbral 0.5)', () => {
    const activoYMovido = conRespuestas(ADOPTANTE_A, {
      p22: 'muyMovida',
      p23: 'seguido',
      p24: 'mucho',
      p25: 'sociable',
    });
    const tranquiloYCalmado = conRespuestas(ADOPTANTE_B, {
      p22: 'tranquila',
      p23: 'casiNunca',
      p24: 'poco',
      p25: 'tranquila',
    });
    expect(asignarPerfilGarritas(activoYMovido)).toMatchObject({ perfil: 'espirituExplorador' });
    expect(asignarPerfilGarritas(tranquiloYCalmado)).toMatchObject({ perfil: 'nidoTranquilo' });
  });

  test('RF-19 válido: el perfil no modifica ningún porcentaje de compatibilidad', () => {
    const antes = evaluar(ADOPTANTE_A, ANIMALES_6_6);
    asignarPerfilGarritas(ADOPTANTE_A);
    expect(evaluar(ADOPTANTE_A, ANIMALES_6_6)).toEqual(antes);
  });

  test('RF-19 no válido: sin haber terminado el cuestionario, devuelve "Termina tu cuestionario para descubrir tu perfil Garritas"', () => {
    expect(asignarPerfilGarritas({ ...ADOPTANTE_A, completo: false })).toEqual({
      completo: false,
      mensaje: MENSAJES.terminaCuestionarioPerfil,
    });
  });
});

describe('F-05 · RF-20 Explicación del match', () => {
  test('RF-20 válido: Wini con el Adoptante A muestra las 3 dimensiones con mayor aporte: Nivel de energía, Espacio y Tiempo disponible', () => {
    expect(resultadoDe(ADOPTANTE_A, WINI).explicacion).toEqual({
      tipo: 'mayorAporte',
      dimensiones: ['Nivel de energía', 'Espacio', 'Tiempo disponible'],
    });
  });

  test('RF-20 no válido: con menos de 30 % (Toby con el Adoptante B) muestra las dimensiones con menor coincidencia y "Esta mascota podría no adaptarse a tu estilo de vida"', () => {
    expect(resultadoDe(ADOPTANTE_B, TOBY).explicacion).toEqual({
      tipo: 'menorCoincidencia',
      dimensiones: ['Nivel de energía', 'Tiempo disponible'],
      mensaje: MENSAJES.mascotaPodriaNoAdaptarse,
    });
  });
});

describe('F-05 · CA-11 Casos de prueba de ESTADO §6.6', () => {
  test.each([
    ['Luna', LUNA, 95, 66],
    ['Wini', WINI, 90, 70],
    ['Rocky', ROCKY, 77, 31],
    ['Toby', TOBY, 73, 24],
  ])('%s: %i %% con el Adoptante A y %i %% con el Adoptante B', (_nombre, animal, conA, conB) => {
    expect(resultadoDe(ADOPTANTE_A, animal).porcentaje).toBe(conA);
    expect(resultadoDe(ADOPTANTE_B, animal).porcentaje).toBe(conB);
  });

  test('Valores por dimensión del Adoptante A y del Adoptante B (a dos decimales)', () => {
    const redondear = (valores: Record<string, number> | null) =>
      valores === null
        ? null
        : Object.fromEntries(Object.entries(valores).map(([d, v]) => [d, Number(v.toFixed(2))]));
    expect(redondear(calcularValoresAdoptante(ADOPTANTE_A.respuestas))).toEqual({
      energia: 0.5,
      espacio: 0.83,
      tiempo: 0.5,
      experiencia: 0.67,
      convivencia: 0,
      temperamento: 0.38,
    });
    expect(redondear(calcularValoresAdoptante(ADOPTANTE_B.respuestas))).toEqual({
      energia: 0,
      espacio: 0,
      tiempo: 0,
      experiencia: 0,
      convivencia: 0.67,
      temperamento: 1,
    });
  });
});

describe('F-05 · RN-03 Valor del adoptante', () => {
  test('Ignora la respuesta de una pregunta que ya no aplica por un salto (P5 y P6 con departamento)', () => {
    const conRespuestasViejas = conRespuestas(ADOPTANTE_B, { p5: 'si', p6: 'grande' });
    expect(calcularValoresAdoptante(conRespuestasViejas.respuestas)).toEqual(
      calcularValoresAdoptante(ADOPTANTE_B.respuestas),
    );
  });

  test('"Me adapto a cualquiera" no cuenta en Temperamento', () => {
    const seAdapta = conRespuestas(ADOPTANTE_A, { p25: 'meAdapto' });
    // Sin P25, Temperamento = promedio de P22 (0.5), P23 (0.5) y P24 (0) = 1/3.
    expect(calcularValoresAdoptante(seAdapta.respuestas)?.temperamento).toBeCloseTo(1 / 3);
  });
});

describe('F-05 · RNF-01 Tiempo de cálculo', () => {
  test('RNF-01: evalúa 500 animales en menos de 3 s', () => {
    const muchos = Array.from({ length: 500 }, (_, i) => ({
      ...ANIMALES_6_6[i % 4],
      animalId: `animal-${i}`,
    }));
    const inicio = Date.now();
    expect(evaluar(ADOPTANTE_A, muchos)).toHaveLength(500);
    expect(Date.now() - inicio).toBeLessThan(3000);
  });
});
