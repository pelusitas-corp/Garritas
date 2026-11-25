// Pruebas de la validación del alta (F-02 RN-02, RN-03, RN-07; CA-01 a CA-06).
// El nombre de cada prueba es su criterio de aceptación.
import { datosValidados, validarAlta } from '../../src/albergue/alta/validacion';
import type { FormularioAlta } from '../../src/albergue/alta/validacion';
import MENSAJES from '../../src/compartido/mensajes';

/** Perfil de Wini (CA-05). */
const PERFIL_WINI = {
  energia: 'media',
  espacio: 'casa',
  tiempo: 'unasHoras',
  experiencia: 'facil',
  convivencia: 'conNinosYMascotas',
  temperamento: 'sociable',
} as const;

/** Formulario de CA-01: Max, Perro, "1 a 3 años", "Mediano", vacunado, 1 foto. */
const MAX: FormularioAlta = {
  nombre: 'Max',
  especie: 'perro',
  edad: '1 a 3 años',
  tamano: 'Mediano',
  vacunado: true,
  esterilizado: false,
  perfil: PERFIL_WINI,
  numeroFotos: 1,
};

describe('CA-01 · RF-01 válido', () => {
  test('RF-01 válido: con todo completo no hay mensaje y se puede publicar', () => {
    expect(validarAlta(MAX)).toBeNull();
  });
});

describe('CA-02 · RF-01 no válido: "Completa los campos obligatorios marcados con asterisco"', () => {
  test.each([
    ['el nombre vacío', { nombre: '' }],
    ['el nombre con solo espacios', { nombre: '   ' }],
    ['sin especie', { especie: null }],
    ['sin edad', { edad: null }],
    ['sin tamaño', { tamano: null }],
  ])('RF-01 no válido: con %s no se guarda y muestra el mensaje', (_caso, cambio) => {
    const clave = validarAlta({ ...MAX, ...cambio });
    expect(clave).toBe('CAMPOS_OBLIGATORIOS');
    expect(clave && MENSAJES[clave]).toBe(
      'Completa los campos obligatorios marcados con asterisco',
    );
  });
});

describe('CA-04 · RF-13 no válido', () => {
  test('RF-13 no válido: sin fotos no se guarda y muestra "Añade al menos una foto de la mascota"', () => {
    const clave = validarAlta({ ...MAX, numeroFotos: 0 });
    expect(clave && MENSAJES[clave]).toBe('Añade al menos una foto de la mascota');
  });
});

describe('CA-06 · RF-14 no válido', () => {
  test('RF-14 no válido: sin "Temperamento" no se guarda y muestra "Completa el perfil de compatibilidad para publicar a la mascota"', () => {
    const { temperamento, ...sinTemperamento } = PERFIL_WINI;
    expect(temperamento).toBe('sociable');
    const clave = validarAlta({ ...MAX, perfil: sinTemperamento });
    expect(clave && MENSAJES[clave]).toBe(
      'Completa el perfil de compatibilidad para publicar a la mascota',
    );
  });
});

describe('RN-02 · Un mensaje a la vez, en orden', () => {
  test('RN-02: sin nombre, sin fotos y sin perfil muestra primero el de RF-01', () => {
    expect(validarAlta({ ...MAX, nombre: '', numeroFotos: 0, perfil: {} })).toBe(
      'CAMPOS_OBLIGATORIOS',
    );
  });

  test('RN-02: sin fotos y sin perfil muestra primero el de RF-13', () => {
    expect(validarAlta({ ...MAX, numeroFotos: 0, perfil: {} })).toBe('FOTO_OBLIGATORIA');
  });
});

describe('CA-05 · RF-14 válido y RN-07', () => {
  test('RF-14 válido: los datos listos para guardar llevan el perfil de Wini completo', () => {
    expect(datosValidados(MAX)?.perfilCompatibilidad).toEqual(PERFIL_WINI);
  });

  test('RN-07: el nombre se guarda sin espacios al inicio ni al final', () => {
    expect(datosValidados({ ...MAX, nombre: '  Max  ' })?.nombre).toBe('Max');
  });

  test('RN-03: con un error no hay datos para guardar', () => {
    expect(datosValidados({ ...MAX, numeroFotos: 0 })).toBeNull();
  });
});
