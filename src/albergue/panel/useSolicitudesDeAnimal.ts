/**
 * Hook de "Solicitudes de un animal" (spec F-07: flujo principal pasos 5 y
 * 6, A2 a A5; PS-5 y PS-6; spec F-08: flujo principal pasos 3 a 7, RN-06,
 * PA-10, PA-11 y decisión 5 del plan).
 *
 * Cada vez que la pantalla recibe el foco (al abrirla o al volver del
 * Detalle de Solicitud):
 * 1. Lee del servidor el nombre del albergue y `animales/{animalId}`
 *    (`leerAnimal`, F-03).
 * 2. `decidirPantallaAnimal` revisa que el animal exista y sea de este
 *    albergue (PS-5, G-11). Si no, muestra "No tienes permiso…" y NO lee
 *    las solicitudes.
 * 3. Si es suyo, muestra el título y lee sus solicitudes; después las
 *    muestra ordenadas por % (RF-04) o el mensaje de RF-04 si no hay.
 *
 * Decisiones desde la tarjeta (F-08): `decidir(solicitudId, accion)`
 * pre-aprueba o rechaza con la transacción de `decisionSolicitud.ts`.
 * Mientras guarda, esa tarjeta tiene `guardando`; al terminar, su `mensaje`
 * (o `null` si salió bien). Con `ok` o "ya atendida" vuelve a leer las
 * solicitudes SIN el indicador de pantalla completa: la lista se queda
 * hasta que llegan los datos nuevos y el mensaje de la tarjeta sigue
 * visible (decisión 5 del plan). Los mensajes se borran al volver a decidir
 * en esa tarjeta o al salir de la pantalla.
 *
 * Recibe el `animalId` de la ruta. Devuelve `{ estado, decisiones, decidir }`.
 */
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import MENSAJES from '../../compartido/mensajes';
import { leerAnimal } from '../../firebase/animales';
import type { LecturaAnimal } from '../../firebase/animales';
import { preAprobarSolicitud, rechazarSolicitud } from '../../firebase/decisionSolicitud';
import {
  leerNombreDelAlbergue,
  leerSolicitudesDeAnimal,
  uidDelAlbergue,
} from '../../firebase/panelSolicitudes';
import type { LecturaNombre } from '../../firebase/usuarios';
import { debeVolverALeer, mensajeDeDecision } from '../solicitud/decision';
import type { AccionDecision } from '../solicitud/textos';
import { decidirPantallaAnimal } from './panel';
import type { PantallaAnimal } from './panel';

/** Estado de la decisión de UNA tarjeta (F-08 paso 5 y RN-06). */
export interface DecisionTarjeta {
  guardando: boolean;
  mensaje: string | null;
}

/** Lecturas del nombre y del animal ya revisadas (PS-5), para volver a leer solo las solicitudes. */
interface Revisadas {
  uid: string;
  nombre: LecturaNombre;
  animal: LecturaAnimal;
}

export default function useSolicitudesDeAnimal(animalId: string) {
  const [uid] = useState(uidDelAlbergue);
  const [estado, setEstado] = useState<PantallaAnimal>({ tipo: 'cargando' });
  const [decisiones, setDecisiones] = useState<Record<string, DecisionTarjeta>>({});
  /** Número de la lectura más reciente: las respuestas viejas se ignoran. */
  const turno = useRef(0);
  /** Nombre y animal de la última lectura, con el animal ya confirmado como suyo. */
  const revisadas = useRef<Revisadas | null>(null);
  /** Si la pantalla tiene el foco (al volver se lee todo de nuevo). */
  const enfocada = useRef(false);

  /** Pasos 1 a 3. Solo cambia el estado si esta lectura sigue siendo la más reciente. */
  const cargar = useCallback(
    async (miTurno: number, uidAlbergue: string) => {
      const vigente = () => miTurno === turno.current;
      const [nombre, animal] = await Promise.all([
        leerNombreDelAlbergue(uidAlbergue),
        leerAnimal(animalId),
      ]);
      if (!vigente()) {
        return;
      }
      const revisado = decidirPantallaAnimal(uidAlbergue, nombre, animal);
      setEstado(revisado);
      if (revisado.tipo !== 'leer-solicitudes') {
        revisadas.current = null;
        return; // PS-5: animal ajeno o inexistente, o falló una lectura.
      }
      revisadas.current = { uid: uidAlbergue, nombre, animal };
      const solicitudes = await leerSolicitudesDeAnimal(uidAlbergue, animalId);
      if (vigente()) {
        setEstado(decidirPantallaAnimal(uidAlbergue, nombre, animal, solicitudes));
      }
    },
    [animalId],
  );

  /**
   * PA-10 y decisión 5 del plan: vuelve a leer SOLO las solicitudes, sin el
   * indicador. Si esta lectura falla, se queda la lista que ya se veía (el
   * mensaje de la tarjeta ya explica qué pasó).
   */
  const volverALeerEnSilencio = useCallback(async () => {
    const previas = revisadas.current;
    if (!previas || !enfocada.current) {
      return; // Al volver a la pantalla se lee todo de nuevo.
    }
    turno.current += 1;
    const miTurno = turno.current;
    const solicitudes = await leerSolicitudesDeAnimal(previas.uid, animalId);
    if (miTurno === turno.current && solicitudes.estado === 'ok') {
      setEstado(decidirPantallaAnimal(previas.uid, previas.nombre, previas.animal, solicitudes));
    }
  }, [animalId]);

  /**
   * F-08 pasos 5 a 7: recibe la solicitud y la acción ya confirmada (PA-1).
   * Guarda con la transacción, pone el mensaje en esa tarjeta (RN-06) y, si
   * hace falta, vuelve a leer (PA-10). No devuelve nada.
   */
  const decidir = useCallback(
    async (solicitudId: string, accion: AccionDecision) => {
      setDecisiones((previas) => ({
        ...previas,
        [solicitudId]: { guardando: true, mensaje: null },
      }));
      const resultado =
        accion === 'pre-aprobar'
          ? await preAprobarSolicitud(solicitudId)
          : await rechazarSolicitud(solicitudId);
      setDecisiones((previas) => ({
        ...previas,
        [solicitudId]: { guardando: false, mensaje: mensajeDeDecision(resultado) },
      }));
      if (debeVolverALeer(resultado)) {
        await volverALeerEnSilencio();
      }
    },
    [volverALeerEnSilencio],
  );

  useFocusEffect(
    useCallback(() => {
      enfocada.current = true;
      turno.current += 1;
      if (!uid) {
        setEstado({ tipo: 'sin-permiso', mensaje: MENSAJES.SIN_PERMISO });
        return undefined;
      }
      setEstado({ tipo: 'cargando' });
      cargar(turno.current, uid);
      return () => {
        enfocada.current = false;
        turno.current += 1; // Al perder el foco, se ignora cualquier respuesta pendiente.
        setDecisiones({}); // Decisión 5 del plan: al salir se borran los mensajes.
      };
    }, [uid, cargar]),
  );

  return { estado, decisiones, decidir };
}
