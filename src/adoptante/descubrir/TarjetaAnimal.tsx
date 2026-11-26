/**
 * Tarjeta del mazo de Descubrir (spec F-03: flujo A pasos 6 a 8; RF-10, N-2, DE-8, DE-10).
 *
 * Diseño del prototipo "Descubrir" (390 × 844), con los textos de la spec:
 * - tarjeta de ancho completo, radio 32, sin borde ni sombra;
 * - foto (miniatura) arriba; si la pantalla es baja, la foto se encoge
 *   (nunca los botones);
 * - "ⓘ" en un círculo crema de 44 sobre la foto, abajo a la derecha;
 * - franja azul claro con el nombre y las píldoras de especie y
 *   "{n} % compatible" (esta en menta para destacar);
 * - debajo, "Pasar" y "Me encanta" en círculos de 88, con su texto.
 * No muestra "No Apto" (DE-3).
 *
 * F-13 (decisión del equipo, no está en el SRS):
 * - AF-4: la foto es `foto` (la completa si ya llegó, si no la miniatura; lo
 *   decide `fotoDeTarjeta`) y usa `resizeMode="contain"` sobre el azul
 *   grisáceo de la tarjeta, para que siempre se vea el animal completo.
 * - AF-5: la píldora del % va en menta con texto azul marino y una estrellita.
 *
 * F-12 AE-4 (decisión del equipo, no está en el SRS; reemplaza los espacios
 * flexibles de F-11 AD-7): la tarjeta es más grande. Ocupa todo el ancho
 * menos el margen de 24 y crece en alto para usar el espacio libre (la foto
 * se estira; nunca menos de 120). Entre la tarjeta y los botones, y entre los
 * botones y la barra de pestañas, hay 16 fijos, igual que entre el subtítulo
 * y la tarjeta (`descubrir.tsx`).
 * F-11 AD-8: la tarjeta también se desliza (`useDeslizarTarjeta`): a la
 * izquierda hace lo mismo que "Pasar" y a la derecha lo mismo que
 * "Me encanta". Los botones no cambian y quedan fuera del gesto.
 *
 * Recibe la `tarjeta`, la `foto` que se muestra y qué hacer al pasar o al
 * abrir el Detalle.
 * No devuelve datos: solo dibuja.
 */
import { useCallback } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

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
import useDeslizarTarjeta from './useDeslizarTarjeta';

interface Props {
  tarjeta: TarjetaMazo;
  foto: string;
  alPasar: () => void;
  alAbrir: (animalId: string) => void;
}

/** Lo menos que se encoge la foto en pantallas bajas. */
const ALTO_FOTO_MINIMO = 120;
const DIAMETRO_ACCION = 88;
/** Margen lateral del prototipo: la tarjeta mide el ancho de la pantalla menos 2 × 24. */
const MARGEN = 24;
/** Espacio fijo entre la tarjeta, los botones y la barra de pestañas (F-12 AE-4). */
const ESPACIO = 16;

const estilos = StyleSheet.create({
  // F-12 AE-4: ocupa todo el cuerpo; la tarjeta toma el alto que dejan los botones.
  contenedor: { flex: 1, gap: ESPACIO, paddingBottom: ESPACIO },
  arrastre: { flex: 1 },
  tarjeta: {
    flex: 1,
    borderRadius: RADIOS.tarjetaGrande,
    backgroundColor: COLORES.azulGrisaceo,
    overflow: 'hidden',
  },
  foto: { flex: 1, minHeight: ALTO_FOTO_MINIMO, width: '100%' },
  info: { position: 'absolute', right: 16, bottom: 16 },
  franja: { gap: 10, padding: 20 },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 28, color: COLORES.cafe },
  pildoras: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  acciones: { flexDirection: 'row', justifyContent: 'center', gap: 44 },
  accion: { alignItems: 'center', gap: 8 },
  textoAccion: { fontFamily: FUENTES.negrita, fontSize: 14, color: COLORES.cafe },
});

export default function TarjetaAnimal({ tarjeta, foto, alPasar, alAbrir }: Props) {
  const { width } = useWindowDimensions();
  const abrir = useCallback(() => alAbrir(tarjeta.animalId), [alAbrir, tarjeta.animalId]);
  const { manejadores, estiloArrastre } = useDeslizarTarjeta({ alPasar, alMeEncanta: abrir });

  return (
    <View style={[estilos.contenedor, { width: width - MARGEN * 2 }]}>
      <Animated.View style={[estilos.arrastre, estiloArrastre]} {...manejadores}>
        <Pressable
          style={estilos.tarjeta}
          onPress={abrir}
          accessibilityRole="button"
          accessibilityLabel={tarjeta.nombre}
        >
          <View style={estilos.foto}>
            <Image source={{ uri: foto }} style={StyleSheet.absoluteFill} resizeMode="contain" />
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
              <Pildora
                texto={textoPorcentaje(tarjeta.porcentaje)}
                fondo="menta"
                colorTexto="azulMarino"
                icono={ICONOS_DESCUBRIR.estrellita}
                iconoDecorativo
              />
            </View>
          </View>
        </Pressable>
      </Animated.View>
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
