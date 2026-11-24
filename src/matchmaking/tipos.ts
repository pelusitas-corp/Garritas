/**
 * Tipos del motor de match (spec F-05 §5).
 *
 * Estas claves son las mismas que se guardan en Firestore:
 * - `cuestionarios/{uid}.respuestas` (F-04)
 * - `animales/{id}.especie` y `animales/{id}.perfilCompatibilidad` (F-02)
 * - `cuestionarios/{uid}.perfilGarritas` (F-04)
 */

/** Las 6 dimensiones del match, en el orden de desempate de RN-07. */
export type Dimension =
  'energia' | 'espacio' | 'tiempo' | 'convivencia' | 'temperamento' | 'experiencia';

/** Valor de una respuesta u opción en una dimensión (RN-03, RN-04). */
export type Valor = 0 | 0.5 | 1;

// ----- Cuestionario del adoptante (ESTADO §6.3) -----

export type SiNo = 'si' | 'no';
export type Frecuencia = 'casiNunca' | 'aVeces' | 'seguido';

export interface Respuestas {
  p1?: 'perros' | 'gatos' | 'ambos';
  p2?: 'casa' | 'departamento';
  p3?: 'propia' | 'rentada';
  p4?: SiNo;
  p5?: SiNo;
  p6?: 'pequeno' | 'mediano' | 'grande';
  p7?: SiNo;
  p8?: SiNo;
  p9?: 'menosDe6' | 'seisOMas';
  p10?: SiNo;
  p11?: 'si' | 'noSe' | 'no';
  p12?: 'menosDe4' | 'de4a8' | 'masDe8';
  p13?: SiNo;
  p14?: 'seguido' | 'aVeces' | 'casiNunca';
  p15?: 'una' | 'dos' | 'tresOMas';
  p16?: 'min15' | 'min30' | 'horaOMas';
  p17?: 'enCasa' | 'unPocoDeTodo' | 'aireLibre';
  p18?: Frecuencia;
  p19?: 'primeraVez' | 'yaHeTenido';
  p20?: SiNo;
  p21?: 'paciencia' | 'consejo' | 'preocupacion';
  p22?: 'tranquila' | 'normal' | 'muyMovida';
  p23?: Frecuencia;
  p24?: 'poco' | 'normal' | 'mucho';
  p25?: 'tranquila' | 'juguetona' | 'sociable' | 'meAdapto';
}

export type IdPregunta = keyof Respuestas;

export interface Cuestionario {
  respuestas: Respuestas;
  completo: boolean;
}

// ----- Animal (ESTADO §6.4) -----

export type Especie = 'perro' | 'gato';

export type OpcionConvivencia =
  'sinNinosNiMascotas' | 'soloConNinos' | 'soloConMascotas' | 'conNinosYMascotas';

export interface PerfilCompatibilidad {
  energia: 'baja' | 'media' | 'alta';
  espacio: 'poco' | 'casa' | 'patioBardeado';
  tiempo: 'variasHoras' | 'unasHoras' | 'compania';
  experiencia: 'facil' | 'medio' | 'especial';
  convivencia: OpcionConvivencia;
  temperamento: 'timido' | 'tranquilo' | 'sociable';
}

/** Lo que el motor necesita de `animales/{id}`. El perfil puede venir incompleto. */
export interface AnimalParaMatch {
  animalId: string;
  especie: Especie;
  perfilCompatibilidad?: Partial<PerfilCompatibilidad>;
}

// ----- Resultados -----

export type ValoresPorDimension = Record<Dimension, number>;

export interface Explicacion {
  tipo: 'mayorAporte' | 'menorCoincidencia';
  /** Nombres que se muestran en "Match" (RN-07). */
  dimensiones: string[];
  /** Solo con menos de 30 % (RF-20 no válido). */
  mensaje?: string;
}

export interface ResultadoMatch {
  animalId: string;
  porcentaje: number;
  noApto: boolean;
  explicacion: Explicacion;
}

export type PerfilGarritas =
  'caminante' | 'espirituExplorador' | 'nidoTranquilo' | 'puertasAbiertas';
