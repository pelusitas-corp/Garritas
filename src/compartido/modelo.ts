/**
 * Tipos de los documentos de Cloud Firestore (specs/03-modelo-datos.md §4 a §6).
 *
 * Es el "formato impreso" de cada ficha del archivero: las pantallas y
 * `src/firebase/` usan estos tipos para leer y escribir siempre los mismos
 * campos. Las claves del cuestionario y del perfil del animal vienen de
 * `src/matchmaking/tipos.ts` (F-05): no se repiten aquí.
 *
 * Solo hay tipos (no hay código que hable con Firebase): por eso se importa
 * `Timestamp` como tipo.
 */
import type { Timestamp } from 'firebase/firestore';

import type { Especie, PerfilCompatibilidad, PerfilGarritas, Respuestas } from '../matchmaking';
import type { Rol } from './navegacion/guardas';

// ----- Estados (03-modelo-datos §6) -----

/** Estado del animal (§6.1). "Adoptado" depende de PO-02 [PENDIENTE]. */
export type EstadoAnimal = 'Disponible' | 'En pre-adopción';

/** Estado de la solicitud (§6.2). "Pre-aprobada" y "Rechazada" son finales. */
export type EstadoSolicitud = 'Pendiente' | 'Pre-aprobada' | 'Rechazada';

export const ESTADO_ANIMAL = {
  disponible: 'Disponible',
  enPreAdopcion: 'En pre-adopción',
} as const satisfies Record<string, EstadoAnimal>;

export const ESTADO_SOLICITUD = {
  pendiente: 'Pendiente',
  preAprobada: 'Pre-aprobada',
  rechazada: 'Rechazada',
} as const satisfies Record<string, EstadoSolicitud>;

// ----- Opciones del alta del animal (§4.3, §4.4; F-02 AL-1 a AL-3) -----

/** Edad del animal. Se guarda el texto tal como se ve (F-02 AL-1, AL-5). */
export const OPCIONES_EDAD = [
  'Menos de 1 año',
  '1 a 3 años',
  '4 a 7 años',
  '8 años o más',
] as const;

/** Tamaño del animal. Se guarda el texto tal como se ve (F-02 AL-2, AL-5). */
export const OPCIONES_TAMANO = ['Pequeño', 'Mediano', 'Grande'] as const;

export type Edad = (typeof OPCIONES_EDAD)[number];
export type Tamano = (typeof OPCIONES_TAMANO)[number];

/** Máximo de fotos por animal (F-02 AL-3; mínimo 1, RF-13). */
export const MAX_FOTOS_ANIMAL = 3;

// ----- usuarios/{uid} (§4.1) -----

/** Aceptación del aviso de privacidad y de la mayoría de edad (RF-25). */
export interface Consentimiento {
  aceptado: true;
  fecha: Timestamp;
}

/** Ficha de una cuenta. `telefono` y `consentimiento` solo los tiene el adoptante. */
export interface Usuario {
  rol: Rol;
  nombre: string;
  correo: string;
  telefono?: string;
  consentimiento?: Consentimiento;
  creadoEn: Timestamp;
}

// ----- cuestionarios/{uid} (§4.2) -----

/** Cuestionario guardado en Firestore. `perfilGarritas` existe solo con `completo: true`. */
export interface DocumentoCuestionario {
  respuestas: Respuestas;
  completo: boolean;
  perfilGarritas?: PerfilGarritas;
  actualizadoEn: Timestamp;
}

// ----- animales/{animalId} (§4.3) -----

/** Ficha del animal. Se crea completa al publicar (RF-01, RF-13, RF-14). */
export interface Animal {
  albergueId: string;
  nombreAlbergue: string;
  nombre: string;
  especie: Especie;
  edad: Edad;
  tamano: Tamano;
  vacunado: boolean;
  esterilizado: boolean;
  perfilCompatibilidad: PerfilCompatibilidad;
  /** JPEG en base64 (M-2), hecha a partir de la foto con `orden: 0`. */
  miniatura: string;
  estado: EstadoAnimal;
  creadoEn: Timestamp;
}

// ----- animales/{animalId}/fotos/{fotoId} (§4.4) -----

/**
 * Una foto por documento para no pasar de 1 MiB (D-36). Su ID es
 * `foto-{orden}` (`foto-0` a `foto-2`; decisión del plan de F-02, AL-13).
 */
export interface Foto {
  /** JPEG en base64 (M-2), comprimida a 300 KB o menos. */
  datos: string;
  /** Entero de 0 a 2. La 0 es la primera del Detalle y de ella sale la miniatura. */
  orden: number;
}

// ----- solicitudes/{solicitudId} (§4.5) -----

/** Respuestas del hogar que ve el albergue en "Detalle de Solicitud" (M-1). */
export interface ResumenHogar {
  p2: NonNullable<Respuestas['p2']>;
  p12: NonNullable<Respuestas['p12']>;
  p19: NonNullable<Respuestas['p19']>;
}

/** Solicitud de adopción. Nombres, miniatura y resumen son copias del momento del envío. */
export interface Solicitud {
  animalId: string;
  albergueId: string;
  adoptanteId: string;
  nombreAdoptante: string;
  nombreAnimal: string;
  nombreAlbergue: string;
  miniaturaAnimal: string;
  /** Entero de 0 a 100, el mismo que mostró "Match" (RF-11). */
  porcentaje: number;
  /** `porcentaje < 30` (RF-18). */
  noApto: boolean;
  resumenHogar: ResumenHogar;
  estado: EstadoSolicitud;
  creadaEn: Timestamp;
  actualizadaEn: Timestamp;
}

// ----- solicitudes/{solicitudId}/privado/contacto (§4.6) -----

/** Contacto del adoptante. El albergue lo lee solo con la solicitud "Pre-aprobada" (RF-12). */
export interface Contacto {
  telefono: string;
  correo: string;
}

// ----- Rutas de Firestore (§4) -----

/** Nombres de las colecciones, para no escribirlos a mano en `src/firebase/`. */
export const COLECCIONES = {
  usuarios: 'usuarios',
  cuestionarios: 'cuestionarios',
  animales: 'animales',
  fotos: 'fotos',
  solicitudes: 'solicitudes',
  privado: 'privado',
} as const;

/** ID fijo del documento de contacto dentro de `privado` (§4.6). */
export const ID_CONTACTO = 'contacto';
