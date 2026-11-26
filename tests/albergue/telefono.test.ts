// Pruebas del enlace para llamar al adoptante (spec F-12 T-10: AE-10;
// CA-09 y CA-10). La función es pura: no abre el marcador ni dibuja nada.
// El nombre de cada prueba es su criterio de aceptación.
import { enlaceTelefono } from '../../src/albergue/solicitud/telefono';

describe('F-12 · T-10 · CA-09 · Llamar al adoptante (AE-10, válido)', () => {
  test('F-12 válido: enlaceTelefono convierte "646 000 0001" en "tel:6460000001"', () => {
    expect(enlaceTelefono('646 000 0001')).toBe('tel:6460000001');
  });

  test('F-12 válido: enlaceTelefono deja igual el teléfono guardado "6460000001"', () => {
    expect(enlaceTelefono('6460000001')).toBe('tel:6460000001');
  });
});

describe('F-12 · T-10 · CA-10 · Llamar sin teléfono (AE-10, no válido)', () => {
  test('F-12 no válido: enlaceTelefono sin dígitos devuelve null', () => {
    expect(enlaceTelefono('')).toBeNull();
    expect(enlaceTelefono('sin teléfono')).toBeNull();
  });
});
