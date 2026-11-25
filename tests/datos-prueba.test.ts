/**
 * Pruebas de los datos de prueba (specs/03-modelo-datos.md §8, tarea T-4).
 *
 * Revisan con el motor real de F-05 que lo que carga `npm run datos:prueba`
 * diga lo mismo que la spec. Si alguien cambia un dato de prueba por error,
 * estas pruebas fallan en la revisión automática.
 */
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { evaluarAnimales, asignarPerfilGarritas, esNoApto } from '../src/matchmaking';
import type { AnimalParaMatch, ResultadoMatch } from '../src/matchmaking';
import { ADOPTANTES, ANIMALES, SOLICITUDES } from '../scripts/datos-prueba/datos';
import type { ClaveAdoptante } from '../scripts/datos-prueba/datos';

const CARPETA_IMAGENES = join(__dirname, '..', 'scripts', 'datos-prueba');
const KB = 1024;

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

/** Lo que vería el adoptante en "Descubrir": solo "Disponible" (RF-10), ordenado por % (RF-26). */
function descubrirPara(clave: ClaveAdoptante): string[] {
  const disponibles = new Set(
    ANIMALES.filter((animal) => animal.estado === 'Disponible').map((animal) => animal.id),
  );
  return evaluarPara(clave)
    .filter((resultado) => disponibles.has(resultado.animalId))
    .sort((a, b) => b.porcentaje - a.porcentaje)
    .map((resultado) => `${resultado.animalId} ${resultado.porcentaje}`);
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

  test('§8.3: Ana (A) ve en Descubrir Luna 95 · Wini 90 · Canela 76 · Toby 73', () => {
    expect(descubrirPara('a')).toEqual(['luna 95', 'wini 90', 'canela 76', 'toby 73']);
  });

  test('§8.3: Luis (B) ve en Descubrir Wini 70 · Luna 66 · Toby 24', () => {
    expect(descubrirPara('b')).toEqual(['wini 70', 'luna 66', 'toby 24']);
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

  test.each(ANIMALES)('§4.4 (D-36): $nombre tiene foto ≤ 300 KB y miniatura ≤ 30 KB', ({ id }) => {
    const foto = join(CARPETA_IMAGENES, `${id}.jpg`);
    const miniatura = join(CARPETA_IMAGENES, `${id}-miniatura.jpg`);
    expect(existsSync(foto) && existsSync(miniatura)).toBe(true);
    expect(statSync(foto).size).toBeLessThanOrEqual(300 * KB);
    expect(statSync(miniatura).size).toBeLessThanOrEqual(30 * KB);
  });
});
