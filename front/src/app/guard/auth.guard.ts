import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Rol } from '../service/auth.service';

const ROL_POR_MODO: Record<string, Rol> = {
  ADMIN: 'ADMINISTRADOR',
  NORMAL: 'USUARIO',
  CAZARRECOMPENSAS: 'CAZARRECOMPENSAS',
};

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const sesion = auth.sesion;

  if (!sesion) {
    return router.createUrlTree(['/inicio']);
  }

  const rolRequerido = ROL_POR_MODO[route.data['modo']];
  if (rolRequerido && sesion.rol !== rolRequerido) {
    return router.createUrlTree([auth.rutaInicio(sesion.rol)]);
  }
  return true;
};