/**
 * Una opción de un toque (spec F-04, RN-01; Soft UI).
 *
 * Es una tarjeta grande con borde redondeado, como las de Figma ("Casa",
 * "Departamento"). Si el adoptante ya la había elegido (al regresar con
 * "←"), se ve marcada en menta (RN-03).
 *
 * Recibe la `clave` de la opción, el `texto` que se ve, si está
 * `seleccionada` y `alElegir`, que se llama con la clave al tocarla.
 * No devuelve datos: solo dibuja la opción.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';

interface Props<C extends string> {
  clave: C;
  texto: string;
  seleccionada: boolean;
  alElegir: (clave: C) => void;
}

const estilos = StyleSheet.create({
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.azulGrisaceo,
  },
  seleccionada: { backgroundColor: COLORES.menta },
  presionada: { opacity: 0.8 },
  texto: { flex: 1, fontFamily: FUENTES.negrita, fontSize: 20, color: COLORES.cafe },
});

export default function OpcionRespuesta<C extends string>({
  clave,
  texto,
  seleccionada,
  alElegir,
}: Props<C>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: seleccionada }}
      onPress={() => alElegir(clave)}
      style={({ pressed }) => [
        estilos.opcion,
        seleccionada && estilos.seleccionada,
        pressed && estilos.presionada,
      ]}
    >
      <Text style={estilos.texto}>{texto}</Text>
      <MaterialCommunityIcons
        name={seleccionada ? 'check' : 'arrow-right'}
        size={24}
        color={COLORES.cafe}
      />
    </Pressable>
  );
}
