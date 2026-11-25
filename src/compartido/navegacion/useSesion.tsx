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

import { crearCuentaAdoptante } from '../../firebase/acceso';
import type { DatosRegistro, ResultadoAcceso } from '../../firebase/acceso';
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
  /**
   * Crea la cuenta del adoptante (F-01, RF-23). Mientras se crea, la sesión
   * NO cambia, así que nunca se ve un instante "No tienes permiso…" (RN-13).
   */
  crearCuenta: (datos: DatosRegistro) => Promise<ResultadoAcceso>;
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
  // F-01 RN-13: mientras se crea la cuenta, Firebase avisa del uid nuevo
  // ANTES de que exista usuarios/{uid}. Ese aviso se ignora; `crearCuenta`
  // pone el uid cuando la ficha ya está escrita.
  const creandoCuenta = useRef(false);

  useEffect(
    () =>
      escucharSesion((nuevoUid) => {
        if (creandoCuenta.current) {
          return;
        }
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

  /**
   * Recibe los datos del registro. Devuelve el resultado de Firebase.
   * Si salió bien, ahora sí lee el rol: la guarda G-2 lleva al inicio.
   */
  const crearCuenta = useCallback(async (datos: DatosRegistro) => {
    creandoCuenta.current = true;
    try {
      const resultado = await crearCuentaAdoptante(datos);
      if (resultado.ok) {
        setSesion({ tipo: 'cargando' });
        setUid(resultado.uid);
      }
      return resultado;
    } finally {
      creandoCuenta.current = false;
    }
  }, []);

  const valor = useMemo(
    () => ({ sesion, recargar, cerrarSesion, crearCuenta }),
    [sesion, recargar, crearCuenta],
  );

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
