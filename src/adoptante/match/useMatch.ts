/**
 * Hook de Match (spec F-06: flujo A, flujo B, A1 a A6; RF-20, RF-11, RF-17;
 * RNF-01; MS-2, MS-5, MS-6, MS-11).
 *
 * Al abrir lee, en paralelo, el cuestionario y el animal (del servidor) y
 * decide con `decidirMatch` qué se muestra. El aviso de los 3 s (RNF-01) lo
 * pone la pantalla con `EstadoPantalla` mientras el estado es `cargando`.
 *
 * Al presionar "Enviar solicitud" vuelve a leer del servidor el animal, las
 * solicitudes del adoptante y su cuenta; revisa G-10 y MS-1 con
 * `decidirEnvio`, arma la solicitud con el MISMO resultado que se ve en
 * pantalla (`armarSolicitud`, RN-01) y la escribe con `enviarSolicitud`. Si
 * sale bien, reemplaza Match con "¡Solicitud enviada!" (02 §4.2).
 *
 * Recibe el `animalId` de la ruta. Devuelve `{ estado, envio, enviar,
 * reintentar, irADescubrir }`. La pantalla solo dibuja lo que devuelve.
 */
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import MENSAJES from '../../compartido/mensajes';
import {
  RUTAS,
  rutaCuestionarioConAviso,
  rutaSolicitudEnviada,
} from '../../compartido/navegacion/rutas';
import { conTiempoLimite } from '../../firebase/acceso';
import { leerAnimal } from '../../firebase/animales';
import { ESPERA_GUARDAR_MS, leerCuestionario, uidDelAdoptante } from '../../firebase/cuestionario';
import {
  enviarSolicitud,
  leerCuentaAdoptante,
  leerMisSolicitudes,
} from '../../firebase/solicitudes';
import { regresarSinDisponible } from '../descubrir/useDetalleAnimal';
import { armarSolicitud, decidirEnvio, decidirMatch } from './match';
import type { EstadoMatch, LecturaCuestionario } from './match';

/** Estado del botón "Enviar solicitud" y del mensaje que va encima. */
export interface EnvioMatch {
  /** MS-5: mientras se envía, el botón muestra el indicador y no responde. */
  enviando: boolean;
  /** A3 a A6: mensaje encima del botón, o `null`. */
  mensaje: string | null;
  /** MS-5: después de A3 o A4 el botón queda desactivado. */
  bloqueado: boolean;
}

const ENVIO_INICIAL: EnvioMatch = { enviando: false, mensaje: null, bloqueado: false };

/**
 * Decisión 2 del plan: `leerCuestionario` (F-04) no tiene tiempo límite.
 * Recibe el `uid`. Devuelve la misma lectura, o `sin-conexion` si no responde
 * en 10 s (igual que en `useDescubrir`).
 */
function leerCuestionarioConLimite(uid: string): Promise<LecturaCuestionario> {
  return conTiempoLimite(leerCuestionario(uid), ESPERA_GUARDAR_MS).catch(
    () => ({ estado: 'sin-conexion' }) as const,
  );
}

/** "Ir a Descubrir" (G-9, MS-2): cierra Detalle y Match; con un enlace directo, reemplaza. */
function irADescubrir() {
  if (router.canDismiss()) {
    router.dismissTo(RUTAS.descubrir);
  } else {
    router.replace(RUTAS.descubrir);
  }
}

