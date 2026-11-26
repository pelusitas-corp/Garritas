/**
 * Solicitudes de un animal ("Un hogar para Wini") (spec F-07: RF-04, RF-18,
 * RNF-02; PS-1, PS-5, PS-7 a PS-10; ruta "/solicitudes-animal/{animalId}",
 * encima de las pestañas, N-5).
 *
 * Diseño de Figma (plan de F-07): encabezado con "←" y "Solicitudes";
 * debajo, el nombre del albergue y "Un hogar para {nombre}"; en su propia
 * línea, "N solicitudes nuevas" en negrita 16 (PS-15, spec v1.1), y en la
 * línea siguiente, alineado a la derecha, "Mayor compatibilidad" (con el
 * ícono de orden; no es un botón, PS-8). Las tarjetas van de
 * mayor a menor % (RF-04) y con "No Apto" deslavadas (RF-18). Tocar los
 * datos de una tarjeta abre `/solicitud/{solicitudId}` (Detalle, F-08).
 *
 * F-08: cada tarjeta "Pendiente" tiene "✕ Rechazar" y "✓ Pre-aprobar" con
 * su confirmación (RC-05: animal, botón y confirmar = 3 toques). Al final de
 * la lista se lee "Al pre-aprobar, podrás coordinar una visita.", solo si
 * queda al menos una "Pendiente" (PA-12 y decisión 4 del plan).
 *
 * `useSolicitudesDeAnimal` lee los datos cada vez que la pantalla se enfoca
 * (PS-6). Si el animal no es de este albergue o no existe, se ve "No tienes
 * permiso para ver esta sección" (PS-5, G-11). La "←" se ve en todos los
 * estados para poder regresar.
 *
 * F-12 AE-7 y AE-8 (decisión del equipo, no está en el SRS): el nombre del
 * refugio pasa a 28 y "Un hogar para…" a 20, igual que en la lista (F-11
 * AD-11); "Mayor compatibilidad" pasa a negrita 16 con su ícono de ordenar.
 * Sin solicitudes, el logo del perrito y el gatito queda al centro con el
 * mensaje de RF-04 debajo (18, de mensajes.ts).
 *
 * F-13 AF-7 (decisión del equipo, no está en el SRS; reemplaza AE-7 en esta
 * pantalla): el refugio pasa a negrita 20. Debajo, centrados, la miniatura
 * del animal en un círculo de 96, "Un hogar para:" (18) y, en la línea
 * siguiente, el nombre del animal en negrita 32. Sin solicitudes, el logo y
 * el mensaje quedan centrados en el espacio libre debajo del encabezado.
 * AF-9: "Ordenadas de mayor a menor compatibilidad." (14), sin ícono ni
 * negrita. AF-10: "N solicitudes nuevas" en una píldora azul marino al 15 %
 * con un puntito. AF-12: las tarjetas con margen lateral de 16.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ICONOS_PANEL } from '../../../src/albergue/panel/iconosPanel';
import { textoConteo } from '../../../src/albergue/panel/panel';
import TarjetaSolicitud from '../../../src/albergue/panel/TarjetaSolicitud';
import { TEXTOS_PANEL } from '../../../src/albergue/panel/textos';
import useSolicitudesDeAnimal from '../../../src/albergue/panel/useSolicitudesDeAnimal';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import { RUTAS, rutaSolicitud } from '../../../src/compartido/navegacion/rutas';
import {
  CIRCULOS,
  COLORES,
  FONDOS,
  FUENTES,
  MARGEN_TARJETA_SOLICITUD,
  PUNTITOS,
  RADIOS,
  TAMANOS_TEXTO,
} from '../../../src/compartido/tema';

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
  titulos: { gap: 12, marginTop: 16, paddingHorizontal: MARGEN },
  // F-13 AF-7: el refugio en negrita 20 (antes 28, F-12 AE-7).
  subtitulo: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.destacado,
    color: COLORES.cafe,
  },
  // F-13 AF-7: foto en círculo, "Un hogar para:" y el nombre grande, centrados.
  animal: { alignItems: 'center', gap: 8 },
  foto: {
    width: CIRCULOS.fotoAnimal,
    height: CIRCULOS.fotoAnimal,
    borderRadius: RADIOS.pildora,
  },
  unHogarPara: {
    fontFamily: FUENTES.regular,
    fontSize: TAMANOS_TEXTO.subtitulo,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  nombreAnimal: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.nombreGrande,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  resumen: { gap: 8, marginTop: 12, marginBottom: 16, paddingHorizontal: MARGEN },
  // PS-15 y F-13 AF-10: el conteo de nuevas en píldora azul marino al 15 %.
  nuevas: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIOS.pildora,
    backgroundColor: FONDOS.nuevas,
  },
  puntitoNuevas: {
    width: PUNTITOS.estado,
    height: PUNTITOS.estado,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.azulMarino,
  },
  textoNuevas: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.dato,
    color: COLORES.azulMarino,
  },
  // F-13 AF-9: el texto de orden en regular 14, sin ícono.
  textoOrden: { fontFamily: FUENTES.regular, fontSize: TAMANOS_TEXTO.minimo, color: COLORES.cafe },
  // F-13 AF-12: tarjetas más anchas, margen lateral 16 (antes 24).
  lista: { gap: 12, paddingHorizontal: MARGEN_TARJETA_SOLICITUD, paddingBottom: MARGEN },
  alPreAprobar: {
    marginTop: 4,
    fontFamily: FUENTES.regular,
    fontSize: TAMANOS_TEXTO.minimo,
    color: COLORES.cafe,
    textAlign: 'center',
  },
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
  const { estado, decisiones, decidir } = useSolicitudesDeAnimal(animalId);
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
                guardando={decisiones[item.id]?.guardando}
                mensaje={decisiones[item.id]?.mensaje}
                alDecidir={(accion) => decidir(item.id, accion)}
              />
            )}
            ListFooterComponent={
              estado.nuevas > 0 ? (
                <Text style={estilos.alPreAprobar}>{TEXTOS_PANEL.alPreAprobar}</Text>
              ) : undefined
            }
          />
        );
      case 'cargando':
      case 'leer-solicitudes':
        return <EstadoPantalla estado="cargando" />;
      default:
        // F-12 AE-8: sin solicitudes, el logo al centro con el mensaje de RF-04.
        return (
          <EstadoPantalla
            estado={estado.tipo}
            mensaje={estado.mensaje}
            conLogo={estado.tipo === 'vacia'}
          />
        );
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
          <View style={estilos.animal}>
            <Image
              source={{ uri: estado.miniaturaAnimal }}
              style={estilos.foto}
              accessibilityIgnoresInvertColors
            />
            {/* "Un hogar para:" y, en la línea siguiente, el nombre (AF-7). */}
            <View>
              <Text style={estilos.unHogarPara}>{TEXTOS_PANEL.unHogarPara}</Text>
              <Text accessibilityRole="header" style={estilos.nombreAnimal}>
                {estado.nombreAnimal}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {estado.tipo === 'con-datos' ? (
        <View style={estilos.resumen}>
          {/* F-13 AF-10: "N solicitudes nuevas" en píldora con puntito. */}
          <View style={estilos.nuevas}>
            <View style={estilos.puntitoNuevas} />
            <Text style={estilos.textoNuevas}>{textoConteo(estado.nuevas, 'nuevas')}</Text>
          </View>
          {/* F-13 AF-9: texto de orden sin ícono ni negrita; no es tocable (PS-8). */}
          <Text style={estilos.textoOrden}>{TEXTOS_PANEL.ordenadas}</Text>
        </View>
      ) : (
        <View style={estilos.separacion} />
      )}

      {cuerpo()}
    </SafeAreaView>
  );
}
