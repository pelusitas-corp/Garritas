/**
 * Aceptación del aviso de privacidad, guardada EN MEMORIA (F-01 §3 paso 3,
 * arquitectura §4).
 *
 * La cuenta todavía no existe cuando el adoptante presiona "Continuar", así
 * que la fecha se guarda aquí y se escribe en `usuarios/{uid}` al crear la
 * cuenta (RF-23). Si la app se cierra, se pierde y hay que aceptar otra vez.
 *
 * Analogía: es el boleto que te dan en la entrada del aviso; sin él, la
 * ventanilla de registro no te atiende (RN-01).
 */

let fechaAceptacion: Date | null = null;

/** Recibe la fecha en que se presionó "Continuar" con la casilla marcada (CA-01). */
export function guardarAceptacion(fecha: Date): void {
  fechaAceptacion = fecha;
}

/** Devuelve la fecha de aceptación, o `null` si todavía no se acepta (RN-01). */
export function leerAceptacion(): Date | null {
  return fechaAceptacion;
}

/** Borra la aceptación de memoria. Se llama después de crear la cuenta (P6). */
export function olvidarAceptacion(): void {
  fechaAceptacion = null;
}
