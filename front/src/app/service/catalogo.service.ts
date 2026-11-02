import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_URL } from '../config/api';

export interface Catalogo {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  constructor(private http: HttpClient) {}

  zonas(): Observable<Catalogo[]> {
    return this.http
      .get<{ idZona: number; nombre: string }[]>(`${API_URL}/zonas`)
      .pipe(map((lista) => lista.map((z) => ({ id: z.idZona, nombre: z.nombre }))));
  }

  especialidades(): Observable<Catalogo[]> {
    return this.http
      .get<{ idEspecialidad: number; nombre: string }[]>(`${API_URL}/especialidades`)
      .pipe(map((lista) => lista.map((e) => ({ id: e.idEspecialidad, nombre: e.nombre }))));
  }
}