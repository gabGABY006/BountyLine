import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';

export interface MisionApi {
  idMision: number;
  titulo: string;
  descripcion: string;
  montoRecompensa: number;
  estado: string;
  fechaPublicacion: string;
  idUsuario: number;
  aliasUsuario: string;
  idZona: number;
  zona: string;
  idEspecialidad: number;
  especialidad: string;
  idCazarrecompensas: number | null;
  aliasCazarrecompensas: string | null;
  postulaciones: number;
}

export interface CazadorApi {
  idCazarrecompensas: number;
  alias: string;
  estadoCuenta: string;
  biografia: string | null;
  disponibilidad: string;
  reputacion: number | null;
  idZona: number;
  zona: string;
  misionesCompletadas: number;
  especialidades: string | null;
}

export interface SugerenciaApi {
  idCazarrecompensas: number;
  alias: string;
  zona: string;
  reputacion: number | null;
  misionesCompletadas: number;
  puntaje: number;
}

export interface PostulacionApi {
  idMision: number;
  idCazarrecompensas: number;
  alias: string;
  fechaPostulacion: string;
  mensaje: string | null;
  estadoPostulacion: string;
  puntaje: number | null;
}

@Injectable({ providedIn: 'root' })
export class MisionService {
  constructor(private http: HttpClient) {}

  listarPublicadas(): Observable<MisionApi[]> {
    return this.http.get<MisionApi[]>(`${API_URL}/misiones`, { params: { estado: 'PUBLICADA' } });
  }

  sugerencias(id: number): Observable<SugerenciaApi[]> {
    return this.http.get<SugerenciaApi[]>(`${API_URL}/misiones/${id}/sugerencias`);
  }

  listarCazadores(idZona?: number, disponibilidad = 'DISPONIBLE'): Observable<CazadorApi[]> {
    let params = new HttpParams().set('disponibilidad', disponibilidad);
    if (idZona != null) params = params.set('idZona', idZona);
    return this.http.get<CazadorApi[]>(`${API_URL}/cazarrecompensas`, { params });
  }

  buscarCazador(idCazarrecompensas: number): Observable<CazadorApi> {
    return this.http.get<CazadorApi>(`${API_URL}/cazarrecompensas/${idCazarrecompensas}`);
  }

  postular(idMision: number, mensaje = ''): Observable<PostulacionApi[]> {
    return this.http.post<PostulacionApi[]>(`${API_URL}/postulaciones`, { idMision, mensaje });
  }
}
