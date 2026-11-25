/**
 * Dibuja un aviso de privacidad a partir de su Markdown (F-01 §3, A-5).
 *
 * Recibe `markdown`: el texto de avisos.ts. Usa `bloquesDeAviso` para
 * separarlo en títulos, párrafos, listas y separadores, y dibuja cada uno.
 * No devuelve datos: solo dibuja el texto (el desplazamiento lo pone la
 * pantalla con un ScrollView).
 */
import { StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES } from '../tema';
import { bloquesDeAviso } from './lectorAviso';
import type { Bloque, Parte } from './lectorAviso';

const estilos = StyleSheet.create({
  contenedor: { gap: 12 },
  titulo1: { fontFamily: FUENTES.negrita, fontSize: 20, color: COLORES.cafe },
  titulo2: { fontFamily: FUENTES.negrita, fontSize: 17, color: COLORES.cafe },
  parrafo: { fontFamily: FUENTES.regular, fontSize: 15, lineHeight: 22, color: COLORES.cafe },
  negrita: { fontFamily: FUENTES.negrita },
  lista: { gap: 6 },
  separador: { height: 2, backgroundColor: COLORES.azulGrisaceo },
});

/**
 * Recibe una lista. Devuelve cada elemento con una clave fija para React.
 * Los avisos no cambian de orden, así que la posición sirve como clave.
 */
function conClaves<T>(lista: readonly T[]): { clave: string; valor: T }[] {
  return lista.map((valor, posicion) => ({ clave: `p${posicion}`, valor }));
}

/** Dibuja las partes de una línea, con las negritas en su lugar. */
function Partes({ partes }: { partes: Parte[] }) {
  return conClaves(partes).map(({ clave, valor }) => (
    <Text key={clave} style={valor.negrita ? estilos.negrita : undefined}>
      {valor.texto}
    </Text>
  ));
}

/** Dibuja un bloque del aviso. */
function BloqueAviso({ bloque }: { bloque: Bloque }) {
  switch (bloque.tipo) {
    case 'titulo':
      return (
        <Text
          accessibilityRole="header"
          style={bloque.nivel === 1 ? estilos.titulo1 : estilos.titulo2}
        >
          <Partes partes={bloque.partes} />
        </Text>
      );
    case 'parrafo':
      return (
        <Text style={estilos.parrafo}>
          <Partes partes={bloque.partes} />
        </Text>
      );
    case 'lista':
      return (
        <View style={estilos.lista}>
          {conClaves(bloque.elementos).map(({ clave, valor }, numero) => (
            <Text key={clave} style={estilos.parrafo}>
              {bloque.ordenada ? `${numero + 1}. ` : '• '}
              <Partes partes={valor} />
            </Text>
          ))}
        </View>
      );
    default:
      return <View style={estilos.separador} />;
  }
}

export default function TextoAviso({ markdown }: { markdown: string }) {
  return (
    <View style={estilos.contenedor}>
      {conClaves(bloquesDeAviso(markdown)).map(({ clave, valor }) => (
        <BloqueAviso key={clave} bloque={valor} />
      ))}
    </View>
  );
}
