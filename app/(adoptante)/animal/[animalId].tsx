/**
 * Detalle del animal, "Conoce a {nombre}" (spec F-03 flujo B: RF-28; ruta /animal/{animalId}).
 *
 * Muestra las fotos (carrusel), Especie, Edad, Tamaño, Cuidados de salud
 * (Vacunado · Esterilizado), Albergue y "¡Quiero adoptarlo!", que abre
 * Match (F-06). No muestra el % (RN-06). "←" y "✕" regresan a Descubrir,
 * que sigue en la misma tarjeta (RN-03). G-8 lo resuelve `useDetalleAnimal`.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CarruselFotos from '../../../src/adoptante/descubrir/CarruselFotos';
import { pantallaDetalle } from '../../../src/adoptante/descubrir/estados';
import { iconoCuidado } from '../../../src/adoptante/descubrir/iconosDescubrir';
import {
  ETIQUETAS_DETALLE,
  NOMBRE_ESPECIE,
  TEXTO_ATRAS,
  TEXTO_CERRAR,
  TEXTO_QUIERO_ADOPTARLO,
  textoConoceA,
} from '../../../src/adoptante/descubrir/textos';
import useDetalleAnimal from '../../../src/adoptante/descubrir/useDetalleAnimal';
import BotonPildora from '../../../src/compartido/BotonPildora';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import { RUTAS, rutaMatch } from '../../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES, RADIOS } from '../../../src/compartido/tema';

/** Margen de la pantalla; el carrusel ocupa el ancho menos los dos márgenes. */
const MARGEN = 24;

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: MARGEN,
    paddingTop: 8,
  },
  botonIcono: { fontFamily: FUENTES.negrita, fontSize: 30, color: COLORES.azulMarino },
  contenido: { gap: 20, padding: MARGEN },
  titulo: { fontFamily: FUENTES.negrita, fontSize: 30, color: COLORES.cafe },
  ficha: { gap: 16, padding: 20, borderRadius: RADIOS.tarjeta, backgroundColor: COLORES.menta },
  dato: { gap: 4 },
  etiqueta: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.azulMarino },
  valor: { fontFamily: FUENTES.regular, fontSize: 18, color: COLORES.cafe },
  cuidados: { flexDirection: 'row', gap: 24 },
  cuidado: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

/** "←" o "✕": regresa a Descubrir. Con un enlace directo no hay a dónde regresar y lo abre. */
function regresar() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(RUTAS.descubrir);
  }
}

/** Una etiqueta con su valor (RF-28). */
function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.dato}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

/** Un cuidado de salud con su ícono de sí (✓) o no (✕) (DE-7). */
function Cuidado({ texto, tiene }: { texto: string; tiene: boolean }) {
  return (
    <View style={estilos.cuidado}>
      <MaterialCommunityIcons name={iconoCuidado(tiene)} size={24} color={COLORES.azulMarino} />
      <Text style={estilos.valor}>{texto}</Text>
    </View>
  );
}

export default function DetalleAnimal() {
  const { animalId } = useLocalSearchParams<{ animalId: string }>();
  const { estado, reintentar } = useDetalleAnimal(animalId);
  const { width } = useWindowDimensions();
  const propsEstado = pantallaDetalle(estado.tipo, reintentar);

  const encabezado = (
    <View style={estilos.encabezado}>
      <Pressable onPress={regresar} accessibilityRole="button" hitSlop={12}>
        <Text style={estilos.botonIcono}>{TEXTO_ATRAS}</Text>
      </Pressable>
      <Pressable onPress={regresar} accessibilityRole="button" hitSlop={12}>
        <Text style={estilos.botonIcono}>{TEXTO_CERRAR}</Text>
      </Pressable>
    </View>
  );

  if (propsEstado || estado.tipo !== 'con-datos') {
    return (
      <SafeAreaView style={estilos.pantalla}>
        {encabezado}
        <EstadoPantalla
          estado={propsEstado?.estado ?? 'cargando'}
          mensaje={propsEstado?.mensaje}
          boton={propsEstado?.boton}
        />
      </SafeAreaView>
    );
  }

  const { animal, fotos } = estado;
  // RN-07: mientras llegan las fotos completas se ve la miniatura.
  const imagenes = fotos ? fotos.map((foto) => foto.datos) : [animal.miniatura];

  return (
    <SafeAreaView style={estilos.pantalla}>
      {encabezado}
      <ScrollView contentContainerStyle={estilos.contenido}>
        <CarruselFotos imagenes={imagenes} ancho={width - MARGEN * 2} />
        <Text accessibilityRole="header" style={estilos.titulo}>
          {textoConoceA(animal.nombre)}
        </Text>
        <View style={estilos.ficha}>
          <Dato etiqueta={ETIQUETAS_DETALLE.especie} valor={NOMBRE_ESPECIE[animal.especie]} />
          <Dato etiqueta={ETIQUETAS_DETALLE.edad} valor={animal.edad} />
          <Dato etiqueta={ETIQUETAS_DETALLE.tamano} valor={animal.tamano} />
          <View style={estilos.dato}>
            <Text style={estilos.etiqueta}>{ETIQUETAS_DETALLE.cuidados}</Text>
            <View style={estilos.cuidados}>
              <Cuidado texto={ETIQUETAS_DETALLE.vacunado} tiene={animal.vacunado} />
              <Cuidado texto={ETIQUETAS_DETALLE.esterilizado} tiene={animal.esterilizado} />
            </View>
          </View>
          <Dato etiqueta={ETIQUETAS_DETALLE.albergue} valor={animal.nombreAlbergue} />
        </View>
        <BotonPildora
          texto={TEXTO_QUIERO_ADOPTARLO}
          alPresionar={() => router.push(rutaMatch(animal.id))}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
