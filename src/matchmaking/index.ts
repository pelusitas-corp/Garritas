/**
 * Puerta de entrada del motor de match (spec F-05).
 * Las pantallas importan desde aquí: `import { evaluarAnimales } from '../matchmaking'`.
 */
export { evaluarAnimales } from './motor';
export type { ResultadoEvaluacion } from './motor';
export { revisarPostulacion, tienePerfilCompleto } from './filtros';
export type { AnimalCompleto, RevisionPostulacion } from './filtros';
export { esNoApto, UMBRAL_NO_APTO } from './calculo';
export { asignarPerfilGarritas, PERFILES_GARRITAS } from './perfiles';
export type { ResultadoPerfil } from './perfiles';
export { preguntaAplica } from './cuestionario';
export * from './tipos';
