// Pruebas de los avisos de privacidad en la app (F-01 RF-25, CA-01; decisión A-5).
// El nombre de cada prueba es su criterio de aceptación.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  AVISO_INTEGRAL,
  AVISO_SIMPLIFICADO,
  avisoSimplificadoParaApp,
} from '../../src/compartido/acceso/avisos';
import { bloquesDeAviso, partesConNegritas } from '../../src/compartido/acceso/lectorAviso';

/** Lee un aviso del repo, sin comentarios <!-- --> y con saltos de línea \n. */
function leerAvisoDelRepo(nombre: string): string {
  return readFileSync(join(__dirname, '..', '..', 'docs', 'privacidad', nombre), 'utf8')
    .replace(/\r\n/g, '\n')
    .replace(/<!--[\s\S]*?-->\n?/g, '')
    .trim();
}

describe('A-5 · El texto de la app y el del repo no se separan', () => {
  test('A-5: el aviso simplificado de la app es igual a docs/privacidad/aviso-privacidad-simplificado.md', () => {
    expect(AVISO_SIMPLIFICADO.trim()).toBe(leerAvisoDelRepo('aviso-privacidad-simplificado.md'));
  });

  test('A-5: el aviso integral de la app es igual a docs/privacidad/aviso-privacidad-integral.md', () => {
    expect(AVISO_INTEGRAL.trim()).toBe(leerAvisoDelRepo('aviso-privacidad-integral.md'));
  });
});

describe('RF-25 · Recuadro del aviso simplificado', () => {
  test('RF-25: el recuadro muestra el aviso simplificado sin la línea "Aviso completo:" ni la dirección de GitHub', () => {
    const texto = avisoSimplificadoParaApp();
    expect(texto).not.toContain('Aviso completo:');
    expect(texto).not.toContain('https://github.com');
    expect(texto).toContain('**Tus derechos:**');
  });
});

describe('Lector corto de Markdown (A-5)', () => {
  test('separa las negritas del texto normal', () => {
    expect(partesConNegritas('**Para qué:** crear tu cuenta')).toEqual([
      { texto: 'Para qué:', negrita: true },
      { texto: ' crear tu cuenta', negrita: false },
    ]);
  });

  test('reconoce títulos, párrafos, listas, continuación de un elemento y separador', () => {
    const markdown = [
      '# Aviso',
      '',
      '## 1. Datos',
      'Primera línea',
      'segunda línea.',
      '- uno',
      '  sigue uno',
      '- **dos**',
      '',
      '1. primero',
      '2. segundo',
      '---',
      'Fin',
    ].join('\r\n');

    expect(bloquesDeAviso(markdown)).toEqual([
      { tipo: 'titulo', nivel: 1, partes: [{ texto: 'Aviso', negrita: false }] },
      { tipo: 'titulo', nivel: 2, partes: [{ texto: '1. Datos', negrita: false }] },
      { tipo: 'parrafo', partes: [{ texto: 'Primera línea segunda línea.', negrita: false }] },
      {
        tipo: 'lista',
        ordenada: false,
        elementos: [
          [{ texto: 'uno sigue uno', negrita: false }],
          [{ texto: 'dos', negrita: true }],
        ],
      },
      {
        tipo: 'lista',
        ordenada: true,
        elementos: [[{ texto: 'primero', negrita: false }], [{ texto: 'segundo', negrita: false }]],
      },
      { tipo: 'separador' },
      { tipo: 'parrafo', partes: [{ texto: 'Fin', negrita: false }] },
    ]);
  });

  test('el aviso integral se lee completo: 1 título principal, 11 secciones y 1 separador', () => {
    const bloques = bloquesDeAviso(AVISO_INTEGRAL);
    const titulos = bloques.filter((bloque) => bloque.tipo === 'titulo');
    expect(titulos).toHaveLength(12);
    expect(bloques.filter((bloque) => bloque.tipo === 'separador')).toHaveLength(1);
  });
});
