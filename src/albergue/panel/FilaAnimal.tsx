/**
 * Fila de "Tus animales" (spec F-07 flujo principal paso 3; PS-3, PS-14).
 *
 * Recibe el animal (se usan `miniatura` y `nombre`), cuántas solicitudes
 * tiene y qué hacer al tocarla (abrir sus solicitudes, toque 1 de RC-05).
 * Dibuja la miniatura, el nombre, "N solicitudes" y "›". No muestra el
 * estado del animal (PS-14). No devuelve datos.
 *
 * Medidas de Figma (plan de F-07): fondo azul grisáceo, radio 32, alto ~92,
 * relleno 14; miniatura cuadrada de 64 px con radio 16; nombre en negrita
 * 22 y conteo en negrita 13, en café.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
import type { AnimalConId } from '../../firebase/animales';
import { ICONOS_PANEL } from './iconosPanel';
import { textoConteo } from './panel';

/** Lado de la miniatura cuadrada (Figma). */
const LADO_MINIATURA = 64;

/**
 * Radio de la miniatura (Figma, aprobado en el plan de F-07). Es la esquina
 * de una imagen, no de un contenedor: queda por debajo del mínimo de 24 de
 * `RADIOS` a propósito.
 */
const RADIO_MINIATURA = 16;

const estilos = StyleSheet.create({
  fila: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: RADIOS.tarjetaGrande,
    backgroundColor: COLORES.azulGrisaceo,
  },
  presionada: { opacity: 0.8 },
  miniatura: {
    width: LADO_MINIATURA,
    height: LADO_MINIATURA,
    borderRadius: RADIO_MINIATURA,
    backgroundColor: COLORES.crema,
  },
  textos: { flex: 1, gap: 2 },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 22, color: COLORES.cafe },
  conteo: { fontFamily: FUENTES.negrita, fontSize: 13, color: COLORES.cafe },
});

interface Props {
  animal: Pick<AnimalConId, 'miniatura' | 'nombre'>;
  conteo: number;
  alPresionar: () => void;
}

export default function FilaAnimal({ animal, conteo, alPresionar }: Props) {
  const textoDelConteo = textoConteo(conteo, 'solicitudes');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${animal.nombre}, ${textoDelConteo}`}
      onPress={alPresionar}
      style={({ pressed }) => [estilos.fila, pressed && estilos.presionada]}
    >
      <Image source={{ uri: animal.miniatura }} style={estilos.miniatura} />
      <View style={estilos.textos}>
        <Text style={estilos.nombre} numberOfLines={1}>
          {animal.nombre}
        </Text>
        <Text style={estilos.conteo}>{textoDelConteo}</Text>
      </View>
      <MaterialCommunityIcons name={ICONOS_PANEL.abrir} size={28} color={COLORES.cafe} />
    </Pressable>
  );
}
