/**
 * Datos de prueba de ESTADO §6.6 (spec F-05, CA-11). Todos son ficticios.
 *
 * §6.6 no dice P1, P3 ni P7 del Adoptante B. Se usan respuestas que no
 * excluyen a ningún animal de la tabla (Ambos, Propia, ventanas con red).
 * Tampoco dice la especie de Rocky y Toby: se usan perros. En Convivencia,
 * los animales con 0.5 son "Solo con niños" para poder vivir con el niño
 * del Adoptante B (FN-5).
 */
import type { AnimalParaMatch, Cuestionario } from '../../src/matchmaking';

export const ADOPTANTE_A: Cuestionario = {
  completo: true,
  respuestas: {
    p1: 'ambos',
    p2: 'casa',
    p3: 'propia',
    p5: 'si',
    p6: 'mediano',
    p7: 'si',
    p8: 'no',
    p10: 'no',
    p12: 'menosDe4',
    p13: 'no',
    p14: 'aVeces',
    p15: 'dos',
    p16: 'min30',
    p17: 'unPocoDeTodo',
    p18: 'aVeces',
    p19: 'yaHeTenido',
    p20: 'no',
    p21: 'paciencia',
    p22: 'normal',
    p23: 'aVeces',
    p24: 'poco',
    p25: 'juguetona',
  },
};

export const ADOPTANTE_B: Cuestionario = {
  completo: true,
  respuestas: {
    p1: 'ambos',
    p2: 'departamento',
    p3: 'propia',
    p7: 'si',
    p8: 'si',
    p9: 'menosDe6',
    p10: 'no',
    p12: 'masDe8',
    p13: 'no',
    p14: 'seguido',
    p15: 'una',
    p16: 'min15',
    p17: 'enCasa',
    p18: 'casiNunca',
    p19: 'primeraVez',
    p20: 'no',
    p21: 'preocupacion',
    p22: 'muyMovida',
    p23: 'seguido',
    p24: 'mucho',
    p25: 'sociable',
  },
};

/** Wini (0.5, 0.5, 0.5, 0, 1, 1) */
export const WINI: AnimalParaMatch = {
  animalId: 'wini',
  especie: 'perro',
  perfilCompatibilidad: {
    energia: 'media',
    espacio: 'casa',
    tiempo: 'unasHoras',
    experiencia: 'facil',
    convivencia: 'conNinosYMascotas',
    temperamento: 'sociable',
  },
};

/** Luna (0.5, 0, 0, 0.5, 0.5, 0) */
export const LUNA: AnimalParaMatch = {
  animalId: 'luna',
  especie: 'gato',
  perfilCompatibilidad: {
    energia: 'media',
    espacio: 'poco',
    tiempo: 'variasHoras',
    experiencia: 'medio',
    convivencia: 'soloConNinos',
    temperamento: 'timido',
  },
};

/** Rocky (1, 0.5, 1, 1, 0.5, 0.5) */
export const ROCKY: AnimalParaMatch = {
  animalId: 'rocky',
  especie: 'perro',
  perfilCompatibilidad: {
    energia: 'alta',
    espacio: 'casa',
    tiempo: 'compania',
    experiencia: 'especial',
    convivencia: 'soloConNinos',
    temperamento: 'tranquilo',
  },
};

/** Toby (1, 0.5, 1, 1, 0.5, 0) */
export const TOBY: AnimalParaMatch = {
  animalId: 'toby',
  especie: 'perro',
  perfilCompatibilidad: {
    energia: 'alta',
    espacio: 'casa',
    tiempo: 'compania',
    experiencia: 'especial',
    convivencia: 'soloConNinos',
    temperamento: 'timido',
  },
};

export const ANIMALES_6_6 = [WINI, LUNA, ROCKY, TOBY];
