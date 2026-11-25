/**
 * Lector CORTO de Markdown para los avisos de privacidad (F-01, A-5).
 *
 * Analogía: separa el aviso en "piezas de Lego" (títulos, párrafos, listas
 * y separadores) para que la pantalla dibuje cada una con su estilo. Solo
 * entiende lo que usan nuestros dos avisos:
 * - `# Título` y `## Título`;
 * - párrafos (líneas seguidas se unen con un espacio);
 * - listas con `- ` o con `1. ` (una línea con sangría continúa el elemento);
 * - el separador `---`;
 * - **negritas** dentro de cualquier texto.
 *
 * Función pura: se prueba con Jest (tests/acceso/avisos.test.ts).
 */

/** Un pedazo de texto, en negritas o normal. */
export interface Parte {
  texto: string;
  negrita: boolean;
}

/** Una pieza del aviso. */
export type Bloque =
  | { tipo: 'titulo'; nivel: 1 | 2; partes: Parte[] }
  | { tipo: 'parrafo'; partes: Parte[] }
  | { tipo: 'lista'; ordenada: boolean; elementos: Parte[][] }
  | { tipo: 'separador' };

/**
 * Recibe una línea de texto. Devuelve sus partes, separando lo que está
 * entre `**` (negritas). Ej.: `"**Hola** mundo"` → Hola (negrita), " mundo".
 */
export function partesConNegritas(texto: string): Parte[] {
  return texto
    .split('**')
    .map((pedazo, indice) => ({ texto: pedazo, negrita: indice % 2 === 1 }))
    .filter((parte) => parte.texto.length > 0);
}

/** Elemento de una lista: guarda el texto crudo hasta terminar la lista. */
interface ListaEnCurso {
  ordenada: boolean;
  elementos: string[];
}

const TITULO = /^(#{1,2}) (.*)$/;
const ELEMENTO_SIN_ORDEN = /^- (.*)$/;
const ELEMENTO_ORDENADO = /^\d+\. (.*)$/;
const CONTINUACION = /^\s+(\S.*)$/;

/**
 * Recibe el texto Markdown de un aviso. Devuelve la lista de bloques en
 * orden. Los saltos de línea de Windows (`\r\n`) se aceptan.
 */
export function bloquesDeAviso(markdown: string): Bloque[] {
  const bloques: Bloque[] = [];
  let parrafo: string[] = [];
  let lista: ListaEnCurso | null = null;

  const cerrarParrafo = () => {
    if (parrafo.length > 0) {
      bloques.push({ tipo: 'parrafo', partes: partesConNegritas(parrafo.join(' ')) });
      parrafo = [];
    }
  };
  const cerrarLista = () => {
    if (lista) {
      bloques.push({
        tipo: 'lista',
        ordenada: lista.ordenada,
        elementos: lista.elementos.map(partesConNegritas),
      });
      lista = null;
    }
  };
  const agregarElemento = (ordenada: boolean, texto: string) => {
    cerrarParrafo();
    if (lista && lista.ordenada !== ordenada) {
      cerrarLista();
    }
    if (!lista) {
      lista = { ordenada, elementos: [] };
    }
    lista.elementos.push(texto);
  };

  markdown.split(/\r?\n/).forEach((linea) => {
    const titulo = TITULO.exec(linea);
    const sinOrden = ELEMENTO_SIN_ORDEN.exec(linea);
    const ordenado = ELEMENTO_ORDENADO.exec(linea);
    const continuacion = CONTINUACION.exec(linea);

    if (linea.trim() === '') {
      cerrarParrafo();
      cerrarLista();
    } else if (linea.trim() === '---') {
      cerrarParrafo();
      cerrarLista();
      bloques.push({ tipo: 'separador' });
    } else if (titulo) {
      cerrarParrafo();
      cerrarLista();
      bloques.push({
        tipo: 'titulo',
        nivel: titulo[1].length === 1 ? 1 : 2,
        partes: partesConNegritas(titulo[2]),
      });
    } else if (sinOrden) {
      agregarElemento(false, sinOrden[1]);
    } else if (ordenado) {
      agregarElemento(true, ordenado[1]);
    } else if (continuacion && lista) {
      const { elementos }: ListaEnCurso = lista;
      elementos[elementos.length - 1] += ` ${continuacion[1]}`;
    } else {
      cerrarLista();
      parrafo.push(linea.trim());
    }
  });
  cerrarParrafo();
  cerrarLista();
  return bloques;
}
