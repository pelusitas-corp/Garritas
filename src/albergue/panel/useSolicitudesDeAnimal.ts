/**
 * Hook de "Solicitudes de un animal" (spec F-07: flujo principal pasos 5 y
 * 6, A2 a A5; PS-5 y PS-6).
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
 * Recibe el `animalId` de la ruta. Devuelve `{ estado }` (ver `PantallaAnimal`).
 */
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import MENSAJES from '../../compartido/mensajes';
import { leerAnimal } from '../../firebase/animales';
import {
  leerNombreDelAlbergue,
  leerSolicitudesDeAnimal,
  uidDelAlbergue,
} from '../../firebase/panelSolicitudes';
import { decidirPantallaAnimal } from './panel';
import type { PantallaAnimal } from './panel';

export default function useSolicitudesDeAnimal(animalId: string) {
  const [uid] = useState(uidDelAlbergue);
  const [estado, setEstado] = useState<PantallaAnimal>({ tipo: 'cargando' });
  /** Número de la lectura más reciente: las respuestas viejas se ignoran. */
  const turno = useRef(0);

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
        return; // PS-5: animal ajeno o inexistente, o falló una lectura.
      }
      const solicitudes = await leerSolicitudesDeAnimal(uidAlbergue, animalId);
      if (vigente()) {
        setEstado(decidirPantallaAnimal(uidAlbergue, nombre, animal, solicitudes));
      }
    },
    [animalId],
  );

  useFocusEffect(
    useCallback(() => {
      turno.current += 1;
      if (!uid) {
        setEstado({ tipo: 'sin-permiso', mensaje: MENSAJES.SIN_PERMISO });
        return undefined;
      }
      setEstado({ tipo: 'cargando' });
      cargar(turno.current, uid);
      return () => {
        turno.current += 1; // Al perder el foco, se ignora cualquier respuesta pendiente.
      };
    }, [uid, cargar]),
  );

  return { estado };
}
