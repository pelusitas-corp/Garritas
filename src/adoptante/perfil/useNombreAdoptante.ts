/**
 * Nombre del adoptante para Mi perfil (spec F-04 §6). Lo lee de
 * `usuarios/{uid}` con src/firebase/usuarios.ts.
 * Devuelve `cargando`, `con-datos` con el nombre, `error` o `sin-permiso`.
 */
import { useEffect, useState } from 'react';

import { uidDelAdoptante } from '../../firebase/cuestionario';
import { leerNombreUsuario } from '../../firebase/usuarios';

export type EstadoNombre =
  | { tipo: 'cargando' }
  | { tipo: 'con-datos'; nombre: string }
  | { tipo: 'error' }
  | { tipo: 'sin-permiso' };

export function useNombreAdoptante(): EstadoNombre {
  const [uid] = useState(uidDelAdoptante);
  const [estado, setEstado] = useState<EstadoNombre>(
    uid ? { tipo: 'cargando' } : { tipo: 'sin-permiso' },
  );

  useEffect(() => {
    if (!uid) {
      return undefined;
    }
    let vigente = true;
    leerNombreUsuario(uid).then((lectura) => {
      if (!vigente) {
        return;
      }
      if (lectura.estado === 'ok') {
        setEstado({ tipo: 'con-datos', nombre: lectura.nombre });
      } else {
        setEstado({ tipo: lectura.estado === 'sin-permiso' ? 'sin-permiso' : 'error' });
      }
    });
    return () => {
      vigente = false;
    };
  }, [uid]);

  return estado;
}
