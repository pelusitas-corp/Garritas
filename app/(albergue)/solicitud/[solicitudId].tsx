/**
 * Detalle de Solicitud ("Solicitud de Ana Torres") (spec F-08: RF-05,
 * RF-21, RF-22, RF-12, RNF-02; PA-5 a PA-8, PA-10 a PA-12; ruta
 * "/solicitud/{solicitudId}"; reemplaza la pantalla provisional).
 *
 * Diseño de Figma (plan de F-08):
 * - encabezado "← Solicitud de {nombre}" (negrita 24);
 * - en una línea, "Para adoptar a {animal}" (negrita 17) y a la derecha la
 *   píldora (alto 44, negrita 16): "{N}% compatible" (· "No Apto") en menta
 *   mientras está "Pendiente"; "Pre-aprobada" en menta o "Rechazada" en crema;
 * - la tarjeta del adoptante (azul grisáceo, radio 28): iniciales (PA-8),
 *   nombre (negrita 22), el contacto o el mensaje de RF-12 (negrita 13) y
 *   "Vive en" con el ícono de casa (PA-7);
 * - "Su hogar y sus cuidados" (negrita 20) con sus 3 líneas (ícono de 22 y
 *   texto en negrita 15);
 * - abajo, fijo: con "Pendiente", "Al pre-aprobar, podrás coordinar una
 *   visita." (regular 13 centrado) y los botones uno encima del otro; con
 *   "Pre-aprobada", "Coordina la visita para conocerse."; con "Rechazada",
 *   nada (PA-5). Los mensajes de error van arriba de los botones (PA-11).
 *
 * `useDetalleSolicitud` lee los datos cada vez que la pantalla se enfoca.
 * Solicitud ajena o inexistente: "No tienes permiso para ver esta sección"
 * (A6, G-11). La "←" se ve en todos los estados para poder regresar.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { iniciales } from '../../../src/albergue/panel/panel';
import type { SolicitudConId } from '../../../src/albergue/panel/panel';
import BotonesDecision from '../../../src/albergue/solicitud/BotonesDecision';
import { lineasDelHogar, vistaDelEstado } from '../../../src/albergue/solicitud/decision';
import type { VistaContacto } from '../../../src/albergue/solicitud/decision';
import { ICONOS_DECISION, ICONOS_HOGAR } from '../../../src/albergue/solicitud/iconosDecision';
import {
  TEXTOS_DECISION,
  textoParaAdoptarA,
  textoPorcentajeCompatible,
  textoSolicitudDe,
  textoTelefono,
} from '../../../src/albergue/solicitud/textos';
import useDetalleSolicitud from '../../../src/albergue/solicitud/useDetalleSolicitud';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import { RUTAS, rutaSolicitudesAnimal } from '../../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES, RADIOS } from '../../../src/compartido/tema';

/** Margen lateral (Figma). */
const MARGEN = 24;

/** Radio de la tarjeta del adoptante (Figma, igual que F-07); cumple el mínimo de 24. */
const RADIO_TARJETA = 28;

/** Diámetro del círculo de iniciales (Figma, igual que F-07). */
const DIAMETRO_INICIALES = 44;

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  encabezado: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: MARGEN,
  },
  atras: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  presionado: { opacity: 0.6 },
  textoEncabezado: {
    flexShrink: 1,
    fontFamily: FUENTES.negrita,
    fontSize: 24,
    color: COLORES.cafe,
  },
  contenido: { gap: 20, padding: MARGEN },
  lineaAnimal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  paraAdoptar: { flex: 1, fontFamily: FUENTES.negrita, fontSize: 17, color: COLORES.cafe },
  pildora: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: RADIOS.pildora,
  },
  menta: { backgroundColor: COLORES.menta },
  crema: { backgroundColor: COLORES.crema },
  textoPildora: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: RADIO_TARJETA,
    backgroundColor: COLORES.azulGrisaceo,
  },
  circulo: {
    width: DIAMETRO_INICIALES,
    height: DIAMETRO_INICIALES,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.crema,
  },
  iniciales: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
  datosAdoptante: { flex: 1, alignItems: 'flex-start', gap: 4 },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 22, color: COLORES.cafe },
  contacto: { fontFamily: FUENTES.negrita, fontSize: 13, color: COLORES.cafe },
  desbloqueado: { fontFamily: FUENTES.regular, fontSize: 12, color: COLORES.cafe },
  lineaConIcono: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  seccion: { gap: 12 },
  tituloSeccion: { fontFamily: FUENTES.negrita, fontSize: 20, color: COLORES.cafe },
  textoHogar: { flexShrink: 1, fontFamily: FUENTES.negrita, fontSize: 15, color: COLORES.cafe },
  abajo: { gap: 12, paddingHorizontal: MARGEN, paddingTop: 12, paddingBottom: MARGEN },
  textoAbajo: {
    fontFamily: FUENTES.regular,
    fontSize: 13,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  mensaje: {
    fontFamily: FUENTES.negrita,
    fontSize: 13,
    color: COLORES.cafe,
    textAlign: 'center',
  },
});

/** "←": regresa a las solicitudes del animal (o a la lista, si no hay pantalla anterior). */
function regresar(animalId: string | null) {
  if (router.canGoBack()) {
    router.back();
  } else if (animalId) {
    router.navigate(rutaSolicitudesAnimal(animalId));
  } else {
    router.navigate(RUTAS.solicitudes);
  }
}

