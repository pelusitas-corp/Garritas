/**
 * Hook de "Solicitudes · lista de mis animales" (spec F-07: flujo principal
 * pasos 1 a 3, A1, A4, A5; PS-2, PS-3 y PS-6).
 *
 * Cada vez que la pantalla recibe el foco (al abrirla, al cambiar de
 * pestaña o al volver de un animal), lee otra vez del servidor el nombre del
 * albergue, sus animales y sus solicitudes, y deja que `decidirPantallaLista`
 * diga qué dibujar. Mientras lee, el estado es "cargando" (indicador).
 *
 * No recibe nada. Devuelve `{ estado }` (ver `PantallaLista` en panel.ts).
 */
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import MENSAJES from '../../compartido/mensajes';
import {
  leerMisAnimales,
  leerNombreDelAlbergue,
  leerSolicitudesDelAlbergue,
  uidDelAlbergue,
} from '../../firebase/panelSolicitudes';
import { decidirPantallaLista } from './panel';
import type { PantallaLista } from './panel';

export default function useMisAnimales() {
  const [uid] = useState(uidDelAlbergue);
  const [estado, setEstado] = useState<PantallaLista>({ tipo: 'cargando' });
  /** Número de la lectura más reciente: las respuestas viejas se ignoran. */
  const turno = useRef(0);

  useFocusEffect(
    useCallback(() => {
      turno.current += 1;
      const miTurno = turno.current;
      if (!uid) {
        setEstado({ tipo: 'sin-permiso', mensaje: MENSAJES.SIN_PERMISO });
        return undefined;
      }
      setEstado({ tipo: 'cargando' });
      Promise.all([
        leerNombreDelAlbergue(uid),
        leerMisAnimales(uid),
        leerSolicitudesDelAlbergue(uid),
      ]).then(([nombre, animales, solicitudes]) => {
        if (miTurno === turno.current) {
          setEstado(decidirPantallaLista(nombre, animales, solicitudes));
        }
      });
      return () => {
        turno.current += 1; // Al perder el foco, se ignora cualquier respuesta pendiente.
      };
    }, [uid]),
  );

  return { estado };
}
