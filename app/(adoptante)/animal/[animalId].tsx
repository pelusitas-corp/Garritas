/**
 * Detalle del animal, "Conoce a {nombre}" (spec F-03 flujo B: RF-28; ruta /animal/{animalId}).
 *
 * Muestra las fotos (carrusel), Especie, Edad, Tamaño, Cuidados de salud
 * (Vacunado · Esterilizado), Albergue y "¡Quiero adoptarlo!", que abre
 * Match (F-06). No muestra el % (RN-06). "←" y "✕" regresan a Descubrir,
 * que sigue en la misma tarjeta (RN-03). G-8 lo resuelve `useDetalleAnimal`.
 *
 * Diseño (prototipo "Detalle", con los textos de la spec §6): encabezado
 * con "←", el título y el ícono de usuario; tarjeta azul claro con "✕",
 * el carrusel, el nombre, tres mosaicos crema, los cuidados de salud y el
 * albergue; "¡Quiero adoptarlo!" fijo abajo, fuera de la tarjeta.
 * El ícono de usuario solo se dibuja: 02-navegacion §4.2 no da una ruta
 * del Detalle a Mi perfil.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BotonCircular from '../../../src/adoptante/descubrir/BotonCircular';
import CarruselFotos from '../../../src/adoptante/descubrir/CarruselFotos';
import { pantallaDetalle } from '../../../src/adoptante/descubrir/estados';
import { ICONOS_DESCUBRIR, iconoCuidado } from '../../../src/adoptante/descubrir/iconosDescubrir';
import type { NombreIcono } from '../../../src/adoptante/descubrir/iconosDescubrir';
import {
  ETIQUETAS_DETALLE,
  NOMBRE_ESPECIE,
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

/** Margen de la pantalla y relleno de la tarjeta: el carrusel ocupa lo que queda. */
const MARGEN = 24;
const RELLENO_TARJETA = 20;

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: MARGEN,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titulo: { flex: 1, fontFamily: FUENTES.negrita, fontSize: 26, color: COLORES.cafe },
  contenido: { padding: MARGEN },
  tarjeta: {
    gap: 16,
    padding: RELLENO_TARJETA,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.azulGrisaceo,
  },
  cerrar: { alignSelf: 'flex-end' },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 32, color: COLORES.cafe },
  mosaicos: { flexDirection: 'row', gap: 10 },
  mosaico: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.crema,
  },
  etiquetaMosaico: { fontFamily: FUENTES.regular, fontSize: 13, color: COLORES.cafe },
  valorMosaico: {
    fontFamily: FUENTES.negrita,
    fontSize: 15,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  seccion: { gap: 8 },
  etiqueta: { fontFamily: FUENTES.negrita, fontSize: 15, color: COLORES.cafe },
  cuidados: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cuidado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.crema,
  },
  textoCuidado: { fontFamily: FUENTES.negrita, fontSize: 14, color: COLORES.cafe },
  albergue: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textoAlbergue: { fontFamily: FUENTES.regular, fontSize: 15, color: COLORES.cafe },
  nombreAlbergue: { fontFamily: FUENTES.negrita, fontSize: 15, color: COLORES.cafe },
  pie: { paddingHorizontal: MARGEN, paddingTop: 8, paddingBottom: 16 },
});

/** "←" o "✕": regresa a Descubrir. Con un enlace directo no hay a dónde regresar y lo abre. */
function regresar() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(RUTAS.descubrir);
  }
}

/** Mosaico crema con ícono, etiqueta chica y valor en negrita (Especie, Edad, Tamaño). */
function Mosaico({
  icono,
  etiqueta,
  valor,
}: {
  icono: NombreIcono;
  etiqueta: string;
  valor: string;
}) {
  return (
    <View style={estilos.mosaico}>
      <MaterialCommunityIcons name={icono} size={28} color={COLORES.cafe} />
      <Text style={estilos.etiquetaMosaico}>{etiqueta}</Text>
      <Text style={estilos.valorMosaico}>{valor}</Text>
    </View>
  );
}

/** Un cuidado de salud con su ícono de sí (✓) o no (✕) (DE-7). */
function Cuidado({ texto, tiene }: { texto: string; tiene: boolean }) {
  return (
    <View style={estilos.cuidado}>
      <MaterialCommunityIcons name={iconoCuidado(tiene)} size={20} color={COLORES.azulMarino} />
      <Text style={estilos.textoCuidado}>{texto}</Text>
    </View>
  );
}

/** Encabezado: "←", el título y el ícono de usuario. */
function Encabezado({ titulo }: { titulo: string }) {
  return (
    <View style={estilos.encabezado}>
      <Pressable
        onPress={regresar}
        accessibilityRole="button"
        accessibilityLabel={TEXTO_ATRAS}
        hitSlop={12}
      >
        <MaterialCommunityIcons name={ICONOS_DESCUBRIR.atras} size={28} color={COLORES.cafe} />
      </Pressable>
      <Text accessibilityRole="header" style={estilos.titulo} numberOfLines={1}>
        {titulo}
      </Text>
      <BotonCircular
        icono={ICONOS_DESCUBRIR.miPerfil}
        etiqueta={TEXTO_MI_PERFIL}
        fondo="azulGrisaceo"
        diametro={52}
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
              alPresionar={regresar}
            />
          </View>
          <CarruselFotos imagenes={imagenes} ancho={width - MARGEN * 2 - RELLENO_TARJETA * 2} />
          <Text style={estilos.nombre}>{animal.nombre}</Text>
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
          <View style={estilos.seccion}>
            <Text style={estilos.etiqueta}>{ETIQUETAS_DETALLE.cuidados}</Text>
            <View style={estilos.cuidados}>
              <Cuidado texto={ETIQUETAS_DETALLE.vacunado} tiene={animal.vacunado} />
              <Cuidado texto={ETIQUETAS_DETALLE.esterilizado} tiene={animal.esterilizado} />
            </View>
          </View>
          <View style={estilos.albergue}>
            <MaterialCommunityIcons
              name={ICONOS_DESCUBRIR.albergue}
              size={22}
              color={COLORES.cafe}
            />
            <Text style={estilos.textoAlbergue}>{ETIQUETAS_DETALLE.albergue}</Text>
            <Text style={estilos.nombreAlbergue}>{animal.nombreAlbergue}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={estilos.pie}>
        <BotonPildora
          texto={TEXTO_QUIERO_ADOPTARLO}
          alPresionar={() => router.push(rutaMatch(animal.id))}
        />
      </View>
    </SafeAreaView>
  );
}
