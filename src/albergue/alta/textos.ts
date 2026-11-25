/**
 * Textos de la pantalla "Nueva mascota" (F-02 §3.2, AL-10).
 *
 * La pantalla usa SOLO estos textos. Los mensajes de error no van aquí:
 * viven en src/compartido/mensajes.ts (F-02 §5).
 */
import type { Edad, Tamano } from '../../compartido/modelo';
import { OPCIONES_EDAD, OPCIONES_TAMANO } from '../../compartido/modelo';
import type { Especie } from '../../matchmaking';

export const TEXTOS_ALTA = {
  /** Nombre de la pantalla en Figma y 02-navegacion §4.3. */
  titulo: 'Nueva mascota',
  /** SRS RF-13 y RF-01. */
  anadirFoto: 'Añadir una foto',
  publicar: 'Publicar para adopción',
  /** Decisión del equipo (AL-4); no está en el SRS. */
  tomarFoto: 'Tomar foto',
  elegirGaleria: 'Elegir de la galería',
  /** SRS RF-01 (asterisco, D-34). */
  nombre: 'Nombre *',
  especie: 'Especie *',
  edad: 'Edad *',
  tamano: 'Tamaño *',
  /** SRS RF-01 y D-34. */
  cuidados: 'Cuidados de salud',
  vacunado: 'Vacunado',
  esterilizado: 'Esterilizado',
  /** SRS RF-14 (mensaje no válido). */
  perfil: 'Perfil de compatibilidad',
  /** Botón para quitar una foto antes de publicar (F-02 §4 paso 3, AL-3). */
  quitarFoto: '✕',
} as const;

/** Una opción de un toque: el texto que se ve y el valor que se guarda. */
export interface Opcion<V extends string> {
  texto: string;
  valor: V;
}

/** "Perro" · "Gato" (SRS RF-01). Se guarda la clave de `Especie`. */
export const OPCIONES_ESPECIE: readonly Opcion<Especie>[] = [
  { texto: 'Perro', valor: 'perro' },
  { texto: 'Gato', valor: 'gato' },
];

/** Edad y tamaño se guardan con el mismo texto que se ve (AL-5). */
export const OPCIONES_EDAD_ALTA: readonly Opcion<Edad>[] = OPCIONES_EDAD.map((edad) => ({
  texto: edad,
  valor: edad,
}));

export const OPCIONES_TAMANO_ALTA: readonly Opcion<Tamano>[] = OPCIONES_TAMANO.map((tamano) => ({
  texto: tamano,
  valor: tamano,
}));
