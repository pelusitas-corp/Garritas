/**
 * Estados de Descubrir y del Detalle (spec F-03: CA-02, CA-04, CA-07, RNF-01, RNF-02, A5).
 * Se prueban las props que recibe `EstadoPantalla` (sin dibujar: no hay
 * librería de dibujo en Jest, decisión 3 del plan). El nombre de cada
 * prueba es su criterio de aceptación.
 */
import MENSAJES from '../../src/compartido/mensajes';
import { pantallaDescubrir, pantallaDetalle } from '../../src/adoptante/descubrir/estados';
import { iconoCuidado } from '../../src/adoptante/descubrir/iconosDescubrir';
import { armarMazo, crearMazo, pasar } from '../../src/adoptante/descubrir/mazo';
import {
  NOMBRE_ESPECIE,
  TEXTO_REINTENTAR,
  TEXTO_VER_DE_NUEVO,
  textoConoceA,
  textoPorcentaje,
} from '../../src/adoptante/descubrir/textos';
import { ADOPTANTES } from '../../scripts/datos-prueba/datos';
import { ANIMALES_FIRESTORE } from './datosDescubrir';

const reintentar = jest.fn();
const verDeNuevo = jest.fn();
const ACCIONES = { reintentar, verDeNuevo };

const LUIS = ADOPTANTES.b.cuestionario;

describe('F-03 · Estados de Descubrir', () => {
  test('RNF-01: mientras carga, después de 3 s aparece "Calculando compatibilidad, verifica tu conexión a internet"', () => {
    // EstadoPantalla muestra `mensajeSiTarda` a los ESPERA_MAXIMA_MS (3000 ms).
    expect(pantallaDescubrir({ tipo: 'cargando' }, ACCIONES)).toEqual({
      estado: 'cargando',
      mensajeSiTarda: 'Calculando compatibilidad, verifica tu conexión a internet',
    });
  });

  test('CA-02 RF-10 no válido: con error de conexión muestra "Error al cargar las mascotas, verifica tu conexión a internet" y "Reintentar"', () => {
    const props = pantallaDescubrir({ tipo: 'error' }, ACCIONES);

    expect(props).toMatchObject({
      estado: 'error',
      mensaje: 'Error al cargar las mascotas, verifica tu conexión a internet',
      boton: { texto: TEXTO_REINTENTAR },
    });
    props?.boton?.alPresionar();
    expect(reintentar).toHaveBeenCalled();
  });

  test('CA-04 RF-26 no válido: con P3 Rentada y P4 No muestra "Por ahora no hay mascotas compatibles con tu hogar. Vuelve pronto"', () => {
    const rentaSinMascotas = {
      ...LUIS,
      respuestas: { ...LUIS.respuestas, p3: 'rentada' as const, p4: 'no' as const },
    };
    const mazo = crearMazo(armarMazo(rentaSinMascotas, ANIMALES_FIRESTORE) ?? []);

    expect(pantallaDescubrir({ tipo: 'con-datos', mazo }, ACCIONES)).toEqual({
      estado: 'vacia',
      mensaje: 'Por ahora no hay mascotas compatibles con tu hogar. Vuelve pronto',
    });
  });

  test('CA-07: al pasar las 3 tarjetas de Luis muestra MAZO_TERMINADO con "Ver de nuevo" y no el mensaje de RF-26', () => {
    const mazo = pasar(pasar(pasar(crearMazo(armarMazo(LUIS, ANIMALES_FIRESTORE) ?? []))));
    const props = pantallaDescubrir({ tipo: 'con-datos', mazo }, ACCIONES);

    expect(props?.mensaje).toBe(
      'Ya viste a todas tus mascotas compatibles. Vuelve pronto para conocer nuevas',
    );
    expect(props?.mensaje).not.toBe(MENSAJES.SIN_MASCOTAS_COMPATIBLES);
    expect(props?.boton?.texto).toBe(TEXTO_VER_DE_NUEVO);
    props?.boton?.alPresionar();
    expect(verDeNuevo).toHaveBeenCalled();
  });

  test('CA-01 RF-10 válido: con tarjetas no dibuja ningún estado, solo el mazo', () => {
    const mazo = crearMazo(armarMazo(LUIS, ANIMALES_FIRESTORE) ?? []);

    expect(pantallaDescubrir({ tipo: 'con-datos', mazo }, ACCIONES)).toBeNull();
  });

  test('RNF-02: una lectura rechazada muestra "No tienes permiso para ver esta sección"', () => {
    expect(pantallaDescubrir({ tipo: 'sin-permiso' }, ACCIONES)).toEqual({
      estado: 'sin-permiso',
      mensaje: 'No tienes permiso para ver esta sección',
    });
  });
});

describe('F-03 · Estados del Detalle', () => {
  test('A5: sin conexión muestra "Error de conexión, verifica tu conexión a internet" con "Reintentar"', () => {
    expect(pantallaDetalle('error', reintentar)).toMatchObject({
      estado: 'error',
      mensaje: 'Error de conexión, verifica tu conexión a internet',
      boton: { texto: 'Reintentar' },
    });
  });

  test('RNF-02: en el Detalle, una lectura rechazada muestra "No tienes permiso para ver esta sección"', () => {
    expect(pantallaDetalle('sin-permiso', reintentar)).toEqual({
      estado: 'sin-permiso',
      mensaje: 'No tienes permiso para ver esta sección',
    });
  });

  test('RN-06: con el animal cargado no dibuja ningún estado', () => {
    expect(pantallaDetalle('con-datos', reintentar)).toBeNull();
  });
});

describe('F-03 · Textos e íconos', () => {
  test('RF-10: la tarjeta dice "{n} % compatible"', () => {
    expect(textoPorcentaje(90)).toBe('90 % compatible');
  });

  test('RF-28: el título del Detalle es "Conoce a Wini" y la especie se lee "Perro"', () => {
    expect(textoConoceA('Wini')).toBe('Conoce a Wini');
    expect(NOMBRE_ESPECIE.perro).toBe('Perro');
    expect(NOMBRE_ESPECIE.gato).toBe('Gato');
  });

  test('DE-7: los cuidados de salud usan el ícono de sí o de no', () => {
    expect(iconoCuidado(true)).toBe('check-circle');
    expect(iconoCuidado(false)).toBe('close-circle');
  });
});
