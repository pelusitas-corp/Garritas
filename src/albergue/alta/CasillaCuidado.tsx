/**
 * Casilla de "Cuidados de salud": "Vacunado" o "Esterilizado" (F-02 §3,
 * RF-01). Si no se marca, se guarda `false`.
 *
 * Recibe el texto, si está marcada, qué hacer al tocarla y si está
 * bloqueada (mientras se publica). No devuelve datos: solo la dibuja.
 *
 * F-13 AF-15 (decisión del equipo; no está en el SRS): igual que las opciones
 * del formulario, sin marcar es azul grisáceo sólido con texto café; marcada,
 * menta con borde azul marino.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { BORDE, COLORES, FUENTES, RADIOS } from '../../compartido/tema';
import { aspectoCasilla } from './aspectoOpcion';

interface Props {
  texto: string;
  marcada: boolean;
  alCambiar: () => void;
  bloqueada?: boolean;
}

const estilos = StyleSheet.create({
  casilla: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIOS.pildora,
    borderWidth: BORDE,
  },
  texto: { fontFamily: FUENTES.regular, fontSize: 16 },
});

export default function CasillaCuidado({ texto, marcada, alCambiar, bloqueada = false }: Props) {
  const aspecto = aspectoCasilla(marcada);
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcada, disabled: bloqueada }}
      disabled={bloqueada}
      onPress={alCambiar}
      style={[
        estilos.casilla,
        { backgroundColor: COLORES[aspecto.fondo], borderColor: COLORES[aspecto.borde] },
      ]}
    >
      <Ionicons
        name={marcada ? 'checkbox' : 'square-outline'}
        size={28}
        color={COLORES.azulMarino}
      />
      <Text style={[estilos.texto, { color: COLORES[aspecto.texto] }]}>{texto}</Text>
    </Pressable>
  );
}
