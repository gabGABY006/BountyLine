import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api';

export type Rol = 'USUARIO' | 'CAZARRECOMPENSAS' | 'ADMINISTRADOR';

/** Respuesta de /api/auth/login y /api/auth/registro. */
export interface Sesion {
  token: string;
  tipo: string;
  expira: string;
  idCuenta: number;
  alias: string;
  rol: Rol;
}

export interface EspecialidadNivel {
  id: number;
  nivel: number;
}

export interface RegistroPeticion {
  correo: string;
  alias: string;
  contrasena: string;
  rol: 'USUARIO' | 'CAZARRECOMPENSAS';
  biografia?: string | null;
  idZona?: number | null;
  especialidades?: EspecialidadNivel[] | null;
}

const CLAVE = 'bountyline.sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(correo: string, contrasena: string): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${API_URL}/auth/login`, { correo, contrasena })
      .pipe(tap((s) => this.guardar(s)));
  }

  registrar(datos: RegistroPeticion): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${API_URL}/auth/registro`, datos)
      .pipe(tap((s) => this.guardar(s)));
  }

  cerrarSesion(): void {
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      /* almacenamiento no disponible */
    }
  }

  get sesion(): Sesion | null {
    try {
      const texto = localStorage.getItem(CLAVE);
      if (!texto) return null;
      const s = JSON.parse(texto) as Sesion;
      // Sesión vieja (sin token) o token vencido: hay que volver a iniciar sesión
      if (!s.token || new Date(s.expira).getTime() <= Date.now()) {
        this.cerrarSesion();
        return null;
      }
      return s;
    } catch {
      return null;
    }
  }

  /** Token JWT que se envía en el encabezado Authorization. */
  get token(): string | null {
    return this.sesion?.token ?? null;
  }

  get autenticado(): boolean {
    return this.sesion !== null;
  }

  rutaInicio(rol: Rol): string {
    switch (rol) {
      case 'ADMINISTRADOR':
        return '/admin/panel';
      case 'CAZARRECOMPENSAS':
        return '/cazarrecompensas/mercado';
      default:
        return '/usuario/misiones';
    }
  }

  mensajeDeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'No se pudo conectar con el servidor. ¿Está encendido el back?';
      }
      if (typeof err.error?.error === 'string') {
        return err.error.error;
      }
    }
    return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }

  private guardar(s: Sesion): void {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(s));
    } catch {
      /* almacenamiento no disponible */
    }
  }
}