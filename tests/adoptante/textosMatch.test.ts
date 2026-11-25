// Pruebas de los textos armados de Match (spec F-06 T-1, §3.1).
// El nombre de cada prueba es su criterio.
import { textoParejaPerfecta, textoPorcentajeMatch } from '../../src/adoptante/match/textos';
import MENSAJES from '../../src/compartido/mensajes';

describe('Textos de Match (F-06 §3.1)', () => {
  test('RF-20 válido: el subtítulo dice "Wini y tú podrían ser la pareja perfecta."', () => {
    expect(textoParejaPerfecta('Wini')).toBe('Wini y tú podrían ser la pareja perfecta.');
  });

  test('RF-20 válido: el porcentaje se escribe "90%", sin espacio, como en Figma', () => {
    expect(textoPorcentajeMatch(90)).toBe('90%');
  });

  test('MS-1: el mensaje de la segunda solicitud es literal de la spec', () => {
    expect(MENSAJES.SOLICITUD_YA_ENVIADA).toBe(
      'Ya enviaste una solicitud para esta mascota. Revisa su estado en Mis solicitudes',
    );
  });
});
