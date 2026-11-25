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
 * recalcula, muestra el aviso y el mazo empieza de nuevo.
 *
 * No recibe nada. Devuelve `{ estado, avisoNoDisponible, pasar, verDeNuevo,
 * abrirDetalle, reintentar }`.
 */
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import {
  AVISO_NO_DISPONIBLE,
  rutaAnimal,
  rutaCuestionarioConAviso,
} from '../../compartido/navegacion/rutas';
import { conTiempoLimite } from '../../firebase/acceso';
import { leerAnimalesDisponibles } from '../../firebase/animales';
import { ESPERA_GUARDAR_MS, leerCuestionario, uidDelAdoptante } from '../../firebase/cuestionario';
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

export default function useDescubrir() {
  const { aviso } = useLocalSearchParams<{ aviso?: string }>();
  const [uid] = useState(uidDelAdoptante);
  const [estado, setEstado] = useState<EstadoDescubrir>({ tipo: 'cargando' });
  const [avisoNoDisponible, setAvisoNoDisponible] = useState(false);
  /** Se prende justo antes de abrir el Detalle (DE-5). */
  const fuiAlDetalle = useRef(false);
  /** Se prende al atender `?aviso=no-disponible`, hasta que el parámetro se borra. */
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
      // G-8 (DE-4): llegó del Detalle con el aviso. Recalcula y el mazo empieza de nuevo.
      if (aviso === AVISO_NO_DISPONIBLE && !avisoAtendido.current) {
        avisoAtendido.current = true;
        fuiAlDetalle.current = false;
        setAvisoNoDisponible(true);
        calcular();
        router.setParams({ aviso: undefined });
        return;
      }
      // Se volvió a llamar solo porque se borró el parámetro: no es una apertura nueva.
      if (aviso === undefined && avisoAtendido.current) {
        avisoAtendido.current = false;
        return;
      }
      // DE-5: regresa del Detalle con "←" o "✕": el mazo sigue en la misma tarjeta.
      if (fuiAlDetalle.current) {
        fuiAlDetalle.current = false;
        return;
      }
      // RN-03: abrió Descubrir (pestaña, Perfil Garritas o inicio de sesión).
      setAvisoNoDisponible(false);
      calcular();
    }, [aviso, calcular]),
  );

  /** "Pasar" (N-2, RN-04): siguiente tarjeta. No guarda nada. */
  const pasar = useCallback(() => {
    setEstado((actual) =>
      actual.tipo === 'con-datos' ? { ...actual, mazo: pasarTarjeta(actual.mazo) } : actual,
    );
  }, []);

  /** "Ver de nuevo" (DE-1): vuelve a la primera tarjeta sin leer Firestore. */
  const verDeNuevo = useCallback(() => {
    setEstado((actual) =>
      actual.tipo === 'con-datos' ? { ...actual, mazo: reiniciarMazo(actual.mazo) } : actual,
    );
  }, []);

  /** Tarjeta, "ⓘ" o "Me encanta" (RF-28, N-2). Recibe el `animalId`. */
  const abrirDetalle = useCallback((animalId: string) => {
    fuiAlDetalle.current = true;
    router.push(rutaAnimal(animalId));
  }, []);

  /** "Reintentar" (DE-6): vuelve a leer y a calcular. */
  const reintentar = useCallback(() => {
    calcular();
  }, [calcular]);

  return { estado, avisoNoDisponible, pasar, verDeNuevo, abrirDetalle, reintentar };
}
