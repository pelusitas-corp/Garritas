/**
 * Estados comunes de una pantalla con datos (specs/02-navegacion.md §7).
 *
 * Toda pantalla que lee Firestore pasa por cuatro estados: cargando, con
 * datos, vacía y error. Este componente dibuja los tres que NO son "con
 * datos" (más "sin permiso", RNF-02), para que F-02 a F-08 los reutilicen
 * en lugar de dibujarlos cada una.
 *
 * Recibe:
 * - `estado`: 'cargando' | 'vacia' | 'error' | 'sin-permiso';
 * - `mensaje`: texto de `mensajes.ts` (en 'error' y 'sin-permiso' hay uno
 *   por defecto);
 * - `mensajeSiTarda`: solo en 'cargando'; se muestra si pasan más de 3 s
 *   (RNF-01: "Calculando compatibilidad, verifica tu conexión a internet");
 * - `boton`: botón opcional debajo del mensaje.
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import BotonPildora from './BotonPildora';
import MENSAJES from './mensajes';
import { COLORES, FUENTES } from './tema';

/** RNF-01: después de 3 segundos cargando se muestra el aviso. */
export const ESPERA_MAXIMA_MS = 3000;

export type TipoEstado = 'cargando' | 'vacia' | 'error' | 'sin-permiso';

interface Props {
  estado: TipoEstado;
  mensaje?: string;
  mensajeSiTarda?: string;
  boton?: { texto: string; alPresionar: () => void } | null;
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 24,
    backgroundColor: COLORES.crema,
  },
  mensaje: {
    fontFamily: FUENTES.negrita,
    fontSize: 18,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  boton: { alignSelf: 'stretch' },
});

/** Mensaje por defecto de cada estado (los de error y permiso son fijos). */
function mensajePorDefecto(estado: TipoEstado): string | undefined {
  if (estado === 'error') {
    return MENSAJES.ERROR_CONEXION;
  }
  if (estado === 'sin-permiso') {
    return MENSAJES.SIN_PERMISO;
  }
  return undefined;
}

export default function EstadoPantalla({
  estado,
  mensaje = '',
  mensajeSiTarda = '',
  boton = null,
}: Props) {
  const [tarda, setTarda] = useState(false);

  useEffect(() => {
    if (estado !== 'cargando' || !mensajeSiTarda) {
      return undefined;
    }
    const temporizador = setTimeout(() => setTarda(true), ESPERA_MAXIMA_MS);
    return () => {
      clearTimeout(temporizador);
      setTarda(false);
    };
  }, [estado, mensajeSiTarda]);

  const texto =
    estado === 'cargando' ? tarda && mensajeSiTarda : mensaje || mensajePorDefecto(estado);

  return (
    <View style={estilos.contenedor}>
      {estado === 'cargando' && <ActivityIndicator size="large" color={COLORES.azulMarino} />}
      {texto ? (
        <Text accessibilityRole="alert" style={estilos.mensaje}>
          {texto}
        </Text>
      ) : null}
      {boton ? (
        <View style={estilos.boton}>
          <BotonPildora texto={boton.texto} alPresionar={boton.alPresionar} />
        </View>
      ) : null}
    </View>
  );
}
