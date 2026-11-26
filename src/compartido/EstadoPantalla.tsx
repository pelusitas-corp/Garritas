/**
 * Estados comunes de una pantalla con datos (specs/02-navegacion.md §7).
 *
 * Toda pantalla que lee Firestore pasa por cuatro estados: cargando, con
 * datos, vacía y error. Este componente dibuja los tres que NO son "con
 * datos" (más "sin permiso", RNF-02), para que F-02 a F-08 los reutilicen
 * en lugar de dibujarlos cada una.
 *
 * Recibe:
 * - `estado`: 'cargando' | 'vacia' | 'error' | 'sin-permiso';
 * - `mensaje`: texto de `mensajes.ts` (en 'error' y 'sin-permiso' hay uno
 *   por defecto);
 * - `mensajeSiTarda`: solo en 'cargando'; se muestra si pasan más de 3 s
 *   (RNF-01: "Calculando compatibilidad, verifica tu conexión a internet");
 * - `boton`: botón píldora opcional debajo del mensaje;
 * - `botonChico`: píldora chica azul grisáceo con ícono, opcional, debajo del
 *   mensaje (F-13 AF-2: "Cerrar sesión" de Mi perfil en sus estados vacía y
 *   sin permiso; antes era un botón de texto, F-12 AE-6);
 * - `conLogo`: dibuja el logo del perrito y el gatito (200 de ancho) arriba
 *   del mensaje (F-12 AE-8: "Solicitudes de un animal" sin solicitudes);
 * - `ajustado`: no ocupa todo el espacio libre ni lleva relleno, para que la
 *   pantalla lo centre junto con otro bloque (F-13 AF-22).
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

// Logo del perrito y el gatito (F-11 AD-1); su tipo está en imagenes.d.ts.
import LOGO from '../../assets/images/logo-garritas.png';

import BotonPildora from './BotonPildora';
import type { IconoBotonTexto } from './BotonTexto';
import MENSAJES from './mensajes';
import { COLORES, FUENTES } from './tema';

/** RNF-01: después de 3 segundos cargando se muestra el aviso. */
export const ESPERA_MAXIMA_MS = 3000;

/** Logo de 200 de ancho con su proporción (580 : 456, F-12 AE-8). */
const ANCHO_LOGO = 200;
const ALTO_LOGO = Math.round((ANCHO_LOGO * 456) / 580);

export type TipoEstado = 'cargando' | 'vacia' | 'error' | 'sin-permiso';

interface Props {
  estado: TipoEstado;
  mensaje?: string;
  mensajeSiTarda?: string;
  boton?: { texto: string; alPresionar: () => void } | null;
  botonChico?: { texto: string; icono: IconoBotonTexto; alPresionar: () => void } | null;
  conLogo?: boolean;
  ajustado?: boolean;
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 24,
    backgroundColor: COLORES.crema,
  },
  mensaje: {
    fontFamily: FUENTES.negrita,
    fontSize: 18,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  // F-13 AF-22: sin `flex: 1` ni relleno; quien lo usa decide dónde va.
  ajustado: { flex: 0, padding: 0 },
  boton: { alignSelf: 'stretch' },
  logo: { width: ANCHO_LOGO, height: ALTO_LOGO },
});

/** Mensaje por defecto de cada estado (los de error y permiso son fijos). */
function mensajePorDefecto(estado: TipoEstado): string | undefined {
  if (estado === 'error') {
    return MENSAJES.ERROR_CONEXION;
  }
  if (estado === 'sin-permiso') {
    return MENSAJES.SIN_PERMISO;
  }
  return undefined;
}

export default function EstadoPantalla({
  estado,
  mensaje = '',
  mensajeSiTarda = '',
  boton = null,
  botonChico = null,
  conLogo = false,
  ajustado = false,
}: Props) {
  const [tarda, setTarda] = useState(false);

  useEffect(() => {
    if (estado !== 'cargando' || !mensajeSiTarda) {
      return undefined;
    }
    const temporizador = setTimeout(() => setTarda(true), ESPERA_MAXIMA_MS);
    return () => {
      clearTimeout(temporizador);
      setTarda(false);
    };
  }, [estado, mensajeSiTarda]);

  const texto =
    estado === 'cargando' ? tarda && mensajeSiTarda : mensaje || mensajePorDefecto(estado);

  return (
    <View style={[estilos.contenedor, ajustado && estilos.ajustado]}>
      {estado === 'cargando' && <ActivityIndicator size="large" color={COLORES.azulMarino} />}
      {conLogo ? (
        <Image
          source={LOGO}
          style={estilos.logo}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Logo de Garritas"
        />
      ) : null}
      {texto ? (
        <Text accessibilityRole="alert" style={estilos.mensaje}>
          {texto}
        </Text>
      ) : null}
      {boton ? (
        <View style={estilos.boton}>
          <BotonPildora texto={boton.texto} alPresionar={boton.alPresionar} />
        </View>
      ) : null}
      {botonChico ? (
        <BotonPildora
          texto={botonChico.texto}
          icono={botonChico.icono}
          alPresionar={botonChico.alPresionar}
          tamano="chico"
          gris
        />
      ) : null}
    </View>
  );
}
