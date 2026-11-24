/**
 * Estado de la sesión para toda la app (specs/02-navegacion.md §6).
 *
 * Analogía: es el tablero de la recepción del edificio. Una sola persona
 * (el `ProveedorSesion`, en app/_layout.tsx) lo mantiene al día, y cualquier
 * pantalla puede asomarse con `useSesion()` para saber quién eres, tu rol y
 * si ya terminaste el cuestionario.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { cerrarSesion, escucharSesion, leerEstadoSesion } from '../../firebase/sesion';
import type { EstadoSesion } from './guardas';

interface ValorSesion {
  /** Quién usa la app ahora (ver `EstadoSesion` en guardas.ts). */
  sesion: EstadoSesion;
  /**
   * Vuelve a leer el rol y el cuestionario. La usan "Reintentar" (G-4b) y
   * F-04 cuando el adoptante termina el cuestionario.
   */
  recargar: () => void;
  /** Cierra la sesión (N-3). Las guardas llevan después a Selección de Rol. */
  cerrarSesion: () => Promise<void>;
}

const ContextoSesion = createContext<ValorSesion | null>(null);

/**
 * Envuelve la app. Recibe las pantallas (children) y les da el estado de
 * la sesión. Escucha a Firebase Authentication y, cuando hay sesión, lee el
 * rol y el cuestionario.
 */
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<EstadoSesion>({ tipo: 'cargando' });
  const [uid, setUid] = useState<string | null>(null);
  const [vuelta, setVuelta] = useState(0);
  // Solo cuenta la lectura más reciente (evita que una respuesta vieja gane).
  const lecturaActual = useRef(0);

  useEffect(
    () =>
      escucharSesion((nuevoUid) => {
        setUid(nuevoUid);
        setSesion(nuevoUid ? { tipo: 'cargando' } : { tipo: 'sin-sesion' });
      }),
    [],
  );

  useEffect(() => {
    if (!uid) {
      return;
    }
    lecturaActual.current += 1;
    const estaLectura = lecturaActual.current;
    leerEstadoSesion(uid).then((estado) => {
      if (estaLectura === lecturaActual.current) {
        setSesion(estado);
      }
    });
  }, [uid, vuelta]);

  const recargar = useCallback(() => {
    if (uid) {
      setSesion({ tipo: 'cargando' });
      setVuelta((anterior) => anterior + 1);
    }
  }, [uid]);

  const valor = useMemo(() => ({ sesion, recargar, cerrarSesion }), [sesion, recargar]);

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

/** Devuelve el estado de la sesión. Solo funciona dentro de `ProveedorSesion`. */
export function useSesion(): ValorSesion {
  const valor = useContext(ContextoSesion);
  if (!valor) {
    throw new Error('useSesion() debe usarse dentro de <ProveedorSesion>.');
  }
  return valor;
}
