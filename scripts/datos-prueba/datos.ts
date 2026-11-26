/**
 * Datos de prueba de specs/03-modelo-datos.md §8. Todos son ficticios.
 *
 * Este archivo solo tiene datos (no habla con Firebase). Lo usan:
 * - `scripts/cargar-datos-prueba.ts`, que los escribe en Firebase (M-5);
 * - `tests/datos-prueba.test.ts`, que revisa con el motor de F-05 que los
 *   porcentajes y el filtro de Canela sean los de la spec (T-4).
 *
 * Las respuestas de los Adoptantes A y B son las mismas de las pruebas del
 * motor (`tests/matchmaking/datos.ts`, ESTADO §6.6).
 *
 * 03 v1.8 M-7 (F-12 AE-13, AE-14; decisión del equipo, no está en el SRS):
 * son 9 animales, los 5 originales y Tiara, Tostado, Nova y Naranga, que no
 * tienen solicitudes. Sus fotos reales están en esta carpeta como
 * `{id}-1.jpg` (y `tiara-2.jpg`) con su `{id}-miniatura.jpg`.
 */
import type { Animal, EstadoSolicitud, ResumenHogar } from '../../src/compartido/modelo';
import type { Cuestionario, PerfilGarritas } from '../../src/matchmaking';
import { ADOPTANTE_A, ADOPTANTE_B } from '../../tests/matchmaking/datos';

// ----- §8.1 Cuentas -----

export const ALBERGUE = {
  uid: 'refugio-patitas',
  nombre: 'Refugio Patitas',
  correo: 'refugio.patitas@example.com',
} as const;

export type ClaveAdoptante = 'a' | 'b';

export interface AdoptantePrueba {
  uid: string;
  nombre: string;
  correo: string;
  telefono: string;
  cuestionario: Cuestionario;
  perfilGarritas: PerfilGarritas;
  /** Copia de p2, p12 y p19 que va en cada solicitud (M-1). */
  resumenHogar: ResumenHogar;
}

export const ADOPTANTES: Record<ClaveAdoptante, AdoptantePrueba> = {
  a: {
    uid: 'adoptante-a',
    nombre: 'Ana Torres',
    correo: 'ana.torres@example.com',
    telefono: '6460000001',
    cuestionario: ADOPTANTE_A,
    perfilGarritas: 'caminante',
    resumenHogar: { p2: 'casa', p12: 'menosDe4', p19: 'yaHeTenido' },
  },
  b: {
    uid: 'adoptante-b',
    nombre: 'Luis Pérez',
    correo: 'luis.perez@example.com',
    telefono: '6460000002',
    cuestionario: ADOPTANTE_B,
    perfilGarritas: 'puertasAbiertas',
    resumenHogar: { p2: 'departamento', p12: 'masDe8', p19: 'primeraVez' },
  },
};

// ----- §8.2 Animales -----

/** Lo que el script completa solo: albergue, miniatura y fecha. */
export type AnimalPrueba = Omit<
  Animal,
  'albergueId' | 'nombreAlbergue' | 'miniatura' | 'creadoEn'
> & {
  /** ID fijo del documento y nombre de sus imágenes en esta carpeta. */
  id: string;
};

