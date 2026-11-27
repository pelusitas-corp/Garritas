// Prueba de accesibilidad de textos (spec F-12 T-1: AE-1, CA-01).
// Lee el código de todos los archivos `.ts` y `.tsx` de app/ y src/ (sin
// dibujar nada) y revisa cada `fontSize:`. Falla si un texto mide menos de
// 14 o si su tamaño no es un número ni una constante conocida.
// El nombre de cada prueba es su criterio de aceptación.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import { MEDIDAS_BOTON } from '../src/compartido/BotonPildora';
import { TAMANOS_TEXTO } from '../src/compartido/tema';

// Los íconos no se dibujan en esta prueba: se reemplazan por un "doble".
jest.mock('@expo/vector-icons', () => ({ MaterialCommunityIcons: () => null }));

const RAIZ = join(__dirname, '..');

/** Tamaños que no se escriben como número, sino con una constante. */
const CONSTANTES_CONOCIDAS: Readonly<Record<string, number>> = {
  // Todos los tamaños de `TAMANOS_TEXTO` (F-12 y los nuevos de F-13).
  ...Object.fromEntries(
    Object.entries(TAMANOS_TEXTO).map(([nombre, tamano]) => [`TAMANOS_TEXTO.${nombre}`, tamano]),
  ),
  'MEDIDAS_BOTON.normal.tamanoTexto': MEDIDAS_BOTON.normal.tamanoTexto,
  'MEDIDAS_BOTON.chico.tamanoTexto': MEDIDAS_BOTON.chico.tamanoTexto,
};

/** Un `fontSize:` encontrado en el código. */
interface Hallazgo {
  linea: number;
  valor: string;
  /** El tamaño en px, o `null` si no se sabe de dónde sale. */
  tamano: number | null;
}

/** Recibe el valor escrito después de `fontSize:`. Devuelve su tamaño en px o `null`. */
function tamanoDe(valor: string): number | null {
  if (/^\d+(\.\d+)?$/.test(valor)) {
    return Number(valor);
  }
  return CONSTANTES_CONOCIDAS[valor] ?? null;
}

/** Recibe el código de un archivo. Devuelve cada `fontSize:` con su línea y su tamaño. */
function buscarFontSize(codigo: string): Hallazgo[] {
  return [...codigo.matchAll(/fontSize:\s*([^,}\n]+)/g)].map((coincidencia) => {
    const valor = coincidencia[1].trim();
    const linea = codigo.slice(0, coincidencia.index).split('\n').length;
    return { linea, valor, tamano: tamanoDe(valor) };
  });
}

/** Recibe el código. Devuelve los `fontSize` que miden menos de 14 o no se sabe cuánto miden. */
function fontSizeChicos(codigo: string): Hallazgo[] {
  return buscarFontSize(codigo).filter(
    (hallazgo) => hallazgo.tamano === null || hallazgo.tamano < TAMANOS_TEXTO.minimo,
  );
}

/** Recibe una carpeta. Devuelve todos sus archivos `.ts` y `.tsx`, también los de sus subcarpetas. */
function archivosDeCodigo(carpeta: string): string[] {
  return readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(carpeta, entrada.name);
    if (entrada.isDirectory()) {
      return archivosDeCodigo(ruta);
    }
    return /\.tsx?$/.test(entrada.name) ? [ruta] : [];
  });
}

describe('F-12 · T-1 · Ningún texto diminuto (AE-1, CA-01)', () => {
  test('F-12 válido: ningún fontSize de app/ y src/ es menor que 14', () => {
    const archivos = [
      ...archivosDeCodigo(join(RAIZ, 'app')),
      ...archivosDeCodigo(join(RAIZ, 'src')),
    ];
    const problemas = archivos.flatMap((archivo) =>
      fontSizeChicos(readFileSync(archivo, 'utf8')).map(
        ({ linea, valor }) =>
          `${relative(RAIZ, archivo).replace(/\\/g, '/')}:${linea} fontSize: ${valor}`,
      ),
    );
    expect(archivos.length).toBeGreaterThan(0);
    expect(problemas).toEqual([]);
  });

  test('F-12 no válido: la revisión detecta un fontSize de 13', () => {
    const codigo = [
      'const estilos = StyleSheet.create({',
      '  apoyo: { fontSize: 13 },',
      '  dato: { fontSize: TAMANOS_TEXTO.dato },',
      '  raro: { fontSize: tamanoInventado },',
      '});',
    ].join('\n');
    expect(fontSizeChicos(codigo)).toEqual([
      { linea: 2, valor: '13', tamano: 13 },
      { linea: 4, valor: 'tamanoInventado', tamano: null },
    ]);
  });
});
