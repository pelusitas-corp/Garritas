// Pruebas de las guardas de navegación (specs/02-navegacion.md §6).
// El nombre de cada prueba es su criterio de aceptación.
import { decidirAcceso } from '../../src/compartido/navegacion/guardas';
import type { EstadoSesion } from '../../src/compartido/navegacion/guardas';

const ADOPTANTE_COMPLETO: EstadoSesion = {
  tipo: 'con-rol',
  rol: 'adoptante',
  cuestionarioCompleto: true,
};
const ADOPTANTE_INCOMPLETO: EstadoSesion = {
  tipo: 'con-rol',
  rol: 'adoptante',
  cuestionarioCompleto: false,
};
const ALBERGUE: EstadoSesion = { tipo: 'con-rol', rol: 'albergue', cuestionarioCompleto: false };

const DESCUBRIR = ['(adoptante)', '(pestanas)', 'descubrir'];
const DETALLE = ['(adoptante)', 'animal', '[animalId]'];
const MATCH = ['(adoptante)', 'match', '[animalId]'];
const MI_PERFIL = ['(adoptante)', '(pestanas)', 'mi-perfil'];
const MIS_SOLICITUDES = ['(adoptante)', '(pestanas)', 'mis-solicitudes'];
const SOLICITUDES = ['(albergue)', '(panel)', 'solicitudes'];

const AVISO_CUESTIONARIO = {
  accion: 'redirigir',
  destino: { pathname: '/cuestionario', params: { aviso: 'incompleto' } },
};

describe('CA-02 · RF-24 válido: cada rol ve solo sus funciones', () => {
  test('RF-24 válido: un adoptante entra a Descubrir, Mis solicitudes y Mi perfil', () => {
    [DESCUBRIR, MIS_SOLICITUDES, MI_PERFIL].forEach((segmentos) => {
      expect(decidirAcceso('adoptante', ADOPTANTE_COMPLETO, segmentos)).toEqual({
        accion: 'mostrar',
      });
    });
  });

  test('RF-24 válido: un albergue entra a Solicitudes', () => {
    expect(decidirAcceso('albergue', ALBERGUE, SOLICITUDES)).toEqual({ accion: 'mostrar' });
  });
});

describe('CA-03 · RF-24 no válido: "No tienes permiso para ver esta sección"', () => {
  test('RF-24 no válido: un adoptante abre el panel de solicitudes del albergue y se bloquea', () => {
    expect(decidirAcceso('albergue', ADOPTANTE_COMPLETO, SOLICITUDES)).toEqual({
      accion: 'bloquear',
      motivo: 'rol-equivocado',
    });
  });

  test('RF-24 no válido: un albergue abre Descubrir y se bloquea', () => {
    expect(decidirAcceso('adoptante', ALBERGUE, DESCUBRIR)).toEqual({
      accion: 'bloquear',
      motivo: 'rol-equivocado',
    });
  });
});

describe('CA-04 · RF-02 no válido: "Termina tu cuestionario para ver tus matches"', () => {
  test('RF-02 no válido: sin terminar el cuestionario, abrir Descubrir lleva al cuestionario con el aviso', () => {
    expect(decidirAcceso('adoptante', ADOPTANTE_INCOMPLETO, DESCUBRIR)).toEqual(AVISO_CUESTIONARIO);
  });

  test('G-5: sin terminar el cuestionario, abrir Detalle o Match también lleva al cuestionario', () => {
    expect(decidirAcceso('adoptante', ADOPTANTE_INCOMPLETO, DETALLE)).toEqual(AVISO_CUESTIONARIO);
    expect(decidirAcceso('adoptante', ADOPTANTE_INCOMPLETO, MATCH)).toEqual(AVISO_CUESTIONARIO);
  });
});

describe('CA-05 · RF-19 no válido: Mi perfil no redirige', () => {
  test('RF-19 no válido: sin terminar el cuestionario, Mi perfil se muestra (la pantalla pone el mensaje)', () => {
    expect(decidirAcceso('adoptante', ADOPTANTE_INCOMPLETO, MI_PERFIL)).toEqual({
      accion: 'mostrar',
    });
  });
});

describe('CA-13 · RNF-02 y G-4b', () => {
  test('RNF-02: si no se puede leer el rol por permisos, se bloquea con "No tienes permiso para ver esta sección"', () => {
    expect(decidirAcceso('adoptante', { tipo: 'sin-permiso' }, DESCUBRIR)).toEqual({
      accion: 'bloquear',
      motivo: 'sin-permiso',
    });
    expect(decidirAcceso('acceso', { tipo: 'sin-permiso' }, ['(acceso)'])).toEqual({
      accion: 'bloquear',
      motivo: 'sin-permiso',
    });
  });

  test('G-4b: sin conexión para leer el rol, se bloquea con el error de conexión', () => {
    expect(decidirAcceso('albergue', { tipo: 'error-conexion' }, SOLICITUDES)).toEqual({
      accion: 'bloquear',
      motivo: 'error-conexion',
    });
  });
});

describe('CA-14 · Sesión (F-01 A5)', () => {
  test('G-1: sin sesión, abrir Descubrir o Solicitudes lleva a Selección de Rol', () => {
    expect(decidirAcceso('adoptante', { tipo: 'sin-sesion' }, DESCUBRIR)).toEqual({
      accion: 'redirigir',
      destino: '/',
    });
    expect(decidirAcceso('albergue', { tipo: 'sin-sesion' }, SOLICITUDES)).toEqual({
      accion: 'redirigir',
      destino: '/',
    });
  });

  test('G-2: con sesión, abrir una pantalla de acceso lleva al inicio del rol', () => {
    expect(decidirAcceso('acceso', ALBERGUE, ['(acceso)'])).toEqual({
      accion: 'redirigir',
      destino: '/solicitudes',
    });
    expect(decidirAcceso('acceso', ADOPTANTE_COMPLETO, ['(acceso)', 'registro'])).toEqual({
      accion: 'redirigir',
      destino: '/descubrir',
    });
  });

  test('sin sesión, las pantallas de acceso se muestran', () => {
    expect(decidirAcceso('acceso', { tipo: 'sin-sesion' }, ['(acceso)'])).toEqual({
      accion: 'mostrar',
    });
  });

  test('mientras se lee la sesión, se espera (nunca se ve la pantalla equivocada)', () => {
    expect(decidirAcceso('adoptante', { tipo: 'cargando' }, DESCUBRIR)).toEqual({
      accion: 'esperar',
    });
  });
});
