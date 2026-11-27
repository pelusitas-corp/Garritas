/**
 * Detalle de Solicitud ("Solicitud de Ana Torres") (spec F-08: RF-05,
 * RF-21, RF-22, RF-12, RNF-02; PA-5 a PA-8, PA-10 a PA-12; ruta
 * "/solicitud/{solicitudId}"; reemplaza la pantalla provisional).
 *
 * F-12 AE-9 (decisión del equipo, no está en el SRS): Pendiente,
 * Pre-aprobada y Rechazada usan el mismo acomodo y los mismos tamaños, y
 * cada dato del adoptante sale una sola vez ("Vive en" ya no se repite en la
 * tarjeta; queda en "Su hogar y sus cuidados"). De arriba abajo:
 * - encabezado "← Solicitud de {nombre}" (negrita 24);
 * - en una línea, "Para adoptar a {animal}" (negrita 17) y a la derecha la
 *   píldora (alto 44, negrita 16): "{N}% compatible" (· "No Apto") en menta
 *   mientras está "Pendiente"; "Pre-aprobada" en menta o "Rechazada" en crema;
 * - la tarjeta del adoptante (azul grisáceo, radio 28): iniciales (PA-8),
 *   nombre (negrita 24) y, siempre en el mismo lugar, el contacto: con
 *   "Pre-aprobada", el teléfono y el correo (negrita 18) y "Contacto
 *   desbloqueado" (14); con "Pendiente" o "Rechazada", el mensaje de RF-12
 *   (negrita 16);
 * - "Su hogar y sus cuidados" (negrita 20) con sus 3 líneas (ícono de 22 y
 *   texto en negrita 16);
 * - abajo, fijo: con "Pendiente", "Al pre-aprobar, podrás coordinar una
 *   visita." (regular 14 centrado) y los botones uno encima del otro; con
 *   "Pre-aprobada", "Coordina la visita para conocerse."; con "Rechazada",
 *   nada (PA-5). Los mensajes de error (14) van arriba de los botones (PA-11).
 *
 * F-12 AE-10: tocar el teléfono abre el marcador del celular con
 * `Linking.openURL('tel:…')` (`enlaceTelefono`). Si el celular no puede
 * abrirlo, no pasa nada. Si el teléfono no tiene dígitos, no se puede tocar.
 *
 * F-13 (decisión del equipo, no está en el SRS):
 * - AF-11: mientras está "Pendiente", junto a "Para adoptar a {animal}" va el
 *   % en un círculo menta de 96 (negrita 28) con "compatible" debajo; con
 *   "No Apto", el círculo gris y "No Apto" en su propia píldora;
 * - AF-13: "Su hogar y sus cuidados" centrado y, debajo, 3 círculos azul
 *   grisáceo de 72 en una fila centrada, cada uno con su ícono (crema, 32) y
 *   el dato debajo (16, centrado, hasta 2 líneas);
 * - AF-14: "✕ Rechazada" café con texto crema (alto 40, texto 18) y la
 *   tarjeta del adoptante con opacidad 0.6. El mensaje de RF-12 se queda.
 *
 * `useDetalleSolicitud` lee los datos cada vez que la pantalla se enfoca.
 * Solicitud ajena o inexistente: "No tienes permiso para ver esta sección"
 * (A6, G-11). La "←" se ve en todos los estados para poder regresar.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { iniciales, vistaTarjeta } from '../../../src/albergue/panel/panel';
import type { SolicitudConId } from '../../../src/albergue/panel/panel';
import { TEXTOS_PANEL, textoPorcentaje } from '../../../src/albergue/panel/textos';
import BotonesDecision from '../../../src/albergue/solicitud/BotonesDecision';
import { lineasDelHogar, vistaDelEstado } from '../../../src/albergue/solicitud/decision';
import type { VistaContacto } from '../../../src/albergue/solicitud/decision';
import { ICONOS_DECISION, ICONOS_HOGAR } from '../../../src/albergue/solicitud/iconosDecision';
import { enlaceTelefono } from '../../../src/albergue/solicitud/telefono';
import {
  TEXTOS_DECISION,
  textoParaAdoptarA,
  textoSolicitudDe,
  textoTelefono,
} from '../../../src/albergue/solicitud/textos';
import useDetalleSolicitud from '../../../src/albergue/solicitud/useDetalleSolicitud';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import { RUTAS, rutaSolicitudesAnimal } from '../../../src/compartido/navegacion/rutas';
import {
  ALTO_PILDORA_GRANDE,
  CIRCULOS,
  COLORES,
  FUENTES,
  ICONOS,
  OPACIDAD_ATENUADA,
  RADIOS,
  TAMANOS_TEXTO,
} from '../../../src/compartido/tema';

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
  textoPildora: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
  // F-13 AF-14: "✕ Rechazada" café con texto crema, más grande.
  pildoraRechazada: {
    height: ALTO_PILDORA_GRANDE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.cafe,
  },
  textoRechazada: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.subtitulo,
    color: COLORES.crema,
  },
  // F-13 AF-11: el % en un círculo de 96 con "compatible" debajo.
  porcentaje: { alignItems: 'center', gap: 4 },
  circuloPorcentaje: {
    width: CIRCULOS.porcentajeDetalle,
    height: CIRCULOS.porcentajeDetalle,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
  },
  textoPorcentaje: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.porcentajeDetalle,
    color: COLORES.cafe,
  },
  compatible: { fontFamily: FUENTES.negrita, fontSize: TAMANOS_TEXTO.minimo, color: COLORES.cafe },
  noApto: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.cafe,
  },
  textoNoApto: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.minimo,
    color: COLORES.crema,
  },
  atenuada: { opacity: OPACIDAD_ATENUADA },
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
  // F-12 AE-9: nombre 24, contacto 18 y el mensaje de RF-12 en 16.
  nombre: { fontFamily: FUENTES.negrita, fontSize: 24, color: COLORES.cafe },
  contacto: { fontFamily: FUENTES.negrita, fontSize: 18, color: COLORES.cafe },
  contactoOculto: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.dato,
    color: COLORES.cafe,
  },
  // F-12 AE-10: el teléfono es un enlace con área de toque de 44.
  enlace: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 },
  subrayado: { textDecorationLine: 'underline' },
  desbloqueado: {
    fontFamily: FUENTES.regular,
    fontSize: TAMANOS_TEXTO.minimo,
    color: COLORES.cafe,
  },
  seccion: { gap: 12 },
  tituloSeccion: {
    fontFamily: FUENTES.negrita,
    fontSize: 20,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  // F-13 AF-13: 3 círculos en una fila centrada, cada uno con su dato debajo.
  filaHogar: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  datoHogar: { flex: 1, alignItems: 'center', gap: 8 },
  circuloHogar: {
    width: CIRCULOS.hogar,
    height: CIRCULOS.hogar,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.azulGrisaceo,
  },
  textoHogar: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.dato,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  abajo: { gap: 12, paddingHorizontal: MARGEN, paddingTop: 12, paddingBottom: MARGEN },
  textoAbajo: {
    fontFamily: FUENTES.regular,
    fontSize: TAMANOS_TEXTO.minimo,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  mensaje: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.minimo,
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

/**
 * Lo de la derecha de "Para adoptar a…" (PA-5): mientras está "Pendiente",
 * el % en un círculo con "compatible" y, si es el caso, "No Apto" (F-13
 * AF-11); con "Pre-aprobada", su píldora menta; con "Rechazada", la píldora
 * café "✕ Rechazada" (F-13 AF-14).
 */
