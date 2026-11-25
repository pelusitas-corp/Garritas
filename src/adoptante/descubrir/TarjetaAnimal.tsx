/**
 * Tarjeta del mazo de Descubrir (spec F-03: flujo A pasos 6 a 8; RF-10, N-2, DE-8, DE-10).
 *
 * Diseño del prototipo "Descubrir" (390 × 844), con los textos de la spec:
 * - tarjeta de ancho completo, radio 32, sin borde ni sombra;
 * - foto (miniatura) arriba, de 270 de alto escalado al ancho; si la
 *   pantalla es baja, la foto se encoge (nunca los botones);
 * - "ⓘ" en un círculo crema de 44 sobre la foto, abajo a la derecha;
 * - franja azul claro con el nombre y las píldoras de especie y
 *   "{n} % compatible" (esta en menta para destacar);
 * - debajo, "Pasar" y "Me encanta" en círculos de 88, con su texto.
 * No muestra "No Apto" (DE-3).
 *
 * Recibe la `tarjeta` y qué hacer al pasar o al abrir el Detalle.
 * No devuelve datos: solo dibuja.
 */
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
import BotonCircular from './BotonCircular';
import { ICONOS_DESCUBRIR } from './iconosDescubrir';
import type { TarjetaMazo } from './mazo';
import Pildora from './Pildora';
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

/** Ancho del prototipo y alto de su foto: la foto se escala con el ancho real. */
const ANCHO_PROTOTIPO = 390;
const ALTO_FOTO_PROTOTIPO = 270;
/** Lo menos que se encoge la foto en pantallas bajas. */
const ALTO_FOTO_MINIMO = 120;
const DIAMETRO_ACCION = 88;
/** Margen lateral del prototipo: la tarjeta mide el ancho de la pantalla menos 2 × 24. */
const MARGEN = 24;

const estilos = StyleSheet.create({
  // Sin flex: 1 para poder centrarse; flexShrink deja que la foto se encoja si no cabe.
  contenedor: { flexShrink: 1, gap: 16 },
  tarjeta: {
    flexShrink: 1,
    borderRadius: RADIOS.tarjetaGrande,
    backgroundColor: COLORES.azulGrisaceo,
    overflow: 'hidden',
  },
  foto: { flexShrink: 1, minHeight: ALTO_FOTO_MINIMO, width: '100%' },
  info: { position: 'absolute', right: 16, bottom: 16 },
  franja: { gap: 10, padding: 20 },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 28, color: COLORES.cafe },
  pildoras: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  acciones: { flexDirection: 'row', justifyContent: 'center', gap: 44 },
  accion: { alignItems: 'center', gap: 8 },
  textoAccion: { fontFamily: FUENTES.negrita, fontSize: 14, color: COLORES.cafe },
});

export default function TarjetaAnimal({ tarjeta, alPasar, alAbrir }: Props) {
  const { width } = useWindowDimensions();
  const altoFoto = Math.round((ALTO_FOTO_PROTOTIPO * width) / ANCHO_PROTOTIPO);
  const abrir = () => alAbrir(tarjeta.animalId);

  return (
    <View style={[estilos.contenedor, { width: width - MARGEN * 2 }]}>
      <Pressable
        style={estilos.tarjeta}
        onPress={abrir}
        accessibilityRole="button"
        accessibilityLabel={tarjeta.nombre}
      >
        <View style={[estilos.foto, { height: altoFoto }]}>
          <Image
            source={{ uri: tarjeta.miniatura }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={estilos.info}>
            <BotonCircular
              icono={ICONOS_DESCUBRIR.info}
              etiqueta={TEXTO_INFO}
              fondo="crema"
              diametro={44}
              tamanoIcono={24}
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
            <Pildora texto={textoPorcentaje(tarjeta.porcentaje)} fondo="menta" />
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
            tamanoIcono={32}
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
            tamanoIcono={32}
            alPresionar={abrir}
          />
          <Text style={estilos.textoAccion}>{TEXTO_ME_ENCANTA}</Text>
        </View>
      </View>
    </View>
  );
}
