/**
 * Hook de las fotos completas de Descubrir (spec F-13 §4.3, AF-4; F-03 v1.4).
 *
 * Cada vez que cambia la tarjeta visible, lee `foto-0` del animal visible y
 * del siguiente (`animalesPorLeer`). Las fotos que llegan se guardan en
 * memoria mientras Descubrir está abierta: no se vuelven a leer. Si una
 * lectura falla, la tarjeta se queda con la miniatura, sin mensaje; esa foto
 * se puede pedir otra vez la próxima vez que su tarjeta se vea.
 *
 * Recibe el mazo (o `null` si todavía no hay). Devuelve las fotos que ya
 * llegaron, por `animalId`.
 */
import { useEffect, useRef, useState } from 'react';

import { leerFotoPrincipal } from '../../firebase/animales';
import { animalesPorLeer } from './fotoTarjeta';
import type { FotosCompletas } from './fotoTarjeta';
import type { EstadoMazo } from './mazo';

export default function useFotosCompletas(mazo: EstadoMazo | null): FotosCompletas {
  const [fotos, setFotos] = useState<FotosCompletas>({});
  /** Fotos que ya llegaron o que se están leyendo. */
  const pedidos = useRef(new Set<string>());

  useEffect(() => {
    if (!mazo) {
      return;
    }
    animalesPorLeer(mazo, pedidos.current).forEach(async (animalId) => {
      pedidos.current.add(animalId);
      const lectura = await leerFotoPrincipal(animalId);
      if (lectura.estado === 'ok') {
        setFotos((actuales) => ({ ...actuales, [animalId]: lectura.datos }));
      } else {
        pedidos.current.delete(animalId); // Se queda la miniatura, sin mensaje.
      }
    });
  }, [mazo]);

  return fotos;
}
