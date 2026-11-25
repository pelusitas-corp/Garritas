/**
 * Hook de Descubrir (spec F-03: flujo A, A1 a A4, A6; RN-03, RN-08; RF-10, RF-26, RNF-01).
 *
 * Lee el cuestionario y los animales "Disponible", arma el mazo con el
 * motor (`armarMazo`) y lleva la tarjeta actual. La pantalla solo dibuja
 * lo que este hook devuelve.
 *
 * Cuándo se calcula (RN-03, DE-5): cada vez que Descubrir recibe el foco,
 * salvo cuando regresa del Detalle con "←" o "✕" (el mazo sigue en la
 * misma tarjeta). Si llega con `?aviso=no-disponible` (G-8, DE-4), siempre
 * recalcula, muestra el aviso y el mazo empieza de nuevo. El aviso se quita
 * solo a los 5 s o con la siguiente acción (DE-9, spec v1.1).
 *
 * No recibe nada. Devuelve `{ estado, avisoNoDisponible, pasar, verDeNuevo,
 * abrirDetalle, reintentar }`.
 */
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  AVISO_NO_DISPONIBLE,
  rutaAnimal,
  rutaCuestionarioConAviso,
} from '../../compartido/navegacion/rutas';
import { conTiempoLimite } from '../../firebase/acceso';
import { leerAnimalesDisponibles } from '../../firebase/animales';
import { ESPERA_GUARDAR_MS, leerCuestionario, uidDelAdoptante } from '../../firebase/cuestionario';
import { programarQuitarAviso } from './aviso';
import type { EstadoDescubrir } from './estados';
import { armarMazo, crearMazo, pasar as pasarTarjeta, verDeNuevo as reiniciarMazo } from './mazo';

/**
 * RN-08: `leerCuestionario` (F-04) no tiene tiempo límite. Recibe el `uid`.
 * Devuelve la misma lectura, o `sin-conexion` si no responde en 10 s.
 */
function leerCuestionarioConLimite(uid: string) {
  return conTiempoLimite(leerCuestionario(uid), ESPERA_GUARDAR_MS).catch(
    () => ({ estado: 'sin-conexion' }) as const,
  );
}

/** Lo único que este hook usa de la navegación de su pantalla. */
interface NavegacionDescubrir {
  setParams: (parametros: { aviso?: string }) => void;
}

