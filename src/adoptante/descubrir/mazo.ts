/**
 * El mazo de Descubrir (spec F-03: RN-01, RN-02, RN-04, RN-05; RF-10, RF-26).
 *
 * Analogía: Descubrir es un mazo de cartas que el motor (F-05) ya ordenó de
 * la mejor a la peor pareja. El adoptante voltea una carta a la vez.
 *
 * Funciones puras: no leen Firestore ni dibujan nada. El hook
 * `useDescubrir` les pasa lo que leyó y muestra lo que devuelven.
 */
import { ESTADO_ANIMAL } from '../../compartido/modelo';
import type { AnimalConId } from '../../firebase/animales';
import { evaluarAnimales } from '../../matchmaking';
import type { Cuestionario, Especie } from '../../matchmaking';

/** Lo que muestra una tarjeta (RF-10, DE-8). El % es el del motor (RN-09, RN-10). */
export interface TarjetaMazo {
  animalId: string;
  nombre: string;
  especie: Especie;
  miniatura: string;
  porcentaje: number;
}

/** El mazo y la tarjeta en la que va el adoptante (RN-04). */
export interface EstadoMazo {
  tarjetas: readonly TarjetaMazo[];
  indice: number;
}

/**
 * RN-02 (RF-26): de mayor a menor %; con el mismo %, por nombre (DE-2).
 * Los de menos de 30 % quedan al final por el mismo orden.
 * Recibe las tarjetas. Devuelve una copia ordenada.
 */
export function ordenarMazo(tarjetas: readonly TarjetaMazo[]): TarjetaMazo[] {
  return [...tarjetas].sort(
    (a, b) => b.porcentaje - a.porcentaje || a.nombre.localeCompare(b.nombre, 'es'),
  );
}

/**
 * Arma el mazo (pasos 3 a 5 del flujo A).
 * Recibe el cuestionario del adoptante y los animales que leyó de Firestore.
 * Devuelve las tarjetas ordenadas, o `null` si el cuestionario no está
 * completo (la pantalla redirige como G-5).
 *
 * - RN-01: descarta cualquier animal que no esté "Disponible".
 * - RN-09: los filtros (RF-17), el perfil incompleto (RF-03) y el % los
 *   decide `evaluarAnimales`; aquí no se calcula nada.
 * - RN-02 y DE-3: ordena por %, sin etiqueta "No Apto".
 */
export function armarMazo(
  cuestionario: Cuestionario,
  animales: readonly AnimalConId[],
): TarjetaMazo[] | null {
  const disponibles = animales.filter((animal) => animal.estado === ESTADO_ANIMAL.disponible);
  const evaluacion = evaluarAnimales(
    cuestionario,
    disponibles.map((animal) => ({
      animalId: animal.id,
      especie: animal.especie,
      perfilCompatibilidad: animal.perfilCompatibilidad,
    })),
  );
  if (!evaluacion.completo) {
    return null;
  }
  const porId = new Map(disponibles.map((animal) => [animal.id, animal]));
  return ordenarMazo(
    evaluacion.resultados.flatMap((resultado): TarjetaMazo[] => {
      const animal = porId.get(resultado.animalId);
      return animal
        ? [
            {
              animalId: animal.id,
              nombre: animal.nombre,
              especie: animal.especie,
              miniatura: animal.miniatura,
              porcentaje: resultado.porcentaje,
            },
          ]
        : [];
    }),
  );
}

/** Recibe las tarjetas. Devuelve el mazo en la primera tarjeta. */
export function crearMazo(tarjetas: readonly TarjetaMazo[]): EstadoMazo {
  return { tarjetas, indice: 0 };
}

/** Recibe el mazo. Devuelve la tarjeta que se ve ahora, o `null` si ya no queda ninguna. */
export function tarjetaActual(mazo: EstadoMazo): TarjetaMazo | null {
  return mazo.tarjetas[mazo.indice] ?? null;
}

/** "Pasar" (N-2, RN-04): recibe el mazo y devuelve el mazo en la siguiente tarjeta. No guarda nada. */
export function pasar(mazo: EstadoMazo): EstadoMazo {
  return mazo.indice < mazo.tarjetas.length ? { ...mazo, indice: mazo.indice + 1 } : mazo;
}

/**
 * RN-05 y DE-1: recibe el mazo. Devuelve `true` solo si hubo tarjetas y el
 * adoptante ya las pasó todas. Con el mazo vacío es `false`: ese caso es el
 * mensaje de RF-26, no el de mazo terminado.
 */
export function mazoTerminado(mazo: EstadoMazo): boolean {
  return mazo.tarjetas.length > 0 && mazo.indice >= mazo.tarjetas.length;
}

/** "Ver de nuevo" (DE-1): recibe el mazo y lo devuelve en la primera tarjeta, sin leer Firestore. */
export function verDeNuevo(mazo: EstadoMazo): EstadoMazo {
  return { ...mazo, indice: 0 };
}
