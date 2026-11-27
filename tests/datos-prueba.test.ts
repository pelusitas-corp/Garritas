/**
 * Pruebas de los datos de prueba (specs/03-modelo-datos.md §8, tarea T-4).
 *
 * Revisan con el motor real de F-05 que lo que carga `npm run datos:prueba`
 * diga lo mismo que la spec. Si alguien cambia un dato de prueba por error,
 * estas pruebas fallan en la revisión automática.
 *
 * 03 v1.9 M-7 (F-12 AE-13, AE-14 y F-13 AF-6; decisión del equipo, no está en
 * el SRS): 12 animales con fotos reales, de 1 a 3 por animal (CA-13 de F-12,
 * CA-06 de F-13).
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { OPCIONES_EDAD, OPCIONES_TAMANO } from '../src/compartido/modelo';
import { evaluarAnimales, asignarPerfilGarritas, esNoApto } from '../src/matchmaking';
import type { AnimalParaMatch, ResultadoMatch } from '../src/matchmaking';
import { ADOPTANTES, ANIMALES, SOLICITUDES } from '../scripts/datos-prueba/datos';
import type { ClaveAdoptante } from '../scripts/datos-prueba/datos';
import { archivosDeFotos } from '../scripts/datos-prueba/fotos';

const CARPETA_IMAGENES = join(__dirname, '..', 'scripts', 'datos-prueba');
const KB = 1024;

/** Dice si un archivo está en la carpeta de datos de prueba (igual que el script). */
function existeImagen(nombreArchivo: string): boolean {
  return existsSync(join(CARPETA_IMAGENES, nombreArchivo));
}

/** % de cada animal con A y con B (03 v1.9 §8.2). Los excluidos por filtro no están. */
const PORCENTAJES_8_2: Record<ClaveAdoptante, Record<string, number>> = {
  a: {
    wini: 90,
    luna: 95,
    rocky: 77,
    toby: 73,
    canela: 76,
    tiara: 87,
    tostado: 90,
    nova: 83,
    naranga: 70,
    virginia: 77,
    lebron: 87,
    sombra: 95,
  },
  b: {
    wini: 70,
    luna: 66,
    rocky: 31,
    toby: 24,
    tiara: 93,
    tostado: 88,
    naranga: 55,
    virginia: 53,
    lebron: 84,
    sombra: 50,
  },
};

/** Los animales de prueba con la forma que recibe el motor. */
const ANIMALES_MOTOR: AnimalParaMatch[] = ANIMALES.map((animal) => ({
  animalId: animal.id,
  especie: animal.especie,
  perfilCompatibilidad: animal.perfilCompatibilidad,
}));

/** Evalúa a todos los animales de prueba (sin importar su estado) para un adoptante. */
function evaluarPara(clave: ClaveAdoptante): ResultadoMatch[] {
  const evaluacion = evaluarAnimales(ADOPTANTES[clave].cuestionario, ANIMALES_MOTOR);
  if (!evaluacion.completo) {
    throw new Error('Se esperaba un cuestionario completo');
  }
  return evaluacion.resultados;
}

/**
 * Lo que vería el adoptante en "Descubrir": solo "Disponible" (RF-10), de
 * mayor a menor % (RF-26) y, con el mismo %, por nombre (F-03 DE-2).
 */
function descubrirPara(clave: ClaveAdoptante): string[] {
  const nombres = new Map(
    ANIMALES.filter((animal) => animal.estado === 'Disponible').map((animal) => [
      animal.id,
      animal.nombre,
    ]),
  );
  return evaluarPara(clave)
    .filter((resultado) => nombres.has(resultado.animalId))
    .map((resultado) => ({ ...resultado, nombre: nombres.get(resultado.animalId) ?? '' }))
    .sort((a, b) => b.porcentaje - a.porcentaje || a.nombre.localeCompare(b.nombre, 'es'))
    .map(({ nombre, porcentaje }) => `${nombre} ${porcentaje}`);
}

