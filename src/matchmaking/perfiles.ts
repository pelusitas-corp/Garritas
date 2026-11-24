/**
 * Perfil Garritas del adoptante (spec F-05: RN-08, RF-19).
 * Es solo de presentación: no cambia ningún porcentaje.
 */
import MENSAJES from '../compartido/mensajes';
import { calcularValoresAdoptante } from './cuestionario';
import type { Cuestionario, PerfilGarritas } from './tipos';

/** Energía o Temperamento de 0.5 o más cuentan como "alto". */
export const UMBRAL_PERFIL = 0.5;

/** Nombres y frases confirmados por la PO al aprobar la spec (PO-21). */
export const PERFILES_GARRITAS: Readonly<
  Record<PerfilGarritas, { nombre: string; frase: string }>
> = {
  caminante: {
    nombre: 'Caminante',
    frase: 'Te encantan los paseos y la rutina. Tu match ideal te acompaña paso a paso.',
  },
  espirituExplorador: {
    nombre: 'Espíritu explorador',
    frase: 'Siempre hay un plan nuevo. Tu match ideal se apunta a todo.',
  },
  nidoTranquilo: {
    nombre: 'Nido tranquilo',
    frase: 'Tu hogar es calma y apapacho. Tu match ideal disfruta la paz.',
  },
  puertasAbiertas: {
    nombre: 'Puertas abiertas',
    frase: 'En tu casa siempre hay alguien. Tu match ideal ama la compañía.',
  },
};

export type ResultadoPerfil =
  | { completo: true; perfil: PerfilGarritas; nombre: string; frase: string }
  | { completo: false; mensaje: string };

/** RN-08: elige el perfil según Energía (filas) y Temperamento (columnas). */
function elegirPerfil(energia: number, temperamento: number): PerfilGarritas {
  const activo = energia >= UMBRAL_PERFIL;
  const casaMovida = temperamento >= UMBRAL_PERFIL;
  if (activo) {
    return casaMovida ? 'espirituExplorador' : 'caminante';
  }
  return casaMovida ? 'puertasAbiertas' : 'nidoTranquilo';
}

/**
 * RF-19: F-04 la llama al presionar "Ver mi perfil Garritas" y al abrir
 * "Mi perfil". Sin cuestionario terminado devuelve el mensaje de RF-19.
 */
export function asignarPerfilGarritas(cuestionario: Cuestionario): ResultadoPerfil {
  const valores = cuestionario.completo ? calcularValoresAdoptante(cuestionario.respuestas) : null;
  if (valores === null) {
    return { completo: false, mensaje: MENSAJES.PERFIL_SIN_CUESTIONARIO };
  }
  const perfil = elegirPerfil(valores.energia, valores.temperamento);
  return { completo: true, perfil, ...PERFILES_GARRITAS[perfil] };
}
