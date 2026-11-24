/**
 * Filtros no negociables (spec F-05: RN-02, RF-17) y perfil completo (RF-03).
 */
import MENSAJES from '../compartido/mensajes';
import { DIMENSIONES, VALORES_ANIMAL } from './dimensiones';
import type { AnimalParaMatch, Especie, PerfilCompatibilidad, Respuestas } from './tipos';

/** Animal con su perfil de compatibilidad completo (las 6 dimensiones). */
export type AnimalCompleto = AnimalParaMatch & { perfilCompatibilidad: PerfilCompatibilidad };

/** RF-03 no válido: el animal tiene una opción válida en cada dimensión. */
export function tienePerfilCompleto(animal: AnimalParaMatch): animal is AnimalCompleto {
  const perfil = animal.perfilCompatibilidad;
  if (perfil === undefined) {
    return false;
  }
  return DIMENSIONES.every((dimension) => {
    const opcion = perfil[dimension];
    return opcion !== undefined && opcion in VALORES_ANIMAL[dimension];
  });
}

const excluyePorEspecie = (r: Respuestas, especie: Especie): boolean =>
  (r.p1 === 'perros' && especie === 'gato') || (r.p1 === 'gatos' && especie === 'perro');

const excluyePorRenta = (r: Respuestas): boolean => r.p3 === 'rentada' && r.p4 === 'no';

const excluyePorPatio = (r: Respuestas, perfil: PerfilCompatibilidad): boolean =>
  perfil.espacio === 'patioBardeado' && (r.p2 === 'departamento' || r.p5 === 'no');

const excluyePorVentanas = (r: Respuestas, especie: Especie): boolean =>
  especie === 'gato' && r.p7 === 'no';

const excluyePorConvivencia = (r: Respuestas, perfil: PerfilCompatibilidad): boolean => {
  const { convivencia } = perfil;
  const noConviveConNinos =
    convivencia === 'sinNinosNiMascotas' || convivencia === 'soloConMascotas';
  const noConviveConMascotas =
    convivencia === 'sinNinosNiMascotas' || convivencia === 'soloConNinos';
  return (r.p8 === 'si' && noConviveConNinos) || (r.p10 === 'si' && noConviveConMascotas);
};

/** RN-02: `true` si el animal pasa los 5 filtros FN-1 a FN-5. */
export function pasaFiltros(respuestas: Respuestas, animal: AnimalCompleto): boolean {
  const { especie, perfilCompatibilidad: perfil } = animal;
  return !(
    excluyePorEspecie(respuestas, especie) ||
    excluyePorRenta(respuestas) ||
    excluyePorPatio(respuestas, perfil) ||
    excluyePorVentanas(respuestas, especie) ||
    excluyePorConvivencia(respuestas, perfil)
  );
}

export type RevisionPostulacion = { permitida: true } | { permitida: false; mensaje: string };

/**
 * RF-17 no válido (flujo A2): F-06 la llama antes de enviar la solicitud.
 * Si el animal no pasa un filtro, devuelve el mensaje que se muestra.
 */
export function revisarPostulacion(
  respuestas: Respuestas,
  animal: AnimalCompleto,
): RevisionPostulacion {
  if (pasaFiltros(respuestas, animal)) {
    return { permitida: true };
  }
  return { permitida: false, mensaje: MENSAJES.mascotaNoCompatible };
}
