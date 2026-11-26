/**
 * Hook de "¡Solicitud enviada!" (spec F-06 flujo C: RF-11; A5, A6; MS-6).
 *
 * Lee `solicitudes/{solicitudId}` del servidor con `leerSolicitud` (F-08,
 * 10 s) y decide qué se dibuja con `decidirSolicitudEnviada`. La pantalla no
 * llama a Firestore directamente.
 *
 * Recibe el `solicitudId` de la ruta. Devuelve `{ estado, reintentar }`.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { leerSolicitud } from '../../firebase/decisionSolicitud';
import { decidirSolicitudEnviada } from './match';
import type { EstadoSolicitudEnviada } from './match';

export default function useSolicitudEnviada(solicitudId: string) {
  const [estado, setEstado] = useState<EstadoSolicitudEnviada>({ tipo: 'cargando' });
  /** Número de la lectura más reciente: las respuestas viejas se ignoran. */
  const turno = useRef(0);

  /** Flujo C, paso 1. El estado solo cambia cuando llega la respuesta. */
  const cargar = useCallback(() => {
    turno.current += 1;
    const miTurno = turno.current;
    return leerSolicitud(solicitudId).then((lectura) => {
      if (miTurno === turno.current) {
        setEstado(decidirSolicitudEnviada(lectura));
      }
    });
  }, [solicitudId]);

  useEffect(() => {
    cargar();
    return () => {
      turno.current += 1; // Al salir, se ignora cualquier respuesta pendiente.
    };
  }, [cargar]);

  /** "Reintentar" (A5, DE-6): vuelve al indicador de carga y lee otra vez. */
  const reintentar = useCallback(() => {
    setEstado({ tipo: 'cargando' });
    cargar();
  }, [cargar]);

  return { estado, reintentar };
}
