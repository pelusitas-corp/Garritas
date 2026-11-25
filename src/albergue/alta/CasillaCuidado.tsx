/**
 * Casilla de "Cuidados de salud": "Vacunado" o "Esterilizado" (F-02 §3,
 * RF-01). Si no se marca, se guarda `false`.
 *
 * Recibe el texto, si está marcada, qué hacer al tocarla y si está
 * bloqueada (mientras se publica). No devuelve datos: solo la dibuja.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORES, FUENTES } from '../../compartido/tema';

interface Props {
  texto: string;
  marcada: boolean;
  alCambiar: () => void;
  bloqueada?: boolean;
}

const estilos = StyleSheet.create({
  casilla: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  texto: { fontFamily: FUENTES.regular, fontSize: 16, color: COLORES.cafe },
});

export default function CasillaCuidado({ texto, marcada, alCambiar, bloqueada = false }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcada, disabled: bloqueada }}
      disabled={bloqueada}
      onPress={alCambiar}
      style={estilos.casilla}
    >
      <Ionicons
        name={marcada ? 'checkbox' : 'square-outline'}
        size={28}
        color={COLORES.azulMarino}
      />
      <Text style={estilos.texto}>{texto}</Text>
    </Pressable>
  );
}