/** Píldora de la derecha: el % mientras está "Pendiente"; si no, el estado final (PA-5). */
function PildoraDetalle({ solicitud }: { solicitud: SolicitudConId }) {
  const vista = vistaDelEstado(solicitud.estado);
  const texto =
    vista === 'botones'
      ? textoPorcentajeCompatible(solicitud.porcentaje, solicitud.noApto)
      : solicitud.estado;
  return (
    <View style={[estilos.pildora, vista === 'rechazada' ? estilos.crema : estilos.menta]}>
      <Text style={estilos.textoPildora}>{texto}</Text>
    </View>
  );
}

/** Contacto del adoptante, o el mensaje que va en su lugar (RF-12, A4, decisión 2 del plan). */
function Contacto({ contacto }: { contacto: VistaContacto }) {
  switch (contacto.tipo) {
    case 'cargando':
      return <ActivityIndicator color={COLORES.cafe} />;
    case 'visible':
      return (
        <>
          <Text style={estilos.contacto}>{textoTelefono(contacto.telefono)}</Text>
          <Text style={estilos.contacto}>{contacto.correo}</Text>
          <Text style={estilos.desbloqueado}>{TEXTOS_DECISION.contactoDesbloqueado}</Text>
        </>
      );
    default:
      return (
        <Text accessibilityRole="alert" style={estilos.contacto}>
          {contacto.mensaje}
        </Text>
      );
  }
}

export default function DetalleDeSolicitud() {
  const { solicitudId } = useLocalSearchParams<{ solicitudId: string }>();
  const { estado, guardando, mensaje, decidir } = useDetalleSolicitud(solicitudId);
  const solicitud = estado.tipo === 'con-datos' ? estado.solicitud : null;
  const vista = solicitud ? vistaDelEstado(solicitud.estado) : null;
  const hogar = solicitud ? lineasDelHogar(solicitud.resumenHogar) : [];

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top', 'bottom']}>
      <View style={estilos.encabezado}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={TEXTOS_DECISION.atras}
          hitSlop={8}
          onPress={() => regresar(solicitud ? solicitud.animalId : null)}
          style={({ pressed }) => [estilos.atras, pressed && estilos.presionado]}
        >
          <MaterialCommunityIcons name={ICONOS_DECISION.atras} size={24} color={COLORES.cafe} />
          {solicitud ? (
            <Text accessibilityRole="header" style={estilos.textoEncabezado}>
              {textoSolicitudDe(solicitud.nombreAdoptante)}
            </Text>
          ) : null}
        </Pressable>
      </View>

      {estado.tipo !== 'con-datos' || !solicitud ? (
        <EstadoPantalla
          estado={estado.tipo === 'con-datos' ? 'cargando' : estado.tipo}
          mensaje={estado.tipo === 'error' || estado.tipo === 'sin-permiso' ? estado.mensaje : ''}
        />
      ) : (
        <>
          <ScrollView contentContainerStyle={estilos.contenido}>
            <View style={estilos.lineaAnimal}>
              <Text style={estilos.paraAdoptar}>{textoParaAdoptarA(solicitud.nombreAnimal)}</Text>
              <PildoraDetalle solicitud={solicitud} />
            </View>

            <View style={estilos.tarjeta}>
              <View style={estilos.circulo}>
                <Text style={estilos.iniciales}>{iniciales(solicitud.nombreAdoptante)}</Text>
              </View>
              <View style={estilos.datosAdoptante}>
                <Text style={estilos.nombre}>{solicitud.nombreAdoptante}</Text>
                <Contacto contacto={estado.contacto} />
                <View style={estilos.lineaConIcono}>
                  <MaterialCommunityIcons
                    name={ICONOS_HOGAR.viveEn}
                    size={18}
                    color={COLORES.cafe}
                  />
                  <Text style={estilos.contacto}>{hogar[0].texto}</Text>
                </View>
              </View>
            </View>

            <View style={estilos.seccion}>
              <Text style={estilos.tituloSeccion}>{TEXTOS_DECISION.suHogar}</Text>
              {hogar.map((linea) => (
                <View key={linea.clave} style={estilos.lineaConIcono}>
                  <MaterialCommunityIcons
                    name={ICONOS_HOGAR[linea.clave]}
                    size={22}
                    color={COLORES.cafe}
                  />
                  <Text style={estilos.textoHogar}>{linea.texto}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={estilos.abajo}>
            {vista === 'botones' ? (
              <Text style={estilos.textoAbajo}>{TEXTOS_DECISION.alPreAprobar}</Text>
            ) : null}
            {vista === 'pre-aprobada' ? (
              <Text style={estilos.textoAbajo}>{TEXTOS_DECISION.coordinaLaVisita}</Text>
            ) : null}
            {mensaje ? (
              <Text accessibilityRole="alert" style={estilos.mensaje}>
                {mensaje}
              </Text>
            ) : null}
            {vista === 'botones' ? (
              <BotonesDecision
                variante="detalle"
                nombreAdoptante={solicitud.nombreAdoptante}
                guardando={guardando}
                alDecidir={decidir}
              />
            ) : null}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
