/**
 * Dimensiones, pesos y valores del animal (spec F-05: RN-01, RN-04, RN-07).
 */
import type { Dimension, PerfilCompatibilidad, Valor } from './tipos';

/** Orden de desempate de RN-07: Energía, Espacio, Tiempo, Convivencia, Temperamento, Experiencia. */
export const DIMENSIONES: readonly Dimension[] = [
  'energia',
  'espacio',
  'tiempo',
  'convivencia',
  'temperamento',
  'experiencia',
];

/** RN-01: pesos de cada dimensión. Suman 1. */
export const PESOS: Readonly<Record<Dimension, number>> = {
  energia: 0.25,
  espacio: 0.2,
  tiempo: 0.15,
  convivencia: 0.15,
  temperamento: 0.15,
  experiencia: 0.1,
};

/** RN-07: nombres que se muestran en la pantalla "Match". */
export const NOMBRES_DIMENSION: Readonly<Record<Dimension, string>> = {
  energia: 'Nivel de energía',
  espacio: 'Espacio',
  tiempo: 'Tiempo disponible',
  convivencia: 'Convivencia',
  temperamento: 'Temperamento',
  experiencia: 'Experiencia',
};

/** RN-04: valor de cada opción del perfil de compatibilidad del animal (ESTADO §6.4). */
export const VALORES_ANIMAL: {
  readonly [D in Dimension]: Readonly<Record<PerfilCompatibilidad[D], Valor>>;
} = {
  energia: { baja: 0, media: 0.5, alta: 1 },
  espacio: { poco: 0, casa: 0.5, patioBardeado: 1 },
  tiempo: { variasHoras: 0, unasHoras: 0.5, compania: 1 },
  experiencia: { facil: 0, medio: 0.5, especial: 1 },
  convivencia: {
    sinNinosNiMascotas: 0,
    soloConNinos: 0.5,
    soloConMascotas: 0.5,
    conNinosYMascotas: 1,
  },
  temperamento: { timido: 0, tranquilo: 0.5, sociable: 1 },
};