export default function useDescubrir() {
  const { aviso } = useLocalSearchParams<{ aviso?: string }>();
  // Solo se usa para borrar `?aviso` en la ruta de Descubrir (no en la que tenga el foco).
  const navigation = useNavigation<NavegacionDescubrir>();
  const [uid] = useState(uidDelAdoptante);
  const [estado, setEstado] = useState<EstadoDescubrir>({ tipo: 'cargando' });
  const [avisoNoDisponible, setAvisoNoDisponible] = useState(false);
  /** Se prende justo antes de abrir el Detalle (DE-5). */
  const fuiAlDetalle = useRef(false);
  /** Se prende al atender `?aviso=no-disponible`; se apaga al salir, cuando se borra el parámetro. */
  const avisoAtendido = useRef(false);
  /** Número de la lectura más reciente: las respuestas viejas se ignoran. */
  const turno = useRef(0);

  /** Pasos 2 a 6 del flujo A: lee, arma el mazo y lo deja en la primera tarjeta. */
  const calcular = useCallback(async () => {
    turno.current += 1;
    const miTurno = turno.current;
    if (!uid) {
      setEstado({ tipo: 'sin-permiso' });
      return;
    }
    setEstado({ tipo: 'cargando' });
    const [cuestionario, animales] = await Promise.all([
      leerCuestionarioConLimite(uid),
      leerAnimalesDisponibles(),
    ]);
    if (miTurno !== turno.current) {
      return;
    }
    if (cuestionario.estado === 'sin-permiso' || animales.estado === 'sin-permiso') {
      setEstado({ tipo: 'sin-permiso' }); // A6, RNF-02
      return;
    }
    if (cuestionario.estado === 'sin-conexion' || animales.estado === 'sin-conexion') {
      setEstado({ tipo: 'error' }); // A3, RF-10 no válido
      return;
    }
    const tarjetas =
      cuestionario.estado === 'existe'
        ? armarMazo(
            { respuestas: cuestionario.respuestas, completo: cuestionario.completo },
            animales.animales,
          )
        : null;
    if (tarjetas === null) {
      router.replace(rutaCuestionarioConAviso()); // Decisión 2 del plan: igual que G-5
      return;
    }
    setEstado({ tipo: 'con-datos', mazo: crearMazo(tarjetas) });
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      if (aviso === AVISO_NO_DISPONIBLE && !avisoAtendido.current) {
        // G-8 (DE-4): llegó del Detalle con el aviso. Se muestra en este mismo
        // momento y el mazo se recalcula (empieza de nuevo).
        avisoAtendido.current = true;
        fuiAlDetalle.current = false;
        setAvisoNoDisponible(true);
        calcular();
      } else if (fuiAlDetalle.current) {
        // DE-5: regresa del Detalle con "←" o "✕": el mazo sigue en la misma tarjeta.
        fuiAlDetalle.current = false;
      } else if (!avisoAtendido.current) {
        // RN-03: abrió Descubrir (pestaña, Perfil Garritas o inicio de sesión).
        setAvisoNoDisponible(false);
        calcular();
      }
      // Al salir de Descubrir (o si cambia el parámetro estando aquí):
      return () => {
        setAvisoNoDisponible(false); // DE-9: salir de Descubrir quita el aviso.
        if (avisoAtendido.current) {
          // El parámetro se borra AQUÍ, ya fuera de Descubrir, y solo en su
          // propia ruta. Antes se borraba al recibir el foco, en medio del
          // `dismissTo` del Detalle, y la pantalla no se repintaba hasta que el
          // adoptante tocaba algo (prueba en el celular de G-8).
          avisoAtendido.current = false;
          navigation.setParams({ aviso: undefined });
        }
      };
    }, [aviso, calcular, navigation]),
  );

  // DE-9: el aviso de G-8 se quita solo a los 5 s.
  useEffect(() => {
    if (!avisoNoDisponible) {
      return undefined;
    }
    return programarQuitarAviso(() => setAvisoNoDisponible(false));
  }, [avisoNoDisponible]);

  /** "Pasar" (N-2, RN-04): siguiente tarjeta. No guarda nada. Quita el aviso (DE-9). */
  const pasar = useCallback(() => {
    setAvisoNoDisponible(false);
    setEstado((actual) =>
      actual.tipo === 'con-datos' ? { ...actual, mazo: pasarTarjeta(actual.mazo) } : actual,
    );
  }, []);

  /** "Ver de nuevo" (DE-1): vuelve a la primera tarjeta sin leer Firestore. Quita el aviso (DE-9). */
  const verDeNuevo = useCallback(() => {
    setAvisoNoDisponible(false);
    setEstado((actual) =>
      actual.tipo === 'con-datos' ? { ...actual, mazo: reiniciarMazo(actual.mazo) } : actual,
    );
  }, []);

  /** Tarjeta, "ⓘ" o "Me encanta" (RF-28, N-2). Recibe el `animalId`. Quita el aviso (DE-9). */
  const abrirDetalle = useCallback((animalId: string) => {
    setAvisoNoDisponible(false);
    fuiAlDetalle.current = true;
    router.push(rutaAnimal(animalId));
  }, []);

  /** "Reintentar" (DE-6): vuelve a leer y a calcular. */
  const reintentar = useCallback(() => {
    calcular();
  }, [calcular]);

  return { estado, avisoNoDisponible, pasar, verDeNuevo, abrirDetalle, reintentar };
}
