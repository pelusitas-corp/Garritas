/**
 * Detalle del animal, "Conoce a {nombre}" (spec F-03 flujo B: RF-28; ruta /animal/{animalId}).
 *
 * Muestra las fotos (carrusel), Especie, Edad, Tamaño, Cuidados de salud
 * (Vacunado · Esterilizado), Albergue y "¡Quiero adoptarlo!", que abre
 * Match (F-06). No muestra el % (RN-06). "←" y "✕" regresan a Descubrir,
 * que sigue en la misma tarjeta (RN-03). G-8 lo resuelve `useDetalleAnimal`.
 *
 * Diseño del prototipo "Detalle" (DE-10), con los textos de la spec:
 * encabezado con "←", "Conoce a {nombre}" y el ícono de usuario (solo
 * dibujo: 02-navegacion §4.2 no da una ruta del Detalle a Mi perfil);
 * tarjeta azul claro de radio 32 con "✕", el carrusel, el nombre con un
 * corazón, tres mosaicos crema, los cuidados de salud como píldoras y el
 * albergue con su casita; fijo abajo, "¡Quiero adoptarlo!" y el texto de apoyo.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BotonCircular from '../../../src/adoptante/descubrir/BotonCircular';
import CarruselFotos from '../../../src/adoptante/descubrir/CarruselFotos';
import { pantallaDetalle } from '../../../src/adoptante/descubrir/estados';
import { ICONOS_DESCUBRIR, iconoCuidado } from '../../../src/adoptante/descubrir/iconosDescubrir';
import Mosaico from '../../../src/adoptante/descubrir/Mosaico';
import Pildora from '../../../src/adoptante/descubrir/Pildora';
import {
  ETIQUETAS_DETALLE,
  NOMBRE_ESPECIE,
  TEXTO_APOYO_ADOPTAR,
  TEXTO_ATRAS,
  TEXTO_CERRAR,
  TEXTO_MI_PERFIL,
  TEXTO_QUIERO_ADOPTARLO,
  textoConoceA,
} from '../../../src/adoptante/descubrir/textos';
import useDetalleAnimal from '../../../src/adoptante/descubrir/useDetalleAnimal';
import BotonPildora from '../../../src/compartido/BotonPildora';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import { RUTAS, rutaMatch } from '../../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES, RADIOS } from '../../../src/compartido/tema';

/** Margen lateral del prototipo y relleno de la tarjeta: el carrusel ocupa lo que queda. */
const MARGEN = 24;
const RELLENO_TARJETA = 20;

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  encabezado: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingHorizontal: MARGEN,
  },
  titulo: { flex: 1, fontFamily: FUENTES.negrita, fontSize: 24, color: COLORES.cafe },
  // Centra la tarjeta entre el encabezado y el pie; si no cabe, se desplaza.
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: MARGEN,
    paddingVertical: 16,
  },
  tarjeta: {
    gap: 14,
    padding: RELLENO_TARJETA,
    borderRadius: RADIOS.tarjetaGrande,
    backgroundColor: COLORES.azulGrisaceo,
  },
  cerrar: { alignSelf: 'flex-end' },
  filaNombre: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nombre: { flexShrink: 1, fontFamily: FUENTES.negrita, fontSize: 30, color: COLORES.cafe },
  mosaicos: { flexDirection: 'row', gap: 8 },
  cuidados: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  albergue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nombreAlbergue: { fontFamily: FUENTES.negrita, fontSize: 13, color: COLORES.cafe },
  pie: { gap: 8, paddingHorizontal: MARGEN, paddingTop: 8, paddingBottom: 12 },
  apoyo: {
    fontFamily: FUENTES.regular,
    fontSize: 13,
    color: COLORES.cafe,
    textAlign: 'center',
  },
});

/** "←" o "✕": regresa a Descubrir. Con un enlace directo no hay a dónde regresar y lo abre. */
function regresar() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(RUTAS.descubrir);
  }
}

