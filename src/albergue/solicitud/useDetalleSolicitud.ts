/**
 * Hook del Detalle de Solicitud (spec F-08: flujo desde el Detalle, A2 a
 * A7; RF-05, RF-21, RF-22, RF-12; PA-10, PA-11 y decisión 2 del plan).
 *
 * Cada vez que la pantalla recibe el foco:
 * 1. Lee `solicitudes/{solicitudId}` del servidor (indicador de pantalla).
 * 2. `decidirPantallaDetalle` revisa que sea de este albergue (G-11).
 * 3. Si está "Pre-aprobada", muestra la pantalla con el indicador en el
 *    lugar del contacto y lee `privado/contacto` (RF-12). Si está
 *    "Pendiente" o "Rechazada", NO lo lee (A4).
 *
 * `decidir(accion)` pre-aprueba o rechaza con la transacción. Mientras
 * guarda, `guardando` es `true`; al terminar, `mensaje` trae el mensaje
 * (o `null`). Con `ok` o "ya atendida" vuelve a leer SIN el indicador de
 * pantalla y, si quedó "Pre-aprobada", lee el contacto (PA-10). Si después
 * de pre-aprobar falla el contacto, el error va solo en su lugar (decisión 2).
 *
 * Recibe el `solicitudId` de la ruta. Devuelve `{ estado, guardando, mensaje, decidir }`.
 */
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import MENSAJES from '../../compartido/mensajes';
import {
  leerContacto,
  leerSolicitud,
  preAprobarSolicitud,
  rechazarSolicitud,
} from '../../firebase/decisionSolicitud';
import { uidDelAlbergue } from '../../firebase/panelSolicitudes';
import { debeVolverALeer, decidirPantallaDetalle, mensajeDeDecision } from './decision';
import type { MomentoDetalle, PantallaDetalle } from './decision';
import type { AccionDecision } from './textos';

export default function useDetalleSolicitud(solicitudId: string) {
  const [uid] = useState(uidDelAlbergue);
  const [estado, setEstado] = useState<PantallaDetalle>({ tipo: 'cargando' });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  /** Número de la lectura más reciente: las respuestas viejas se ignoran. */
  const turno = useRef(0);
  /** Si la pantalla tiene el foco (al volver se lee todo de nuevo). */
  const enfocada = useRef(false);

  /**
   * Pasos 1 a 3. Recibe el `uid`, el momento y si es una relectura en
   * silencio (después de decidir). En silencio, si la solicitud no se puede
   * leer, se queda lo que ya se veía (el mensaje ya explica qué pasó).
   */
  const leer = useCallback(
    async (uidAlbergue: string, momento: MomentoDetalle, enSilencio: boolean) => {
      turno.current += 1;
      const miTurno = turno.current;
      const vigente = () => miTurno === turno.current;
      if (!enSilencio) {
        setEstado({ tipo: 'cargando' });
      }
      const solicitud = await leerSolicitud(solicitudId);
      if (!vigente() || (enSilencio && solicitud.estado !== 'ok')) {
        return;
      }
      const pantalla = decidirPantallaDetalle(uidAlbergue, solicitud, undefined, momento);
      setEstado(pantalla);
      if (pantalla.tipo !== 'con-datos' || pantalla.contacto.tipo !== 'cargando') {
        return; // Ajena, error, o el contacto no se lee (A4).
      }
      const contacto = await leerContacto(solicitudId);
      if (vigente()) {
        setEstado(decidirPantallaDetalle(uidAlbergue, solicitud, contacto, momento));
      }
    },
    [solicitudId],
  );

  /**
   * Flujo desde el Detalle, pasos 4 y 5: recibe la acción ya confirmada
   * (PA-1). Guarda, pone el mensaje arriba de los botones (PA-11) y, si hace
   * falta, vuelve a leer en silencio (PA-10). No devuelve nada.
   */
  const decidir = useCallback(
    async (accion: AccionDecision) => {
      setGuardando(true);
      setMensaje(null);
      const resultado =
        accion === 'pre-aprobar'
          ? await preAprobarSolicitud(solicitudId)
          : await rechazarSolicitud(solicitudId);
      setGuardando(false);
      setMensaje(mensajeDeDecision(resultado));
      if (uid && enfocada.current && debeVolverALeer(resultado)) {
        await leer(uid, 'despues-de-decidir', true);
      }
    },
    [solicitudId, uid, leer],
  );

  useFocusEffect(
    useCallback(() => {
      enfocada.current = true;
      setMensaje(null);
      if (!uid) {
        setEstado({ tipo: 'sin-permiso', mensaje: MENSAJES.SIN_PERMISO });
        return undefined;
      }
      leer(uid, 'al-abrir', false);
      return () => {
        enfocada.current = false;
        turno.current += 1; // Al perder el foco, se ignora cualquier respuesta pendiente.
      };
    }, [uid, leer]),
  );

  return { estado, guardando, mensaje, decidir };
}
