/**
 * Encabezado del cuestionario (spec F-04, RN-09).
 *
 * Dibuja: flecha "←" (desde la pregunta 2), "Pregunta N de M", la barra de
 * avance y el nombre de la sección. No calcula nada: la pantalla le pasa
 * los números que obtuvo con `posicionDe()` (avance.ts).
 *
 * Recibe:
 * - `seccion`: Tu hogar, Tu familia, Tu rutina o Tu experiencia y tu ambiente;
 * - `numero` y `total`: N y M;
 * - `alRegresar`: qué hacer con "←", o `null` en la primera pregunta.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
import type { Seccion } from './preguntas';
import { textoPosicion } from './textos';

interface Props {
  seccion: Seccion;
  numero: number;
  total: number;
  alRegresar: (() => void) | null;
}

/** Tamaño del área que se puede tocar en la flecha (accesible con el dedo). */
const TAMANO_FLECHA = 48;

const estilos = StyleSheet.create({
  contenedor: { gap: 12 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: TAMANO_FLECHA },
  flecha: {
    width: TAMANO_FLECHA,
    height: TAMANO_FLECHA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posicion: { fontFamily: FUENTES.negrita, fontSize: 22, color: COLORES.cafe },
  barra: {
    height: 8,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.azulGrisaceo,
    overflow: 'hidden',
  },
  relleno: { height: '100%', backgroundColor: COLORES.azulMarino },
  seccion: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
});

export default function EncabezadoCuestionario({ seccion, numero, total, alRegresar }: Props) {
  const avance = total > 0 ? (numero / total) * 100 : 0;
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.fila}>
        {alRegresar ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Regresar a la pregunta anterior"
            onPress={alRegresar}
            style={estilos.flecha}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color={COLORES.cafe} />
          </Pressable>
        ) : null}
        <Text style={estilos.posicion}>{textoPosicion(numero, total)}</Text>
      </View>
      <View
        style={estilos.barra}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: numero }}
      >
        <View style={[estilos.relleno, { width: `${avance}%` }]} />
      </View>
      <Text style={estilos.seccion}>{seccion}</Text>
    </View>
  );
}
