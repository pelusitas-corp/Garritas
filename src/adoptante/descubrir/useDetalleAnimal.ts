/**
 * Hook del Detalle (spec F-03: flujo B, A4 a A6; G-8; RN-07; RF-28).
 *
 * Lee `animales/{animalId}`. Si está "Disponible", lo muestra con su
 * miniatura y después pide las fotos completas (RN-07). Si ya no está
 * "Disponible" o no existe, regresa a Descubrir con el aviso (G-8, DE-4).
 *
 * Recibe el `animalId` de la ruta. Devuelve `{ estado, reintentar }`.
 */
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Foto } from '../../compartido/modelo';
import { rutaDescubrirConAviso } from '../../compartido/navegacion/rutas';
import { leerAnimal, leerFotos } from '../../firebase/animales';
import type { AnimalConId } from '../../firebase/animales';
import { decidirDetalle } from './detalle';

export type EstadoHookDetalle =
  | { tipo: 'cargando' }
  /** `fotos` es `null` mientras llegan: se muestra la miniatura (RN-07). */
  | { tipo: 'con-datos'; animal: AnimalConId; fotos: Foto[] | null }
  | { tipo: 'error' }
  | { tipo: 'sin-permiso' };

/**
 * G-8 (DE-4): regresa a `/descubrir?aviso=no-disponible` y el Detalle sale
 * de la pila. Si se abrió desde Descubrir, vuelve a ese mismo Descubrir
 * (`dismissTo`); si se abrió con un enlace directo, lo reemplaza.
 * También la usa Match en A1 (F-06 MS-11, decisión 5 del plan de F-06).
 */
export function regresarSinDisponible() {
  if (router.canDismiss()) {
    router.dismissTo(rutaDescubrirConAviso());
  } else {
    router.replace(rutaDescubrirConAviso());
  }
}

export default function useDetalleAnimal(animalId: string) {
  const [estado, setEstado] = useState<EstadoHookDetalle>({ tipo: 'cargando' });
  /** Número de la lectura más reciente: las respuestas viejas se ignoran. */
  const turno = useRef(0);

  /** Lee el animal y sus fotos. Solo cambia el estado cuando llega la respuesta. */
  const cargar = useCallback(() => {
    turno.current += 1;
    const miTurno = turno.current;
    const vigente = () => miTurno === turno.current;

    /** Paso 2 del flujo B con el animal ya revisado: pide las fotos completas (RN-07). */
    const leerSusFotos = (animal: AnimalConId) =>
      leerFotos(animalId).then((lectura) => {
        if (!vigente()) {
          return;
        }
        if (lectura.estado === 'ok') {
          setEstado({ tipo: 'con-datos', animal, fotos: lectura.fotos });
        } else {
          // Decisión 4 del plan: si fallan las fotos, error de conexión con "Reintentar" (A5).
          setEstado({ tipo: lectura.estado === 'sin-permiso' ? 'sin-permiso' : 'error' });
        }
      });

    return leerAnimal(animalId).then((lectura) => {
      if (!vigente()) {
        return undefined;
      }
      const decision = decidirDetalle(lectura);
      if (decision.accion === 'no-disponible') {
        regresarSinDisponible(); // G-8
        return undefined;
      }
      if (decision.accion !== 'mostrar') {
        setEstado({ tipo: decision.accion }); // A5 o A6
        return undefined;
      }
      // RN-07: se muestra con la miniatura mientras llegan las fotos.
      setEstado({ tipo: 'con-datos', animal: decision.animal, fotos: null });
      return leerSusFotos(decision.animal);
    });
  }, [animalId]);

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
