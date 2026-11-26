/**
 * Carrusel de fotos del Detalle (spec F-03 RN-07, D-36): `FlatList`
 * horizontal de React Native, sin librerías nuevas. Una foto por página.
 *
 * Recibe las imágenes en base64 (con el prefijo `data:image/jpeg;base64,`,
 * M-2) ya ordenadas, y el ancho de cada página. Mientras llegan las fotos,
 * el Detalle le pasa solo la miniatura. No devuelve datos: solo dibuja.
 *
 * F-11 AD-9 (decisión del equipo; no está en el SRS): también recibe el
 * `alto` (el Detalle mide el espacio libre). La foto se ve completa
 * (`contain`) y el sobrante es azul grisáceo, el color de la tarjeta.
 */
import { FlatList, Image, StyleSheet, View } from 'react-native';

import { COLORES, RADIOS } from '../../compartido/tema';

/** Alto mínimo de las fotos del Detalle (prototipo, DE-10; F-11 AD-9). */
export const ALTO_FOTO_MINIMO = 180;

interface Props {
  imagenes: readonly string[];
  ancho: number;
  alto: number;
}

const estilos = StyleSheet.create({
  // Bordes redondeados: el contenedor recorta las fotos (overflow). El
  // prototipo usa 20; el mínimo de Soft UI es 24 (arquitectura §8).
  marco: { borderRadius: RADIOS.tarjeta, overflow: 'hidden' },
  lista: { flexGrow: 0 },
  foto: { backgroundColor: COLORES.azulGrisaceo },
});

export default function CarruselFotos({ imagenes, ancho, alto }: Props) {
  return (
    <View style={[estilos.marco, { width: ancho }]}>
      <FlatList
        data={imagenes}
        keyExtractor={(_imagen, indice) => String(indice)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={imagenes.length > 1}
        style={[estilos.lista, { width: ancho }]}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={[estilos.foto, { width: ancho, height: alto }]}
            resizeMode="contain"
          />
        )}
      />
    </View>
  );
}
