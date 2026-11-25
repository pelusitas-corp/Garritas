/**
 * Hook de Mis solicitudes (spec F-06: flujo D, A5 a A7; RF-27; MS-6, MS-7).
 *
 * Cada vez que la pestaña recibe el foco lee del servidor las solicitudes
 * donde `adoptanteId == uid` (`useFocusEffect`, MS-6): así se ve el estado
 * que cambió el albergue en F-08. No usa `onSnapshot` (fuera de alcance).
 *
 * Decisión 4 del plan: el indicador de pantalla completa solo sale en la
 * primera lectura. Al volver a la pestaña, la lista se queda hasta que
 * llegan los datos nuevos. Si esa lectura falla, se muestra el error de
 * conexión con "Reintentar" (A5): sin conexión no se dejan datos viejos (MS-6).
 *
 * No recibe nada. Devuelve `{ estado, reintentar }`.
 */
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { uidDelAdoptante } from '../../firebase/cuestionario';
import { leerMisSolicitudes } from '../../firebase/solicitudes';
import { ordenarMisSolicitudes } from './misSolicitudes';
import type { EstadoMisSolicitudes } from './misSolicitudes';

export default function useMisSolicitudes() {
  const [uid] = useState(uidDelAdoptante);
  const [estado, setEstado] = useState<EstadoMisSolicitudes>(
    // G-1 ya asegura la sesión; sin ella, las reglas rechazarían todo (RNF-02).
    uid ? { tipo: 'cargando' } : { tipo: 'sin-permiso' },
  );
  /** Número de la lectura más reciente: las respuestas viejas se ignoran. */
  const turno = useRef(0);

  /** Flujo D, pasos 1 y 2: lee y ordena (MS-7). */
  const cargar = useCallback(async () => {
    turno.current += 1;
    const miTurno = turno.current;
    if (!uid) {
      return; // El estado inicial ya es "sin permiso".
    }
    const lectura = await leerMisSolicitudes(uid);
    if (miTurno !== turno.current) {
      return;
    }
    if (lectura.estado === 'ok') {
      setEstado({ tipo: 'con-datos', solicitudes: ordenarMisSolicitudes(lectura.solicitudes) });
    } else {
      setEstado({ tipo: lectura.estado === 'sin-permiso' ? 'sin-permiso' : 'error' });
    }
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      cargar();
      return () => {
        turno.current += 1; // Al salir de la pestaña, se ignora la lectura pendiente.
      };
    }, [cargar]),
  );

  /** "Reintentar" (A5, DE-6): vuelve al indicador de carga y lee otra vez. */
  const reintentar = useCallback(() => {
    setEstado({ tipo: 'cargando' });
    cargar();
  }, [cargar]);

  return { estado, reintentar };
}