// Edad y tamaño: opciones de F-02 (AL-1, AL-2) y 03-modelo-datos §8.2.
// Los 5 primeros son los originales; los 4 últimos, los nuevos de M-7.
export const ANIMALES: AnimalPrueba[] = [
  {
    id: 'wini',
    nombre: 'Wini',
    especie: 'perro',
    edad: '1 a 3 años',
    tamano: 'Pequeño',
    vacunado: true,
    esterilizado: true,
    perfilCompatibilidad: {
      energia: 'media',
      espacio: 'casa',
      tiempo: 'unasHoras',
      experiencia: 'facil',
      convivencia: 'conNinosYMascotas',
      temperamento: 'sociable',
    },
    estado: 'Disponible',
  },
  {
    id: 'luna',
    nombre: 'Luna',
    especie: 'gato',
    edad: '1 a 3 años',
    tamano: 'Pequeño',
    vacunado: true,
    esterilizado: false,
    perfilCompatibilidad: {
      energia: 'media',
      espacio: 'poco',
      tiempo: 'variasHoras',
      experiencia: 'medio',
      convivencia: 'soloConNinos',
      temperamento: 'timido',
    },
    estado: 'Disponible',
  },
  {
    id: 'rocky',
    nombre: 'Rocky',
    especie: 'perro',
    edad: '4 a 7 años',
    tamano: 'Grande',
    vacunado: false,
    esterilizado: false,
    perfilCompatibilidad: {
      energia: 'alta',
      espacio: 'casa',
      tiempo: 'compania',
      experiencia: 'especial',
      convivencia: 'soloConNinos',
      temperamento: 'tranquilo',
    },
    estado: 'En pre-adopción',
  },
  {
    id: 'toby',
    nombre: 'Toby',
    especie: 'perro',
    edad: '1 a 3 años',
    tamano: 'Mediano',
    vacunado: false,
    esterilizado: false,
    perfilCompatibilidad: {
      energia: 'alta',
      espacio: 'casa',
      tiempo: 'compania',
      experiencia: 'especial',
      convivencia: 'soloConNinos',
      temperamento: 'timido',
    },
    estado: 'Disponible',
  },
  {
    id: 'canela',
    nombre: 'Canela',
    especie: 'perro',
    edad: '1 a 3 años',
    tamano: 'Grande',
    vacunado: false,
    esterilizado: false,
    perfilCompatibilidad: {
      energia: 'alta',
      espacio: 'patioBardeado',
      tiempo: 'unasHoras',
      experiencia: 'medio',
      convivencia: 'conNinosYMascotas',
      temperamento: 'sociable',
    },
    estado: 'Disponible',
  },
  {
    id: 'tiara',
    nombre: 'Tiara',
    especie: 'perro',
    edad: '4 a 7 años',
    tamano: 'Pequeño',
    vacunado: true,
    esterilizado: true,
    perfilCompatibilidad: {
      energia: 'baja',
      espacio: 'poco',
      tiempo: 'variasHoras',
      experiencia: 'facil',
      convivencia: 'conNinosYMascotas',
      temperamento: 'tranquilo',
    },
    estado: 'Disponible',
  },
  {
    id: 'tostado',
    nombre: 'Tostado',
    especie: 'gato',
    edad: '1 a 3 años',
    tamano: 'Pequeño',
    vacunado: true,
    esterilizado: true,
    perfilCompatibilidad: {
      energia: 'media',
      espacio: 'poco',
      tiempo: 'variasHoras',
      experiencia: 'facil',
      convivencia: 'conNinosYMascotas',
      temperamento: 'sociable',
    },
    estado: 'Disponible',
  },
  {
    id: 'nova',
    nombre: 'Nova',
    especie: 'gato',
    edad: '1 a 3 años',
    tamano: 'Pequeño',
    vacunado: true,
    esterilizado: false,
    perfilCompatibilidad: {
      energia: 'baja',
      espacio: 'poco',
      tiempo: 'unasHoras',
      experiencia: 'medio',
      convivencia: 'soloConMascotas',
      temperamento: 'timido',
    },
    estado: 'Disponible',
  },
  {
    id: 'naranga',
    nombre: 'Naranga',
    especie: 'gato',
    edad: 'Menos de 1 año',
    tamano: 'Pequeño',
    vacunado: false,
    esterilizado: false,
    perfilCompatibilidad: {
      energia: 'alta',
      espacio: 'poco',
      tiempo: 'compania',
      experiencia: 'medio',
      convivencia: 'conNinosYMascotas',
      temperamento: 'sociable',
    },
    estado: 'Disponible',
  },
];

// ----- §8.3 Solicitudes -----

export interface SolicitudPrueba {
  id: string;
  animalId: string;
  adoptante: ClaveAdoptante;
  /** El % de la tabla de §8.2. La prueba T-4 revisa que el motor dé lo mismo. */
  porcentaje: number;
  estado: EstadoSolicitud;
}

export const SOLICITUDES: SolicitudPrueba[] = [
  { id: 's1', animalId: 'wini', adoptante: 'a', porcentaje: 90, estado: 'Pendiente' },
  { id: 's2', animalId: 'wini', adoptante: 'b', porcentaje: 70, estado: 'Pendiente' },
  { id: 's3', animalId: 'toby', adoptante: 'b', porcentaje: 24, estado: 'Pendiente' },
  { id: 's4', animalId: 'rocky', adoptante: 'a', porcentaje: 77, estado: 'Pre-aprobada' },
  { id: 's5', animalId: 'rocky', adoptante: 'b', porcentaje: 31, estado: 'Pendiente' },
  { id: 's6', animalId: 'luna', adoptante: 'b', porcentaje: 66, estado: 'Rechazada' },
];
