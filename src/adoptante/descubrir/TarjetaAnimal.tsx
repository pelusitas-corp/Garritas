/**
 * Tarjeta del mazo de Descubrir (spec F-03: flujo A pasos 6 a 8; RF-10, N-2, DE-8).
 *
 * Diseño (prototipo "Descubrir", con los textos de la spec §6): la foto
 * (miniatura) ocupa todo el ancho y unos 2/3 de la tarjeta, con "ⓘ" en un
 * círculo crema en la esquina; abajo, una franja azul claro con el nombre y
 * píldoras crema con la especie y "{n} % compatible". Debajo, los botones
 * circulares "Pasar" y "Me encanta", cada uno con su texto. No muestra
 * "No Apto" (DE-3).
 *
 * Recibe la `tarjeta` y qué hacer al pasar o al abrir el Detalle.
 * No devuelve datos: solo dibuja.
 */
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
import BotonCircular from './BotonCircular';
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

/** Diámetro de los botones "Pasar" y "Me encanta". */
const DIAMETRO_ACCION = 84;

const estilos = StyleSheet.create({
  contenedor: { flex: 1, gap: 20 },
  tarjeta: {
    flex: 1,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.azulGrisaceo,
    overflow: 'hidden',
  },
  zonaFoto: { flex: 2 },
  foto: { flex: 1, width: '100%', backgroundColor: COLORES.menta },
  info: { position: 'absolute', right: 16, bottom: 16 },
  franja: { flex: 1, justifyContent: 'center', gap: 12, paddingHorizontal: 20 },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 32, color: COLORES.cafe },
  pildoras: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pildora: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.crema,
  },
  textoPildora: { fontFamily: FUENTES.negrita, fontSize: 14, color: COLORES.cafe },
  acciones: { flexDirection: 'row', justifyContent: 'center', gap: 48 },
  accion: { alignItems: 'center', gap: 8 },
  textoAccion: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
});

/** Píldora crema con un dato de la tarjeta (especie o %). */
function Pildora({ texto }: { texto: string }) {
  return (
    <View style={estilos.pildora}>
      <Text style={estilos.textoPildora}>{texto}</Text>
    </View>
  );
}

export default function TarjetaAnimal({ tarjeta, alPasar, alAbrir }: Props) {
  const abrir = () => alAbrir(tarjeta.animalId);
  return (
    <View style={estilos.contenedor}>
      <Pressable
        style={estilos.tarjeta}
        onPress={abrir}
        accessibilityRole="button"
        accessibilityLabel={tarjeta.nombre}
      >
        <View style={estilos.zonaFoto}>
          <Image source={{ uri: tarjeta.miniatura }} style={estilos.foto} resizeMode="cover" />
          <View style={estilos.info}>
            <BotonCircular
              icono={ICONOS_DESCUBRIR.info}
              etiqueta={TEXTO_INFO}
              fondo="crema"
              diametro={48}
              alPresionar={abrir}
            />
          </View>
        </View>
        <View style={estilos.franja}>
          <Text style={estilos.nombre} numberOfLines={1}>
            {tarjeta.nombre}
          </Text>
          <View style={estilos.pildoras}>
            <Pildora texto={NOMBRE_ESPECIE[tarjeta.especie]} />
            <Pildora texto={textoPorcentaje(tarjeta.porcentaje)} />
          </View>
        </View>
      </Pressable>
      <View style={estilos.acciones}>
        <View style={estilos.accion}>
          <BotonCircular
            icono={ICONOS_DESCUBRIR.pasar}
            etiqueta={TEXTO_PASAR}
            fondo="azulGrisaceo"
            diametro={DIAMETRO_ACCION}
            alPresionar={alPasar}
          />
          <Text style={estilos.textoAccion}>{TEXTO_PASAR}</Text>
        </View>
        <View style={estilos.accion}>
          <BotonCircular
            icono={ICONOS_DESCUBRIR.meEncanta}
            etiqueta={TEXTO_ME_ENCANTA}
            fondo="menta"
            diametro={DIAMETRO_ACCION}
            alPresionar={abrir}
          />
          <Text style={estilos.textoAccion}>{TEXTO_ME_ENCANTA}</Text>
        </View>
      </View>
    </View>
  );
}