/** Encabezado: "←", el título y el ícono de usuario (solo dibujo). */
function Encabezado({ titulo }: { titulo: string }) {
  return (
    <View style={estilos.encabezado}>
      <Pressable
        onPress={regresar}
        accessibilityRole="button"
        accessibilityLabel={TEXTO_ATRAS}
        hitSlop={12}
      >
        <MaterialCommunityIcons name={ICONOS_DESCUBRIR.atras} size={24} color={COLORES.cafe} />
      </Pressable>
      <Text accessibilityRole="header" style={estilos.titulo} numberOfLines={1}>
        {titulo}
      </Text>
      <BotonCircular
        icono={ICONOS_DESCUBRIR.miPerfil}
        etiqueta={TEXTO_MI_PERFIL}
        fondo="azulGrisaceo"
        diametro={48}
        tamanoIcono={24}
      />
    </View>
  );
}

export default function DetalleAnimal() {
  const { animalId } = useLocalSearchParams<{ animalId: string }>();
  const { estado, reintentar } = useDetalleAnimal(animalId);
  const { width } = useWindowDimensions();
  const propsEstado = pantallaDetalle(estado.tipo, reintentar);

  if (propsEstado || estado.tipo !== 'con-datos') {
    return (
      <SafeAreaView style={estilos.pantalla}>
        <Encabezado titulo="" />
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
      <Encabezado titulo={textoConoceA(animal.nombre)} />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.tarjeta}>
          <View style={estilos.cerrar}>
            <BotonCircular
              icono={ICONOS_DESCUBRIR.cerrar}
              etiqueta={TEXTO_CERRAR}
              fondo="crema"
              diametro={44}
              tamanoIcono={24}
              alPresionar={regresar}
            />
          </View>
          <CarruselFotos imagenes={imagenes} ancho={width - MARGEN * 2 - RELLENO_TARJETA * 2} />
          <View style={estilos.filaNombre}>
            <Text style={estilos.nombre} numberOfLines={1}>
              {animal.nombre}
            </Text>
            <MaterialCommunityIcons
              name={ICONOS_DESCUBRIR.meEncanta}
              size={26}
              color={COLORES.cafe}
            />
          </View>
          <View style={estilos.mosaicos}>
            <Mosaico
              icono={ICONOS_DESCUBRIR.especie}
              etiqueta={ETIQUETAS_DETALLE.especie}
              valor={NOMBRE_ESPECIE[animal.especie]}
            />
            <Mosaico
              icono={ICONOS_DESCUBRIR.edad}
              etiqueta={ETIQUETAS_DETALLE.edad}
              valor={animal.edad}
            />
            <Mosaico
              icono={ICONOS_DESCUBRIR.tamano}
              etiqueta={ETIQUETAS_DETALLE.tamano}
              valor={animal.tamano}
            />
          </View>
          <View style={estilos.cuidados} accessibilityLabel={ETIQUETAS_DETALLE.cuidados}>
            <Pildora texto={ETIQUETAS_DETALLE.vacunado} icono={iconoCuidado(animal.vacunado)} />
            <Pildora
              texto={ETIQUETAS_DETALLE.esterilizado}
              icono={iconoCuidado(animal.esterilizado)}
            />
          </View>
          <View
            style={estilos.albergue}
            accessible
            accessibilityLabel={`${ETIQUETAS_DETALLE.albergue}: ${animal.nombreAlbergue}`}
          >
            <MaterialCommunityIcons
              name={ICONOS_DESCUBRIR.albergue}
              size={18}
              color={COLORES.cafe}
            />
            <Text style={estilos.nombreAlbergue}>{animal.nombreAlbergue}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={estilos.pie}>
        <BotonPildora
          texto={TEXTO_QUIERO_ADOPTARLO}
          alPresionar={() => router.push(rutaMatch(animal.id))}
        />
        <Text style={estilos.apoyo}>{TEXTO_APOYO_ADOPTAR}</Text>
      </View>
    </SafeAreaView>
  );
}
