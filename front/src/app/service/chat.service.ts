import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';

export interface MensajeChatApi {
  id: string;
  idMision: number;
  idEmisor: number;
  aliasEmisor: string;
  rolEmisor: string;
  texto: string;
  fecha: string;
  leido: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) {}

  listar(idMision: number): Observable<MensajeChatApi[]> {
    return this.http.get<MensajeChatApi[]>(
      `${API_URL}/misiones/${idMision}/chat`
    );
  }

  enviar(
    idMision: number,
    texto: string
  ): Observable<MensajeChatApi> {

    return this.http.post<MensajeChatApi>(
      `${API_URL}/misiones/${idMision}/chat`,
      { texto }
    );
  }

  sinLeer(idMision: number): Observable<{ sinLeer: number }> {
    return this.http.get<{ sinLeer: number }>(
      `${API_URL}/misiones/${idMision}/chat/sin-leer`
    );
  }

  marcarLeidos(idMision: number): Observable<{ marcados: number }> {
    return this.http.put<{ marcados: number }>(
      `${API_URL}/misiones/${idMision}/chat/leidos`,
      {}
    );
  }
}