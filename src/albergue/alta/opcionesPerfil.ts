/**
 * Perfil de compatibilidad del animal: títulos y opciones de la pantalla
 * (F-02 §3.1; D-52 y 03-modelo-datos §5.2 sin "(depa)" ni "(FN-3)", AL-9).
 *
 * Analogía: es la tabla de equivalencias entre lo que el albergue toca
 * ("Necesita patio bardeado") y lo que se guarda (`patioBardeado`). Las
 * claves son las de `PerfilCompatibilidad` (src/matchmaking/tipos.ts), así
 * que TypeScript avisa si alguna no coincide con el motor de F-05.
 */
import type { PerfilCompatibilidad } from '../../matchmaking';
import type { Opcion } from './textos';

export type ClavePerfil = keyof PerfilCompatibilidad;

/** Una dimensión: su clave, el título que se ve y sus opciones. */
export type DimensionPerfil = {
  [K in ClavePerfil]: {
    clave: K;
    titulo: string;
    opciones: readonly Opcion<PerfilCompatibilidad[K]>[];
  };
}[ClavePerfil];

/** Las 6 dimensiones, en el orden de F-02 §3.1. */
export const DIMENSIONES_PERFIL: readonly DimensionPerfil[] = [
  {
    clave: 'energia',
    titulo: 'Nivel de energía',
    opciones: [
      { texto: 'Baja', valor: 'baja' },
      { texto: 'Media', valor: 'media' },
      { texto: 'Alta', valor: 'alta' },
    ],
  },
  {
    clave: 'espacio',
    titulo: 'Espacio que necesita',
    opciones: [
      { texto: 'Poco espacio', valor: 'poco' },
      { texto: 'Casa', valor: 'casa' },
      { texto: 'Necesita patio bardeado', valor: 'patioBardeado' },
    ],
  },
  {
    clave: 'tiempo',
    titulo: 'Cuánto tolera estar solo',
    opciones: [
      { texto: 'Tolera estar solo varias horas', valor: 'variasHoras' },
      { texto: 'Unas horas', valor: 'unasHoras' },
      { texto: 'Necesita compañía casi siempre', valor: 'compania' },
    ],
  },
  {
    clave: 'experiencia',
    titulo: 'Cuidado que requiere',
    opciones: [
      { texto: 'Cuidado fácil', valor: 'facil' },
      { texto: 'Cuidado medio', valor: 'medio' },
      { texto: 'Cuidado especial (miedo o entrenamiento)', valor: 'especial' },
    ],
  },
  {
    clave: 'convivencia',
    titulo: 'Con quién puede convivir',
    opciones: [
      { texto: 'Mejor sin niños ni mascotas', valor: 'sinNinosNiMascotas' },
      { texto: 'Solo con niños', valor: 'soloConNinos' },
      { texto: 'Solo con mascotas', valor: 'soloConMascotas' },
      { texto: 'Con niños y mascotas', valor: 'conNinosYMascotas' },
    ],
  },
  {
    clave: 'temperamento',
    titulo: 'Temperamento',
    opciones: [
      { texto: 'Tímido', valor: 'timido' },
      { texto: 'Tranquilo', valor: 'tranquilo' },
      { texto: 'Sociable', valor: 'sociable' },
    ],
  },
];

/** Las 6 claves del perfil. Las usa la validación (RF-14). */
export const CLAVES_PERFIL: readonly ClavePerfil[] = DIMENSIONES_PERFIL.map(
  (dimension) => dimension.clave,
);
