/**
 * Ilustración del perfil Garritas (spec F-04: CA-07, RN-10).
 */
import { ICONOS_PERFIL } from '../../src/adoptante/perfil/iconosPerfil';
import { asignarPerfilGarritas, PERFILES_GARRITAS } from '../../src/matchmaking';
import { ADOPTANTE_A, ADOPTANTE_B } from '../matchmaking/datos';

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
