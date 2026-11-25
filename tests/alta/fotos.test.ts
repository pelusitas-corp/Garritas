// Pruebas de la parte pura de las fotos (F-02 RN-05, AL-3, AL-6; CA-03, CA-07 a CA-09).
// El nombre de cada prueba es su criterio de aceptación.
import {
  LIMITE_FOTO_BYTES,
  LIMITE_MINIATURA_BYTES,
  PREFIJO_JPEG,
  agregarFoto,
  bytesDeBase64,
  comprimirHastaLimite,
  estadoCamara,
  fotosParaGuardar,
  puedeAgregarFoto,
  quitarFoto,
} from '../../src/albergue/alta/fotos';

/** Base64 "falso" que mide exactamente `bytes` bytes (4 letras = 3 bytes). */
function base64DeTamano(bytes: number): string {
  return 'A'.repeat(Math.ceil((bytes * 4) / 3));
}

const foto = (nombre: string) => ({ datos: `${PREFIJO_JPEG}${nombre}`, miniatura: nombre });

describe('D-36 · Tamaño real del base64', () => {
  test('bytesDeBase64 mide los bytes reales sin el prefijo ni el relleno', () => {
    expect(bytesDeBase64('QUJD')).toBe(3); // "ABC"
    expect(bytesDeBase64('QUI=')).toBe(2); // "AB"
    expect(bytesDeBase64('QQ==')).toBe(1); // "A"
    expect(bytesDeBase64(`${PREFIJO_JPEG}QUJD`)).toBe(3);
  });
});

describe('CA-03 · RF-13 válido: la foto se comprime a ≤ 300 KB (AL-6)', () => {
  test('RF-13 válido: usa la primera calidad que da ≤ 300 KB', async () => {
    const tamanos: Record<number, number> = { 0.8: 500 * 1024, 0.7: 350 * 1024, 0.6: 280 * 1024 };
    const calidadesUsadas: number[] = [];
    const resultado = await comprimirHastaLimite(async (calidad) => {
      calidadesUsadas.push(calidad);
      return base64DeTamano(tamanos[calidad] ?? 100);
    }, LIMITE_FOTO_BYTES);

    expect(calidadesUsadas).toEqual([0.8, 0.7, 0.6]);
    expect(resultado && bytesDeBase64(resultado)).toBeLessThanOrEqual(LIMITE_FOTO_BYTES);
  });

  test('D-36: la miniatura queda en 30 KB o menos', async () => {
    const resultado = await comprimirHastaLimite(
      async (calidad) => base64DeTamano(calidad >= 0.5 ? 45 * 1024 : 25 * 1024),
      LIMITE_MINIATURA_BYTES,
    );
    expect(resultado && bytesDeBase64(resultado)).toBeLessThanOrEqual(30 * 1024);
  });

  test('AL-6 · A7: si ninguna calidad da ≤ 300 KB la foto no se agrega', async () => {
    const resultado = await comprimirHastaLimite(
      async () => base64DeTamano(400 * 1024),
      LIMITE_FOTO_BYTES,
    );
    expect(resultado).toBeNull();
  });
});

describe('CA-09 · Máximo 3 fotos (AL-3) y RN-05', () => {
  test('AL-3: con 3 fotos "Añadir una foto" no responde y no se agrega otra', () => {
    const tres = [foto('a'), foto('b'), foto('c')];
    expect(puedeAgregarFoto(tres)).toBe(false);
    expect(agregarFoto(tres, foto('d'))).toHaveLength(3);
    expect(puedeAgregarFoto(tres.slice(0, 2))).toBe(true);
  });

  test('RN-05: la primera foto que se añadió es la orden 0', () => {
    const fotos = agregarFoto(agregarFoto([], foto('primera')), foto('segunda'));
    expect(fotosParaGuardar(fotos)).toEqual([
      { datos: `${PREFIJO_JPEG}primera`, orden: 0 },
      { datos: `${PREFIJO_JPEG}segunda`, orden: 1 },
    ]);
  });

  test('CA-09: al quitar una foto con ✕ las demás se recorren y la primera sigue con orden 0', () => {
    const sinLaPrimera = quitarFoto([foto('a'), foto('b'), foto('c')], 0);
    expect(fotosParaGuardar(sinLaPrimera).map(({ orden }) => orden)).toEqual([0, 1]);
    expect(fotosParaGuardar(sinLaPrimera)[0].datos).toBe(`${PREFIJO_JPEG}b`);
    expect(puedeAgregarFoto(sinLaPrimera)).toBe(true);
  });
});

describe('CA-07 y CA-08 · RI-02 permiso de cámara', () => {
  test('RI-02 válido: con el permiso concedido "Tomar foto" abre la cámara', () => {
    expect(estadoCamara({ granted: true, canAskAgain: true })).toBe('concedida');
  });

  test('RI-02: si todavía se puede preguntar, se pide el permiso', () => {
    expect(estadoCamara({ granted: false, canAskAgain: true })).toBe('preguntar');
  });

  test('RI-02 no válido: negado sin poder volver a preguntar desactiva "Tomar foto"', () => {
    expect(estadoCamara({ granted: false, canAskAgain: false })).toBe('negada');
  });
});