function PildoraDetalle({ solicitud }: { solicitud: SolicitudConId }) {
  const vista = vistaDelEstado(solicitud.estado);
  if (vista === 'rechazada') {
    return (
      <View style={estilos.pildoraRechazada}>
        <MaterialCommunityIcons
          name={ICONOS_DECISION.rechazar}
          size={TAMANOS_TEXTO.subtitulo}
          color={COLORES.crema}
        />
        <Text style={estilos.textoRechazada}>{solicitud.estado}</Text>
      </View>
    );
  }
  if (vista === 'pre-aprobada') {
    return (
      <View style={[estilos.pildora, estilos.menta]}>
        <Text style={estilos.textoPildora}>{solicitud.estado}</Text>
      </View>
    );
  }
  const { fondoCirculo, etiqueta } = vistaTarjeta(solicitud);
  return (
    <View style={estilos.porcentaje}>
      <View style={[estilos.circuloPorcentaje, { backgroundColor: fondoCirculo }]}>
        <Text style={estilos.textoPorcentaje}>{textoPorcentaje(solicitud.porcentaje)}</Text>
      </View>
      <Text style={estilos.compatible}>{TEXTOS_PANEL.compatible}</Text>
      {etiqueta ? (
        <View style={estilos.noApto}>
          <Text style={estilos.textoNoApto}>{etiqueta}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** F-12 AE-10: pide al celular abrir el marcador. Si no puede, no pasa nada (no hay mensaje). */
function llamar(enlace: string) {
  Linking.openURL(enlace).catch(() => null);
}

/**
 * Teléfono del adoptante (PA-6). Si tiene dígitos, es un enlace que llama al
 * tocarlo (F-12 AE-10); si no, solo se lee.
 */
function Telefono({ telefono }: { telefono: string }) {
  const enlace = enlaceTelefono(telefono);
  const texto = textoTelefono(telefono);
  if (!enlace) {
    return <Text style={estilos.contacto}>{texto}</Text>;
  }
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={texto}
      accessibilityHint={TEXTOS_DECISION.llamar}
      onPress={() => llamar(enlace)}
      style={({ pressed }) => [estilos.enlace, pressed && estilos.presionado]}
    >
      <MaterialCommunityIcons name={ICONOS_DECISION.llamar} size={18} color={COLORES.cafe} />
      <Text style={[estilos.contacto, estilos.subrayado]}>{texto}</Text>
    </Pressable>
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
          <Telefono telefono={contacto.telefono} />
          <Text style={estilos.contacto}>{contacto.correo}</Text>
          <Text style={estilos.desbloqueado}>{TEXTOS_DECISION.contactoDesbloqueado}</Text>
        </>
      );
    default:
      return (
        <Text accessibilityRole="alert" style={estilos.contactoOculto}>
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

            <View style={[estilos.tarjeta, vista === 'rechazada' && estilos.atenuada]}>
              <View style={estilos.circulo}>
                <Text style={estilos.iniciales}>{iniciales(solicitud.nombreAdoptante)}</Text>
              </View>
              <View style={estilos.datosAdoptante}>
                <Text style={estilos.nombre}>{solicitud.nombreAdoptante}</Text>
                {/* F-12 AE-9: "Vive en" ya no se repite aquí; está en "Su hogar y sus cuidados". */}
                <Contacto contacto={estado.contacto} />
              </View>
            </View>

            <View style={estilos.seccion}>
              <Text style={estilos.tituloSeccion}>{TEXTOS_DECISION.suHogar}</Text>
              <View style={estilos.filaHogar}>
                {hogar.map((linea) => (
                  <View key={linea.clave} style={estilos.datoHogar}>
                    <View style={estilos.circuloHogar}>
                      <MaterialCommunityIcons
                        name={ICONOS_HOGAR[linea.clave]}
                        size={ICONOS.hogar}
                        color={COLORES.crema}
                      />
                    </View>
                    <Text style={estilos.textoHogar} numberOfLines={2}>
                      {linea.texto}
                    </Text>
                  </View>
                ))}
              </View>
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
