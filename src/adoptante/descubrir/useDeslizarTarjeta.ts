/**
 * Hook del gesto de deslizar la tarjeta de Descubrir (spec F-11 §4.6, AD-8;
 * decisión del equipo, no está en el SRS). Usa `PanResponder` y `Animated`,
 * que ya vienen en React Native: no agrega dependencias.
 *
 * Cómo funciona:
 * 1. El gesto NUNCA pide el toque al empezar. Solo lo pide cuando el dedo ya
 *    se movió más de 10 px en horizontal (`debeEmpezarDeslizamiento`). Así un
 *    toque corto sigue llegando a la tarjeta (abre el Detalle) o al "ⓘ".
 * 2. Mientras se arrastra, la tarjeta sigue al dedo y gira hasta ±10°.
 * 3. Al soltar, `decidirDeslizamiento` decide: regresa al centro, o sale de
 *    la pantalla y llama a la MISMA función que el botón ("Pasar" o
 *    "Me encanta").
 * 4. Cada tarjeta nueva empieza centrada: Descubrir dibuja `TarjetaAnimal`
 *    con `key={animalId}`, así React la crea de nuevo con su propio gesto.
 *
 * `alPasar` y `alMeEncanta` deben ser estables (`useCallback`): si cambian,
 * el gesto se vuelve a crear.
 */
import { useMemo, useState } from 'react';
import { Animated, PanResponder, useWindowDimensions } from 'react-native';
import type { PanResponderInstance } from 'react-native';

import { GIRO_MAXIMO, debeEmpezarDeslizamiento, decidirDeslizamiento } from './deslizar';

/** Hasta dónde sale la tarjeta: un poco más allá de la orilla. */
const FACTOR_SALIDA = 1.2;
/** Lo que tarda en salir, en milisegundos. */
const DURACION_SALIDA_MS = 200;

interface Acciones {
  alPasar: () => void;
  alMeEncanta: () => void;
}

/**
 * Arma el gesto (pasos 1 a 3). Recibe la posición animada de la tarjeta, el
 * ancho de la pantalla y las dos acciones. Devuelve el `PanResponder`.
 */
function crearGestoDeslizar(
  posicion: Animated.Value,
  ancho: number,
  { alPasar, alMeEncanta }: Acciones,
): PanResponderInstance {
  /** Mientras la tarjeta sale de la pantalla, se ignora otro gesto. */
  let saliendo = false;

  const regresar = () => {
    Animated.spring(posicion, { toValue: 0, useNativeDriver: false }).start();
  };

  const salir = (decision: 'pasar' | 'me-encanta') => {
    saliendo = true;
    const lado = decision === 'me-encanta' ? 1 : -1;
    Animated.timing(posicion, {
      toValue: lado * ancho * FACTOR_SALIDA,
      duration: DURACION_SALIDA_MS,
      useNativeDriver: false,
    }).start(() => {
      if (decision === 'pasar') {
        alPasar(); // Llega otra tarjeta, ya centrada (paso 4).
        return;
      }
      alMeEncanta(); // Abre el Detalle; al volver, la tarjeta está en su lugar.
      posicion.setValue(0);
      saliendo = false;
    });
  };

  return PanResponder.create({
    // Paso 1: nunca al empezar; solo con un movimiento horizontal claro.
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponderCapture: (_evento, gesto) =>
      !saliendo && debeEmpezarDeslizamiento(gesto.dx, gesto.dy),
    onPanResponderTerminationRequest: () => false,
    // Paso 2: la tarjeta sigue al dedo.
    onPanResponderMove: (_evento, gesto) => posicion.setValue(gesto.dx),
    // Paso 3: al soltar, decide.
    onPanResponderRelease: (_evento, gesto) => {
      const decision = decidirDeslizamiento(gesto.dx, ancho);
      if (decision === 'regresar') {
        regresar();
      } else {
        salir(decision);
      }
    },
    onPanResponderTerminate: regresar,
  });
}

/**
 * Recibe `{ alPasar, alMeEncanta }`. Devuelve `{ manejadores, estiloArrastre }`:
 * los manejadores van en la vista que se arrastra y el estilo la mueve y la gira.
 */
export default function useDeslizarTarjeta({ alPasar, alMeEncanta }: Acciones) {
  const { width } = useWindowDimensions();
  /** Cuánto se ha movido la tarjeta en horizontal (0 = centro). */
  const [posicion] = useState(() => new Animated.Value(0));

  const gesto = useMemo(
    () => crearGestoDeslizar(posicion, width, { alPasar, alMeEncanta }),
    [posicion, width, alPasar, alMeEncanta],
  );

  const estiloArrastre = useMemo(
    () => ({
      transform: [
        { translateX: posicion },
        {
          rotate: posicion.interpolate({
            inputRange: [-width, 0, width],
            outputRange: [`-${GIRO_MAXIMO}deg`, '0deg', `${GIRO_MAXIMO}deg`],
            extrapolate: 'clamp',
          }),
        },
      ],
    }),
    [posicion, width],
  );

  return { manejadores: gesto.panHandlers, estiloArrastre };
}
