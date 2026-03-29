import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar: string;
  categoria: string;
  cupos_totales: number;
  cupos_disponibles: number;
  imagen_url: string;
  organizador: string;
  created_at: string;
}

export interface ApiResponse {
  ok: boolean;
  data?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEventos(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/eventos`);
  }

  getEventosPorCategoria(categoria: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/eventos?categoria=${categoria}`);
  }

  getEventoById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/eventos/${id}`);
  }

  inscribirse(datos: {
    evento_id: number;
    usuario_id: string;
    usuario_nombre: string;
    usuario_correo: string;
  }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/inscripciones`, datos);
  }

  getInscripciones(usuarioId: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/inscripciones/${usuarioId}`);
  }

  addFavorito(eventoId: number, usuarioId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/favoritos`, {
      evento_id: eventoId,
      usuario_id: usuarioId
    });
  }

  removeFavorito(eventoId: number, usuarioId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/favoritos/${eventoId}/${usuarioId}`);
  }

  getFavoritos(usuarioId: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/favoritos/${usuarioId}`);
  }
}