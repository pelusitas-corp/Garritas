/**
 * Ilustración del perfil Garritas (spec F-04: CA-07, RN-10).
 */
import { ICONOS_PERFIL } from '../../src/adoptante/perfil/iconosPerfil';
import { TEXTO_TU_PERFIL, textoSaludo } from '../../src/adoptante/perfil/textos';
import { MEDIDAS_BOTON, aspectoBoton } from '../../src/compartido/BotonPildora';
import { asignarPerfilGarritas, PERFILES_GARRITAS } from '../../src/matchmaking';
import { ADOPTANTE_A, ADOPTANTE_B } from '../matchmaking/datos';

// Los íconos no se dibujan en estas pruebas: se reemplazan por un "doble".
jest.mock('@expo/vector-icons', () => ({ MaterialCommunityIcons: () => null }));

describe('F-04 · CA-07 · RF-19 válido', () => {
  test('RF-19 válido: el adoptante A ve el ícono "hiking" y "Caminante"', () => {
    const resultado = asignarPerfilGarritas(ADOPTANTE_A);
    expect(resultado).toMatchObject({ completo: true, perfil: 'caminante', nombre: 'Caminante' });
    if (resultado.completo) {
      expect(ICONOS_PERFIL[resultado.perfil]).toBe('hiking');
    }
  });

  test('RF-19 válido: el adoptante B ve "Puertas abiertas" con el ícono "home-heart"', () => {
    const resultado = asignarPerfilGarritas(ADOPTANTE_B);
    expect(resultado).toMatchObject({ completo: true, perfil: 'puertasAbiertas' });
    if (resultado.completo) {
      expect(ICONOS_PERFIL[resultado.perfil]).toBe('home-heart');
    }
  });

  test('RN-10: cada uno de los 4 perfiles tiene su ilustración', () => {
    expect(Object.keys(ICONOS_PERFIL).sort()).toEqual(Object.keys(PERFILES_GARRITAS).sort());
  });
});

describe('F-13 · CA-01 · AF-1, AF-2 (decisión del equipo, no está en el SRS)', () => {
  test('CA-01 · AF-1, AF-2: Mi perfil dice "¡Hola, Ana Torres!" y "Tu perfil Garritas es:"', () => {
    expect(textoSaludo('Ana Torres')).toBe('¡Hola, Ana Torres!');
    expect(TEXTO_TU_PERFIL).toBe('Tu perfil Garritas es:');
  });

  test('CA-01 · AF-2: "Cerrar sesión" es una píldora chica azul grisáceo', () => {
    expect(aspectoBoton('principal', { gris: true })).toMatchObject({
      fondo: 'azulGrisaceo',
      responde: true,
    });
    expect(MEDIDAS_BOTON.chico.alignSelf).toBe('center');
  });
});