export default function useMatch(animalId: string) {
  const [uid] = useState(uidDelAdoptante);
  const [estado, setEstado] = useState<EstadoMatch>(
    // G-1 ya asegura la sesión; sin ella, las reglas rechazarían todo (RNF-02).
    uid ? { tipo: 'cargando' } : { tipo: 'sin-permiso' },
  );
  const [envio, setEnvio] = useState<EnvioMatch>(ENVIO_INICIAL);
  /** Número de la lectura más reciente: las respuestas viejas o de una pantalla cerrada se ignoran. */
  const turno = useRef(0);

  /** Flujo A, pasos 2 a 6. */
  const cargar = useCallback(() => {
    turno.current += 1;
    const miTurno = turno.current;
    if (!uid) {
      return undefined; // El estado inicial ya es "sin permiso".
    }
    // Igual que el Detalle (F-03): el estado solo cambia cuando llega la respuesta.
    return Promise.all([leerCuestionarioConLimite(uid), leerAnimal(animalId)]).then(
      ([cuestionario, animal]) => {
        if (miTurno !== turno.current) {
          return;
        }
        const decision = decidirMatch(cuestionario, animal);
        if (decision.tipo === 'no-disponible') {
          regresarSinDisponible(); // A1 (MS-11, G-8)
        } else if (decision.tipo === 'cuestionario-incompleto') {
          router.replace(rutaCuestionarioConAviso()); // G-5
        } else {
          setEstado(decision);
        }
      },
    );
  }, [animalId, uid]);

  useEffect(() => {
    cargar();
    return () => {
      turno.current += 1; // Al salir, se ignora cualquier respuesta pendiente.
    };
  }, [cargar]);

  /** "Reintentar" (A5, DE-6): vuelve al indicador de carga y lee otra vez. */
  const reintentar = useCallback(() => {
    setEstado({ tipo: 'cargando' });
    setEnvio(ENVIO_INICIAL);
    cargar();
  }, [cargar]);

  /** Recibe un mensaje y si el botón queda desactivado. Termina el envío con ese mensaje. */
  const terminarCon = useCallback((mensaje: string, bloqueado: boolean) => {
    setEnvio({ enviando: false, mensaje, bloqueado });
  }, []);

  /** "Enviar solicitud" (flujo B). */
  const enviar = useCallback(async () => {
    if (estado.tipo !== 'match' || !uid || envio.enviando || envio.bloqueado) {
      return;
    }
    const miTurno = turno.current;
    const vigente = () => miTurno === turno.current;
    setEnvio({ enviando: true, mensaje: null, bloqueado: false });

    // Paso 2 (y paso 4): todo del servidor, con 10 s cada lectura.
    const [lecturaAnimal, misSolicitudes, cuenta] = await Promise.all([
      leerAnimal(animalId),
      leerMisSolicitudes(uid),
      leerCuentaAdoptante(uid),
    ]);
    if (!vigente()) {
      return;
    }
    const lecturas = [lecturaAnimal.estado, misSolicitudes.estado, cuenta.estado];
    if (lecturas.includes('sin-permiso')) {
      terminarCon(MENSAJES.SIN_PERMISO, false); // A6
      return;
    }
    if (
      lecturas.includes('sin-conexion') ||
      misSolicitudes.estado !== 'ok' ||
      cuenta.estado !== 'ok'
    ) {
      terminarCon(MENSAJES.ERROR_CONEXION, false); // A5: el botón vuelve a responder
      return;
    }

    // Paso 3: G-10 (A3) y MS-1 (A4).
    const animal = lecturaAnimal.estado === 'ok' ? lecturaAnimal.animal : null;
    const decision = decidirEnvio(animal, misSolicitudes.solicitudes, animalId);
    if (!decision.permitida || !animal) {
      terminarCon(decision.permitida ? MENSAJES.MASCOTA_NO_DISPONIBLE : decision.mensaje, true);
      return;
    }

    // Paso 4: el mismo % y "No Apto" que se ven en pantalla (RN-01).
    const armada = armarSolicitud({
      uid,
      animal,
      resultado: estado.resultado,
      respuestas: estado.respuestas,
      cuenta: cuenta.cuenta,
    });
    if (!armada) {
      router.replace(rutaCuestionarioConAviso()); // Falta p2, p12 o p19: igual que G-5
      return;
    }

    // Paso 5: un solo writeBatch con 10 s (MS-4).
    const resultado = await enviarSolicitud(armada.solicitud, armada.contacto);
    if (!vigente()) {
      return;
    }
    if (resultado.estado === 'ok') {
      router.replace(rutaSolicitudEnviada(resultado.solicitudId)); // Paso 6
      return;
    }
    terminarCon(
      resultado.estado === 'sin-permiso' ? MENSAJES.SIN_PERMISO : MENSAJES.ERROR_CONEXION,
      false,
    );
  }, [animalId, envio, estado, terminarCon, uid]);

  return { estado, envio, enviar, reintentar, irADescubrir };
}
