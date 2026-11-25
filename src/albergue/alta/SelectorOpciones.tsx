/**
 * Selector de un toque en forma de píldoras (F-02 §3; E-2: sin escribir de
 * más). Lo usan especie, edad, tamaño y las 6 dimensiones del perfil.
 *
 * Recibe:
 * - `titulo`: el texto de arriba ("Especie *", "Nivel de energía"…);
 * - `opciones`: texto que se ve y valor que se guarda;
 * - `valor`: la opción elegida, o `null`;
 * - `alElegir`: qué hacer al tocar una opción;
 * - `bloqueado`: `true` mientras se publica.
 * No devuelve datos: solo dibuja el selector.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
import type { Opcion } from './textos';

interface Props<V extends string> {
  titulo: string;
  opciones: readonly Opcion<V>[];
  valor: V | null | undefined;
  alElegir: (valor: V) => void;
  bloqueado?: boolean;
}

const estilos = StyleSheet.create({
  contenedor: { gap: 8 },
  titulo: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pildora: {
    borderRadius: RADIOS.pildora,
    borderWidth: 2,
    borderColor: COLORES.azulGrisaceo,
    backgroundColor: COLORES.crema,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  elegida: { backgroundColor: COLORES.azulMarino, borderColor: COLORES.azulMarino },
  texto: { fontFamily: FUENTES.regular, fontSize: 15, color: COLORES.cafe },
  textoElegida: { fontFamily: FUENTES.negrita, color: COLORES.crema },
});

export default function SelectorOpciones<V extends string>({
  titulo,
  opciones,
  valor,
  alElegir,
  bloqueado = false,
}: Props<V>) {
  return (
    <View style={estilos.contenedor} accessibilityRole="radiogroup">
      <Text style={estilos.titulo}>{titulo}</Text>
      <View style={estilos.opciones}>
        {opciones.map((opcion) => {
          const elegida = opcion.valor === valor;
          return (
            <Pressable
              key={opcion.valor}
              accessibilityRole="radio"
              accessibilityState={{ checked: elegida, disabled: bloqueado }}
              disabled={bloqueado}
              onPress={() => alElegir(opcion.valor)}
              style={[estilos.pildora, elegida && estilos.elegida]}
            >
              <Text style={[estilos.texto, elegida && estilos.textoElegida]}>{opcion.texto}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
