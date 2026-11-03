import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';

export interface CuentaApi { idCuenta: number; correo: string; alias: string; rol: string; estado: string; fechaRegistro: string; }
export interface UsuarioApi { idUsuario: number; alias: string; correo: string; estado: string; biografia: string | null; misionesPublicadas: number; }
export interface ZonaApi { idZona: number; nombre: string; descripcion: string | null; nivelPeligro: number; }
export interface EspecialidadApi { idEspecialidad: number; nombre: string; descripcion: string | null; }
export interface HabilidadApi { idCazarrecompensas: number; idEspecialidad: number; especialidad: string; nivel: number; }
export interface ReporteApi { idReporte: number; idCuentaReporta: number; aliasReporta: string; idCuentaReportada: number | null; aliasReportada: string | null; idContenido: string | null; idAdministrador: number | null; motivo: string; estado: string; fechaReporte: string; fechaResolucion: string | null; }
export interface CalificacionApi { idCalificacion: number; idMision: number; idCazarrecompensas: number; aliasCazarrecompensas: string; puntaje: number; comentario: string | null; fecha: string; }
export interface AuditoriaApi { idAuditoria: number; idCuenta: number; campoModificado: string; valorAnterior: string | null; valorNuevo: string | null; fechaCambio: string; usuarioBd: string; }
export interface MovimientoApiFull { idMovimiento: number; idBilletera: number; idMision: number | null; tipo: string; monto: number; fecha: string; descripcion: string | null; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}
  cuentas(rol?: string, estado?: string): Observable<CuentaApi[]> { let p = new HttpParams(); if (rol) p = p.set('rol', rol); if (estado) p = p.set('estado', estado); return this.http.get<CuentaApi[]>(`${API_URL}/cuentas`, { params: p }); }
  cuenta(id: number): Observable<CuentaApi> { return this.http.get<CuentaApi>(`${API_URL}/cuentas/${id}`); }
  cambiarCorreo(correo: string): Observable<CuentaApi> { return this.http.put<CuentaApi>(`${API_URL}/cuentas/yo/correo`, { correo }); }
  cambiarEstado(id: number, estado: string): Observable<CuentaApi> { return this.http.put<CuentaApi>(`${API_URL}/cuentas/${id}/estado`, { estado }); }
  miUsuario(): Observable<UsuarioApi> { return this.http.get<UsuarioApi>(`${API_URL}/usuarios/yo`); }
  actualizarUsuario(biografia: string): Observable<UsuarioApi> { return this.http.put<UsuarioApi>(`${API_URL}/usuarios/yo`, { biografia }); }
  miCazador(): Observable<any> { return this.http.get(`${API_URL}/cazarrecompensas/yo`); }
  actualizarCazador(datos: { idZona: number; biografia: string; disponibilidad: string }): Observable<any> { return this.http.put(`${API_URL}/cazarrecompensas/yo`, datos); }
  habilidades(idCazarrecompensas: number): Observable<HabilidadApi[]> { return this.http.get<HabilidadApi[]>(`${API_URL}/cazarrecompensas/${idCazarrecompensas}/especialidades`); }
  agregarHabilidad(idEspecialidad: number, nivel: number): Observable<HabilidadApi[]> { return this.http.post<HabilidadApi[]>(`${API_URL}/cazarrecompensas/yo/especialidades`, { idEspecialidad, nivel }); }
  quitarHabilidad(id: number): Observable<void> { return this.http.delete<void>(`${API_URL}/cazarrecompensas/yo/especialidades/${id}`); }
  crearZona(datos: { nombre: string; descripcion: string; nivelPeligro: number }): Observable<ZonaApi> { return this.http.post<ZonaApi>(`${API_URL}/zonas`, datos); }
  crearEspecialidad(datos: { nombre: string; descripcion: string }): Observable<EspecialidadApi> { return this.http.post<EspecialidadApi>(`${API_URL}/especialidades`, datos); }
  actualizarZona(id: number, datos: { nombre: string; descripcion: string; nivelPeligro: number }): Observable<ZonaApi> { return this.http.put<ZonaApi>(`${API_URL}/zonas/${id}`, datos); }
  actualizarEspecialidad(id: number, datos: { nombre: string; descripcion: string }): Observable<EspecialidadApi> { return this.http.put<EspecialidadApi>(`${API_URL}/especialidades/${id}`, datos); }
  zonas(): Observable<ZonaApi[]> { return this.http.get<ZonaApi[]>(`${API_URL}/zonas`); }
  especialidades(): Observable<EspecialidadApi[]> { return this.http.get<EspecialidadApi[]>(`${API_URL}/especialidades`); }
  misiones(estado?: string): Observable<any[]> { let p = new HttpParams(); if (estado) p = p.set('estado', estado); return this.http.get<any[]>(`${API_URL}/misiones`, { params: p }); }
  mias(): Observable<any[]> { return this.http.get<any[]>(`${API_URL}/misiones/mias`); }
  detalleMision(id: number): Observable<any> { return this.http.get(`${API_URL}/misiones/${id}`); }
  postulacionesMias(): Observable<any[]> { return this.http.get<any[]>(`${API_URL}/postulaciones/mias`); }
  postulacionesMision(id: number): Observable<any[]> { return this.http.get<any[]>(`${API_URL}/postulaciones`, { params: { idMision: id } }); }
  publicarMision(datos: { idZona: number; idEspecialidad: number; titulo: string; descripcion: string; monto: number }): Observable<any> { return this.http.post(`${API_URL}/misiones`, datos); }
  asignarMision(id: number, idCazarrecompensas: number): Observable<any> { return this.http.post(`${API_URL}/misiones/${id}/asignacion`, { idCazarrecompensas }); }
  iniciarMision(id: number): Observable<any> { return this.http.post(`${API_URL}/misiones/${id}/inicio`, {}); }
  cerrarMision(id: number): Observable<any> { return this.http.post(`${API_URL}/misiones/${id}/cierre`, {}); }
  cancelarMision(id: number): Observable<any> { return this.http.post(`${API_URL}/misiones/${id}/cancelacion`, {}); }
  reportes(estado?: string): Observable<ReporteApi[]> { let p = new HttpParams(); if (estado) p = p.set('estado', estado); return this.http.get<ReporteApi[]>(`${API_URL}/reportes`, { params: p }); }
  crearReporte(datos: { idCuentaReportada?: number; idContenido?: string; motivo: string }): Observable<ReporteApi> { return this.http.post<ReporteApi>(`${API_URL}/reportes`, datos); }
  resolverReporte(id: number, estado: string, suspender: boolean): Observable<ReporteApi> { return this.http.post<ReporteApi>(`${API_URL}/reportes/${id}/resolucion`, { estado, suspender }); }
  auditoria(idCuenta?: number): Observable<AuditoriaApi[]> { let p = new HttpParams(); if (idCuenta != null) p = p.set('idCuenta', idCuenta); return this.http.get<AuditoriaApi[]>(`${API_URL}/auditoria-cuentas`, { params: p }); }
  movimientos(idCuenta?: number, limite = 50): Observable<MovimientoApiFull[]> { let p = new HttpParams().set('limite', limite); if (idCuenta != null) p = p.set('idCuenta', idCuenta); return this.http.get<MovimientoApiFull[]>(`${API_URL}/movimientos`, { params: p }); }
  calificaciones(idCazarrecompensas?: number): Observable<CalificacionApi[]> { let p = new HttpParams(); if (idCazarrecompensas != null) p = p.set('idCazarrecompensas', idCazarrecompensas); return this.http.get<CalificacionApi[]>(`${API_URL}/calificaciones`, { params: p }); }
  calificar(idMision: number, puntaje: number, comentario: string): Observable<CalificacionApi[]> { return this.http.post<CalificacionApi[]>(`${API_URL}/calificaciones`, { idMision, puntaje, comentario }); }
}
