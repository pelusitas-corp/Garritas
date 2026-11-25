/**
 * Solicitudes de un animal ("Un hogar para Wini") (spec F-07: RF-04, RF-18,
 * RNF-02; PS-1, PS-5, PS-7 a PS-10; ruta "/solicitudes-animal/{animalId}",
 * encima de las pestañas, N-5).
 *
 * Diseño de Figma (plan de F-07): encabezado con "←" y "Solicitudes";
 * debajo, el nombre del albergue y "Un hogar para {nombre}"; en una misma
 * línea, "N solicitudes nuevas" a la izquierda y "Mayor compatibilidad" (con
 * el ícono de orden; no es un botón, PS-8) a la derecha. Las tarjetas van de
 * mayor a menor % (RF-04) y con "No Apto" deslavadas (RF-18). Tocar una
 * tarjeta abre `/solicitud/{solicitudId}` (provisional hasta F-08).
 *
 * `useSolicitudesDeAnimal` lee los datos cada vez que la pantalla se enfoca
 * (PS-6). Si el animal no es de este albergue o no existe, se ve "No tienes
 * permiso para ver esta sección" (PS-5, G-11). La "←" se ve en todos los
 * estados para poder regresar.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ICONOS_PANEL } from '../../../src/albergue/panel/iconosPanel';
import { textoConteo } from '../../../src/albergue/panel/panel';
import TarjetaSolicitud from '../../../src/albergue/panel/TarjetaSolicitud';
import { TEXTOS_PANEL, textoUnHogarPara } from '../../../src/albergue/panel/textos';
import useSolicitudesDeAnimal from '../../../src/albergue/panel/useSolicitudesDeAnimal';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import { RUTAS, rutaSolicitud } from '../../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES } from '../../../src/compartido/tema';

/** Margen lateral (Figma). */
const MARGEN = 24;

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  encabezado: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: MARGEN,
  },
  atras: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  presionado: { opacity: 0.6 },
  textoEncabezado: { fontFamily: FUENTES.negrita, fontSize: 24, color: COLORES.cafe },
  titulos: { gap: 2, marginTop: 16, paddingHorizontal: MARGEN },
  subtitulo: { fontFamily: FUENTES.negrita, fontSize: 13, color: COLORES.cafe },
  titulo: { fontFamily: FUENTES.negrita, fontSize: 26, color: COLORES.cafe },
  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: MARGEN,
  },
  nuevas: { fontFamily: FUENTES.regular, fontSize: 12, color: COLORES.cafe },
  orden: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  textoOrden: { fontFamily: FUENTES.negrita, fontSize: 12, color: COLORES.cafe },
  lista: { gap: 12, paddingHorizontal: MARGEN, paddingBottom: MARGEN },
  separacion: { height: 16 },
});

/** "←": regresa a la lista. Si se abrió sin una pantalla anterior, va a `/solicitudes`. */
function regresar() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.navigate(RUTAS.solicitudes);
  }
}

export default function SolicitudesDeUnAnimal() {
  const { animalId } = useLocalSearchParams<{ animalId: string }>();
  const { estado } = useSolicitudesDeAnimal(animalId);
  const conTitulo =
    estado.tipo === 'leer-solicitudes' || estado.tipo === 'vacia' || estado.tipo === 'con-datos';

  /** Lo que va debajo de los títulos: las tarjetas o el estado de la pantalla. */
  const cuerpo = () => {
    switch (estado.tipo) {
      case 'con-datos':
        return (
          <FlatList
            data={estado.solicitudes}
            keyExtractor={(solicitud) => solicitud.id}
            contentContainerStyle={estilos.lista}
            renderItem={({ item }) => (
              <TarjetaSolicitud
                solicitud={item}
                alPresionar={() => router.push(rutaSolicitud(item.id))}
              />
            )}
          />
        );
      case 'cargando':
      case 'leer-solicitudes':
        return <EstadoPantalla estado="cargando" />;
      default:
        return <EstadoPantalla estado={estado.tipo} mensaje={estado.mensaje} />;
    }
  };

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top', 'bottom']}>
      <View style={estilos.encabezado}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={TEXTOS_PANEL.atras}
          hitSlop={8}
          onPress={regresar}
          style={({ pressed }) => [estilos.atras, pressed && estilos.presionado]}
        >
          <MaterialCommunityIcons name={ICONOS_PANEL.atras} size={24} color={COLORES.cafe} />
          <Text accessibilityRole="header" style={estilos.textoEncabezado}>
            {TEXTOS_PANEL.encabezado}
          </Text>
        </Pressable>
      </View>

      {conTitulo ? (
        <View style={estilos.titulos}>
          <Text style={estilos.subtitulo}>{estado.nombreAlbergue}</Text>
          <Text style={estilos.titulo}>{textoUnHogarPara(estado.nombreAnimal)}</Text>
        </View>
      ) : null}

      {estado.tipo === 'con-datos' ? (
        <View style={estilos.resumen}>
          <Text style={estilos.nuevas}>{textoConteo(estado.nuevas, 'nuevas')}</Text>
          <View style={estilos.orden}>
            <MaterialCommunityIcons name={ICONOS_PANEL.orden} size={16} color={COLORES.cafe} />
            <Text style={estilos.textoOrden}>{TEXTOS_PANEL.mayorCompatibilidad}</Text>
          </View>
        </View>
      ) : (
        <View style={estilos.separacion} />
      )}

      {cuerpo()}
    </SafeAreaView>
  );
}
