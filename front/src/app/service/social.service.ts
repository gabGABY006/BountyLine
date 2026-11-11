import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';

export interface ComentarioApi {
  idComentario: string;
  idCuenta: number;
  alias: string;
  texto: string;
  fecha: string;
  estadoModeracion: string;
}

export interface ReaccionesApi {
  meGusta: number;
  fuego: number;
  alerta: number;
}

export interface PublicacionApi {
  id: string;
  idCuenta: number;
  alias: string;
  rol: string;
  texto: string;
  etiquetas: string[];
  idZona: number | null;
  zona: string | null;
  idMision: number | null;
  reacciones: ReaccionesApi;
  miReaccion: string | null;
  comentarios: ComentarioApi[];
  estadoModeracion: string;
  fechaPublicacion: string;
  fechaEdicion: string | null;
}

export interface NuevaPublicacion {
  texto: string;
  etiquetas?: string[];
  idZona?: number | null;
  idMision?: number | null;
}

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
export class SocialService {

  constructor(private http: HttpClient) {}

  listarPublicaciones(
    pagina = 0,
    tamano = 20,
    filtros?: {
      etiqueta?: string;
      idZona?: number;
      idCuenta?: number;
      idMision?: number;
      texto?: string;
    }
  ): Observable<PublicacionApi[]> {

    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamano', tamano);

    if (filtros?.etiqueta) {
      params = params.set('etiqueta', filtros.etiqueta);
    }

    if (filtros?.idZona != null) {
      params = params.set('idZona', filtros.idZona);
    }

    if (filtros?.idCuenta != null) {
      params = params.set('idCuenta', filtros.idCuenta);
    }

    if (filtros?.idMision != null) {
      params = params.set('idMision', filtros.idMision);
    }

    if (filtros?.texto) {
      params = params.set('texto', filtros.texto);
    }

    return this.http.get<PublicacionApi[]>(
      `${API_URL}/publicaciones`,
      { params }
    );
  }

  obtenerPublicacion(id: string): Observable<PublicacionApi> {
    return this.http.get<PublicacionApi>(
      `${API_URL}/publicaciones/${id}`
    );
  }

  crearPublicacion(datos: NuevaPublicacion): Observable<PublicacionApi> {
    return this.http.post<PublicacionApi>(
      `${API_URL}/publicaciones`,
      datos
    );
  }

  editarPublicacion(
    id: string,
    texto: string,
    etiquetas: string[] = []
  ): Observable<PublicacionApi> {

    return this.http.put<PublicacionApi>(
      `${API_URL}/publicaciones/${id}`,
      {
        texto,
        etiquetas
      }
    );
  }

  eliminarPublicacion(id: string): Observable<void> {
    return this.http.delete<void>(
      `${API_URL}/publicaciones/${id}`
    );
  }

  comentar(
    idPublicacion: string,
    texto: string
  ): Observable<PublicacionApi> {

    return this.http.post<PublicacionApi>(
      `${API_URL}/publicaciones/${idPublicacion}/comentarios`,
      { texto }
    );
  }

  reaccionar(
    idPublicacion: string,
    tipo: 'me_gusta' | 'fuego' | 'alerta'
  ): Observable<PublicacionApi> {

    return this.http.post<PublicacionApi>(
      `${API_URL}/publicaciones/${idPublicacion}/reacciones`,
      { tipo }
    );
  }

  moderarPublicacion(
    id: string,
    estado: 'VISIBLE' | 'OCULTA' | 'OCULTO'
  ): Observable<PublicacionApi> {

    return this.http.put<PublicacionApi>(
      `${API_URL}/publicaciones/${id}/moderacion`,
      { estado }
    );
  }

  moderarComentario(
    idComentario: string,
    estado: 'VISIBLE' | 'OCULTA' | 'OCULTO'
  ): Observable<void> {

    return this.http.put<void>(
      `${API_URL}/publicaciones/comentarios/${idComentario}/moderacion`,
      { estado }
    );
  }

  listarChat(idMision: number): Observable<MensajeChatApi[]> {
    return this.http.get<MensajeChatApi[]>(`${API_URL}/misiones/${idMision}/chat`);
  }

  enviarMensaje(idMision: number, texto: string): Observable<MensajeChatApi> {
    return this.http.post<MensajeChatApi>(`${API_URL}/misiones/${idMision}/chat`, { texto });
  }

  marcarChatLeido(idMision: number): Observable<{ marcados: number }> {
    return this.http.put<{ marcados: number }>(`${API_URL}/misiones/${idMision}/chat/leidos`, {});
  }
}
