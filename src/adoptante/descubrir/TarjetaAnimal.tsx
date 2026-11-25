/**
 * Tarjeta del mazo de Descubrir (spec F-03: flujo A pasos 6 a 8; RF-10, N-2, DE-8).
 *
 * Muestra la miniatura, el nombre, la especie y "{n} % compatible", con los
 * botones "ⓘ", "Pasar" y "Me encanta". No muestra "No Apto" (DE-3).
 *
 * Recibe la `tarjeta` y qué hacer al pasar o al abrir el Detalle.
 * No devuelve datos: solo dibuja.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import BotonPildora from '../../compartido/BotonPildora';
import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
import { ICONOS_DESCUBRIR } from './iconosDescubrir';
import type { TarjetaMazo } from './mazo';
import {
  NOMBRE_ESPECIE,
  TEXTO_INFO,
  TEXTO_ME_ENCANTA,
  TEXTO_PASAR,
  textoPorcentaje,
} from './textos';

interface Props {
  tarjeta: TarjetaMazo;
  alPasar: () => void;
  alAbrir: (animalId: string) => void;
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, gap: 16 },
  tarjeta: {
    flex: 1,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.menta,
    overflow: 'hidden',
  },
  foto: { flex: 1, minHeight: 240, backgroundColor: COLORES.azulGrisaceo },
  datos: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20 },
  textos: { flex: 1, gap: 4 },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 28, color: COLORES.cafe },
  especie: { fontFamily: FUENTES.regular, fontSize: 18, color: COLORES.cafe },
  porcentaje: { fontFamily: FUENTES.negrita, fontSize: 18, color: COLORES.azulMarino },
  botones: { flexDirection: 'row', gap: 16 },
  boton: { flex: 1 },
});

export default function TarjetaAnimal({ tarjeta, alPasar, alAbrir }: Props) {
  const abrir = () => alAbrir(tarjeta.animalId);
  return (
    <View style={estilos.contenedor}>
      <Pressable style={estilos.tarjeta} onPress={abrir} accessibilityRole="button">
        <Image source={{ uri: tarjeta.miniatura }} style={estilos.foto} resizeMode="cover" />
        <View style={estilos.datos}>
          <View style={estilos.textos}>
            <Text style={estilos.nombre}>{tarjeta.nombre}</Text>
            <Text style={estilos.especie}>{NOMBRE_ESPECIE[tarjeta.especie]}</Text>
            <Text style={estilos.porcentaje}>{textoPorcentaje(tarjeta.porcentaje)}</Text>
          </View>
          <Pressable
            onPress={abrir}
            accessibilityRole="button"
            accessibilityLabel={TEXTO_INFO}
            hitSlop={12}
          >
            <MaterialCommunityIcons
              name={ICONOS_DESCUBRIR.info}
              size={36}
              color={COLORES.azulMarino}
            />
          </Pressable>
        </View>
      </Pressable>
      <View style={estilos.botones}>
        <View style={estilos.boton}>
          <BotonPildora texto={TEXTO_PASAR} alPresionar={alPasar} variante="secundario" />
        </View>
        <View style={estilos.boton}>
          <BotonPildora texto={TEXTO_ME_ENCANTA} alPresionar={abrir} />
        </View>
      </View>
    </View>
  );
}
