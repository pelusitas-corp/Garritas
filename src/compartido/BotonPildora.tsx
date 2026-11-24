/**
 * Botón píldora de Soft UI (arquitectura §8, Taller 7).
 *
 * Recibe el texto, qué hacer al tocarlo y su variante:
 * - `principal`: azul marino (acción principal, como en Figma);
 * - `secundario`: menta (acciones de apoyo).
 * No devuelve datos: solo dibuja el botón.
 */
import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORES, FUENTES, RADIOS } from './tema';

interface Props {
  texto: string;
  alPresionar: () => void;
  variante?: 'principal' | 'secundario';
}

const estilos = StyleSheet.create({
  boton: {
    borderRadius: RADIOS.pildora,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  principal: { backgroundColor: COLORES.azulMarino },
  secundario: { backgroundColor: COLORES.menta },
  presionado: { opacity: 0.8 },
  texto: { fontFamily: FUENTES.negrita, fontSize: 18 },
  textoPrincipal: { color: COLORES.crema },
  textoSecundario: { color: COLORES.azulMarino },
});

export default function BotonPildora({ texto, alPresionar, variante = 'principal' }: Props) {
  const esPrincipal = variante === 'principal';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={alPresionar}
      style={({ pressed }) => [
        estilos.boton,
        esPrincipal ? estilos.principal : estilos.secundario,
        pressed && estilos.presionado,
      ]}
    >
      <Text style={[estilos.texto, esPrincipal ? estilos.textoPrincipal : estilos.textoSecundario]}>
        {texto}
      </Text>
    </Pressable>
  );
}
