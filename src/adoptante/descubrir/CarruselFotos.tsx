/**
 * Carrusel de fotos del Detalle (spec F-03 RN-07, D-36): `FlatList`
 * horizontal de React Native, sin librerías nuevas. Una foto por página.
 *
 * Recibe las imágenes en base64 (con el prefijo `data:image/jpeg;base64,`,
 * M-2) ya ordenadas, y el ancho de cada página. Mientras llegan las fotos,
 * el Detalle le pasa solo la miniatura. No devuelve datos: solo dibuja.
 */
import { FlatList, Image, StyleSheet } from 'react-native';

import { COLORES, RADIOS } from '../../compartido/tema';

/** Alto de las fotos del Detalle. */
const ALTO_FOTO = 300;

interface Props {
  imagenes: readonly string[];
  ancho: number;
}

const estilos = StyleSheet.create({
  lista: { borderRadius: RADIOS.tarjeta, flexGrow: 0 },
  foto: { height: ALTO_FOTO, backgroundColor: COLORES.azulGrisaceo },
});

export default function CarruselFotos({ imagenes, ancho }: Props) {
  return (
    <FlatList
      data={imagenes}
      keyExtractor={(_imagen, indice) => String(indice)}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={imagenes.length > 1}
      style={[estilos.lista, { width: ancho }]}
      renderItem={({ item }) => (
        <Image source={{ uri: item }} style={[estilos.foto, { width: ancho }]} resizeMode="cover" />
      )}
    />
  );
}
