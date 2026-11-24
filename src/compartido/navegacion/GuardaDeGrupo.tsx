/**
 * Portero de cada ala (specs/02-navegacion.md §6).
 *
 * Cada `_layout.tsx` de grupo envuelve su navegación con este componente.
 * Pregunta a `decidirAcceso()` qué hacer y lo aplica:
 * - esperar   → pantalla de carga (nunca se ve la pantalla equivocada);
 * - redirigir → `<Redirect>` de Expo Router (reemplaza, no deja "atrás");
 * - bloquear  → mensaje en lugar de la pantalla (G-3, G-4, G-4b);
 * - mostrar   → la navegación del grupo (children).
 */
import { Redirect, router, useSegments } from 'expo-router';
import type { ReactNode } from 'react';

import EstadoPantalla from '../EstadoPantalla';
import MENSAJES from '../mensajes';
import { decidirAcceso } from './guardas';
import type { EstadoSesion, Grupo } from './guardas';
import { inicioDelRol } from './inicioDelRol';
import { useSesion } from './useSesion';

/**
 * Texto del botón de G-4b. La spec dice "ofrece reintentar", pero no fija
 * el texto. [PENDIENTE: confirmar con la PO; mientras tanto "Reintentar".]
 */
const TEXTO_REINTENTAR = 'Reintentar';

interface Props {
  grupo: Grupo;
  children: ReactNode;
}

/** Botón "Ir a mi inicio" (G-3, N-7): lleva al inicio del rol de quien entró. */
function irAMiInicio(sesion: EstadoSesion) {
  if (sesion.tipo === 'con-rol') {
    router.replace(inicioDelRol(sesion.rol, sesion.cuestionarioCompleto));
  }
}

export default function GuardaDeGrupo({ grupo, children }: Props) {
  const { sesion, recargar, cerrarSesion } = useSesion();
  const segmentos = useSegments();
  const decision = decidirAcceso(grupo, sesion, segmentos);

  switch (decision.accion) {
    case 'esperar':
      return <EstadoPantalla estado="cargando" />;
    case 'redirigir':
      return <Redirect href={decision.destino} />;
    case 'bloquear':
      if (decision.motivo === 'rol-equivocado') {
        return (
          <EstadoPantalla
            estado="sin-permiso"
            boton={{ texto: 'Ir a mi inicio', alPresionar: () => irAMiInicio(sesion) }}
          />
        );
      }
      if (decision.motivo === 'sin-permiso') {
        return (
          <EstadoPantalla
            estado="sin-permiso"
            boton={{ texto: 'Cerrar sesión', alPresionar: () => cerrarSesion() }}
          />
        );
      }
      return (
        <EstadoPantalla
          estado="error"
          mensaje={MENSAJES.ERROR_CONEXION}
          boton={{ texto: TEXTO_REINTENTAR, alPresionar: recargar }}
        />
      );
    default:
      return children;
  }
}