describe('03-modelo-datos §8 · datos de prueba', () => {
  test.each(SOLICITUDES)(
    '§8.3: la solicitud $id tiene el mismo % que calcula el motor ($porcentaje)',
    ({ animalId, adoptante, porcentaje }) => {
      const resultado = evaluarPara(adoptante).find((r) => r.animalId === animalId);
      expect(resultado?.porcentaje).toBe(porcentaje);
    },
  );

  test('RF-18: solo la solicitud s3 (Toby con Luis, 24 %) queda "No Apto"', () => {
    const noAptas = SOLICITUDES.filter((s) => esNoApto(s.porcentaje)).map((s) => s.id);
    expect(noAptas).toEqual(['s3']);
  });

  test('RF-17 (M-6): Canela se excluye por FN-3 para Luis (B) y no para Ana (A)', () => {
    const idsA = evaluarPara('a').map((r) => r.animalId);
    const idsB = evaluarPara('b').map((r) => r.animalId);
    expect(idsA).toContain('canela');
    expect(idsB).not.toContain('canela');
  });

  test('CA-06 · AF-6: después de `npm run datos:prueba`, Ana ve Luna 95 · Sombra 95 · Tostado 90 · Wini 90 · Lebron 87 · Tiara 87 · Nova 83 · Virginia 77 · Canela 76 · Toby 73 · Naranga 70', () => {
    expect(descubrirPara('a')).toEqual([
      'Luna 95',
      'Sombra 95',
      'Tostado 90',
      'Wini 90',
      'Lebron 87',
      'Tiara 87',
      'Nova 83',
      'Virginia 77',
      'Canela 76',
      'Toby 73',
      'Naranga 70',
    ]);
  });

  test('§8.3: Luis (B) ve en Descubrir Tiara 93 · Tostado 88 · Lebron 84 · Wini 70 · Luna 66 · Naranga 55 · Virginia 53 · Sombra 50 · Toby 24', () => {
    expect(descubrirPara('b')).toEqual([
      'Tiara 93',
      'Tostado 88',
      'Lebron 84',
      'Wini 70',
      'Luna 66',
      'Naranga 55',
      'Virginia 53',
      'Sombra 50',
      'Toby 24',
    ]);
  });

  test('RF-19: Ana es Caminante y Luis es Puertas abiertas, como su perfil guardado', () => {
    (['a', 'b'] as const).forEach((clave) => {
      const resultado = asignarPerfilGarritas(ADOPTANTES[clave].cuestionario);
      expect(resultado.completo && resultado.perfil).toBe(ADOPTANTES[clave].perfilGarritas);
    });
  });

  test('M-1: resumenHogar copia exactamente p2, p12 y p19 del cuestionario', () => {
    (['a', 'b'] as const).forEach((clave) => {
      const { respuestas } = ADOPTANTES[clave].cuestionario;
      expect(ADOPTANTES[clave].resumenHogar).toEqual({
        p2: respuestas.p2,
        p12: respuestas.p12,
        p19: respuestas.p19,
      });
    });
  });

  test('§6.1: Rocky está "En pre-adopción" porque su solicitud s4 está "Pre-aprobada"', () => {
    const rocky = ANIMALES.find((animal) => animal.id === 'rocky');
    const preAprobadas = SOLICITUDES.filter((s) => s.estado === 'Pre-aprobada');
    expect(rocky?.estado).toBe('En pre-adopción');
    expect(preAprobadas.map((s) => s.animalId)).toEqual(['rocky']);
  });

  test.each(ANIMALES)(
    'AL-1 · AL-2: la edad ($edad) y el tamaño ($tamano) de $nombre están en sus listas',
    ({ edad, tamano }) => {
      expect(OPCIONES_EDAD).toContain(edad);
      expect(OPCIONES_TAMANO).toContain(tamano);
    },
  );

  test('§8.2: Wini y Luna quedan en "1 a 3 años" y "Pequeño" (AL-1, AL-2)', () => {
    const winiYLuna = ANIMALES.filter((animal) => ['wini', 'luna'].includes(animal.id));
    winiYLuna.forEach((animal) => {
      expect([animal.edad, animal.tamano]).toEqual(['1 a 3 años', 'Pequeño']);
    });
  });
});

