/**
 * Lee el cuestionario del adoptante y le pide al motor su perfil Garritas
 * (spec F-04 §6 y §8; RF-19). Lo usan Perfil Garritas y Mi perfil.
 *
 * Devuelve uno de los estados de la pantalla (§8):
 * - `cargando`;
 * - `con-datos` con el `perfil`;
 * - `vacia` si el cuestionario no está completo (mensaje de RF-19);
 * - `error` sin conexión, o `sin-permiso` si las reglas lo rechazan (RNF-02).
 */
import { useEffect, useState } from 'react';

import { leerCuestionario, uidDelAdoptante } from '../../firebase/cuestionario';
import { asignarPerfilGarritas } from '../../matchmaking';
import type { PerfilGarritas } from '../../matchmaking';

export type EstadoPerfil =
  | { tipo: 'cargando' }
  | { tipo: 'con-datos'; perfil: PerfilGarritas }
  | { tipo: 'vacia' }
  | { tipo: 'error' }
  | { tipo: 'sin-permiso' };

export function usePerfilGarritas(): EstadoPerfil {
  const [uid] = useState(uidDelAdoptante);
  const [estado, setEstado] = useState<EstadoPerfil>(
    uid ? { tipo: 'cargando' } : { tipo: 'sin-permiso' },
  );

  useEffect(() => {
    if (!uid) {
      return undefined;
    }
    let vigente = true;
    leerCuestionario(uid).then((lectura) => {
      if (!vigente) {
        return;
      }
      if (lectura.estado === 'sin-permiso') {
        setEstado({ tipo: 'sin-permiso' });
      } else if (lectura.estado === 'sin-conexion') {
        setEstado({ tipo: 'error' });
      } else if (lectura.estado === 'no-existe') {
        setEstado({ tipo: 'vacia' });
      } else {
        // RF-19: mismas respuestas → mismo perfil (lo decide el motor F-05).
        const resultado = asignarPerfilGarritas({
          respuestas: lectura.respuestas,
          completo: lectura.completo,
        });
        setEstado(
          resultado.completo ? { tipo: 'con-datos', perfil: resultado.perfil } : { tipo: 'vacia' },
        );
      }
    });
    return () => {
      vigente = false;
    };
  }, [uid]);

  return estado;
}
