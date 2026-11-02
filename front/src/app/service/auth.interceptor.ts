import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../config/api';
import { AuthService } from './auth.service';

/**
 * Agrega el token JWT a las peticiones al back.
 * Si el back responde 401 (token vencido o inválido) se cierra la sesión.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;

  const peticion =
    token && req.url.startsWith(API_URL)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        auth.cerrarSesion();
        void router.navigate(['/inicio']);
      }
      return throwError(() => error);
    }),
  );
};