describe('F-13 · CA-06 · 12 animales con fotos reales (03 v1.9 M-7, AF-6)', () => {
  test('03 M-7 válido: los % de los 12 animales son los de §8.2', () => {
    expect(ANIMALES).toHaveLength(12);
    (['a', 'b'] as const).forEach((clave) => {
      const porcentajes = Object.fromEntries(
        evaluarPara(clave).map((resultado) => [resultado.animalId, resultado.porcentaje]),
      );
      expect(porcentajes).toEqual(PORCENTAJES_8_2[clave]);
    });
  });

  test('03 M-7 no válido: Nova se excluye para B por FN-5', () => {
    expect(evaluarPara('a').map((r) => r.animalId)).toContain('nova');
    expect(evaluarPara('b').map((r) => r.animalId)).not.toContain('nova');
  });

  test('M-7: los 7 animales nuevos no tienen solicitudes', () => {
    const conSolicitud = new Set(SOLICITUDES.map((s) => s.animalId));
    ['tiara', 'tostado', 'nova', 'naranga', 'virginia', 'lebron', 'sombra'].forEach((id) => {
      expect(conSolicitud.has(id)).toBe(false);
    });
  });

  test.each(ANIMALES)(
    'M-7: $nombre tiene de 1 a 3 fotos ≤ 300 KB y su miniatura ≤ 30 KB',
    ({ id }) => {
      const fotos = archivosDeFotos(id, existeImagen);
      expect(fotos.length).toBeGreaterThanOrEqual(1);
      expect(fotos.length).toBeLessThanOrEqual(3);
      fotos.forEach(({ archivo }) => {
        expect(statSync(join(CARPETA_IMAGENES, archivo)).size).toBeLessThanOrEqual(300 * KB);
      });
      const miniatura = join(CARPETA_IMAGENES, `${id}-miniatura.jpg`);
      expect(existsSync(miniatura)).toBe(true);
      expect(statSync(miniatura).size).toBeLessThanOrEqual(30 * KB);
    },
  );

  test('M-7: Tiara tiene 2 fotos y los demás 1 (13 fotos y 12 miniaturas en total)', () => {
    const cuantas = Object.fromEntries(
      ANIMALES.map(({ id }) => [id, archivosDeFotos(id, existeImagen).length]),
    );
    expect(cuantas.tiara).toBe(2);
    ANIMALES.filter(({ id }) => id !== 'tiara').forEach(({ id }) => {
      expect(cuantas[id]).toBe(1);
    });
    expect(Object.values(cuantas).reduce((suma, n) => suma + n, 0)).toBe(13);
    const miniaturas = readdirSync(CARPETA_IMAGENES).filter((nombre) =>
      nombre.endsWith('-miniatura.jpg'),
    );
    expect(miniaturas).toHaveLength(12);
  });

  test('M-7: ya no quedan las ilustraciones viejas {id}.jpg', () => {
    const imagenes = readdirSync(CARPETA_IMAGENES).filter((nombre) => nombre.endsWith('.jpg'));
    const viejas = ANIMALES.map(({ id }) => `${id}.jpg`).filter((nombre) =>
      imagenes.includes(nombre),
    );
    expect(viejas).toEqual([]);
    expect(imagenes).toHaveLength(25);
  });

  test('M-7: archivosDeFotos lee de 1 a 3 fotos en orden y sin huecos', () => {
    const carpeta = new Set(['a-1.jpg', 'a-2.jpg', 'a-3.jpg', 'b-1.jpg', 'b-3.jpg']);
    const existe = (archivo: string) => carpeta.has(archivo);
    expect(archivosDeFotos('a', existe)).toEqual([
      { archivo: 'a-1.jpg', orden: 0 },
      { archivo: 'a-2.jpg', orden: 1 },
      { archivo: 'a-3.jpg', orden: 2 },
    ]);
    // Falta b-2.jpg: b-3.jpg no se usa, para no dejar un hueco en el orden.
    expect(archivosDeFotos('b', existe)).toEqual([{ archivo: 'b-1.jpg', orden: 0 }]);
  });

  test('M-7 no válido: archivosDeFotos falla si falta {id}-1.jpg', () => {
    expect(() => archivosDeFotos('sinfoto', () => false)).toThrow('sinfoto-1.jpg');
  });
});
