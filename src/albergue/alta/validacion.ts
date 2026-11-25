/**
 * Validación del alta del animal (F-02 RN-02, RN-03 y RN-07).
 *
 * Funciones puras: no usan React ni Firebase, así que se prueban con Jest
 * (tests/alta/validacion.test.ts).
 *
 * Orden (RN-02), un mensaje a la vez:
 * 1. RF-01: nombre, especie, edad y tamaño;
 * 2. RF-13: al menos una foto;
 * 3. RF-14: las 6 dimensiones del perfil.
 */
import type { Edad, Tamano } from '../../compartido/modelo';
import type { Especie, PerfilCompatibilidad } from '../../matchmaking';
import { CLAVES_PERFIL } from './opcionesPerfil';

/** Lo que hay en la pantalla. Lo que no se ha elegido es `null`. */
export interface FormularioAlta {
  nombre: string;
  especie: Especie | null;
  edad: Edad | null;
  tamano: Tamano | null;
  vacunado: boolean;
  esterilizado: boolean;
  perfil: Partial<PerfilCompatibilidad>;
  /** Cuántas fotos se han añadido (0 a 3). */
  numeroFotos: number;
}

/** Datos del animal ya revisados, listos para guardar (sin fotos ni campos de la app). */
export interface DatosAnimal {
  nombre: string;
  especie: Especie;
  edad: Edad;
  tamano: Tamano;
  vacunado: boolean;
  esterilizado: boolean;
  perfilCompatibilidad: PerfilCompatibilidad;
}

/** Claves de `mensajes.ts` que puede devolver la validación. */
export type ErrorAlta = 'CAMPOS_OBLIGATORIOS' | 'FOTO_OBLIGATORIA' | 'PERFIL_INCOMPLETO';

/**
 * Recibe el perfil elegido hasta ahora. Devuelve `true` (y TypeScript lo
 * trata como perfil completo) si tiene las 6 dimensiones.
 */
export function perfilCompleto(
  perfil: Partial<PerfilCompatibilidad>,
): perfil is PerfilCompatibilidad {
  return CLAVES_PERFIL.every((clave) => perfil[clave] !== undefined);
}

/**
 * Recibe el formulario. Devuelve la clave del primer mensaje que aplica
 * (RN-02), o `null` si se puede publicar (RN-03).
 */
export function validarAlta(formulario: FormularioAlta): ErrorAlta | null {
  const { nombre, especie, edad, tamano, numeroFotos, perfil } = formulario;
  if (nombre.trim() === '' || !especie || !edad || !tamano) {
    return 'CAMPOS_OBLIGATORIOS'; // RF-01
  }
  if (numeroFotos < 1) {
    return 'FOTO_OBLIGATORIA'; // RF-13
  }
  if (!perfilCompleto(perfil)) {
    return 'PERFIL_INCOMPLETO'; // RF-14
  }
  return null;
}

/**
 * Recibe el formulario. Devuelve los datos listos para guardar, con el
 * nombre sin espacios al inicio ni al final (RN-07), o `null` si
 * `validarAlta` encuentra un error.
 */
export function datosValidados(formulario: FormularioAlta): DatosAnimal | null {
  const { nombre, especie, edad, tamano, vacunado, esterilizado, perfil } = formulario;
  if (validarAlta(formulario) !== null || !especie || !edad || !tamano || !perfilCompleto(perfil)) {
    return null;
  }
  return {
    nombre: nombre.trim(),
    especie,
    edad,
    tamano,
    vacunado,
    esterilizado,
    perfilCompatibilidad: perfil,
  };
}
