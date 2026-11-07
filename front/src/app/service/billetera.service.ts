import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_URL } from '../config/api';

/** BilleteraDto del back. */
export interface Billetera {
  idBilletera: number;
  idCuenta: number;
  saldoDisponible: number;
  saldoRetenido: number;
  fechaActualizacion: string;
}

export type TipoMovimiento = 'RECARGA' | 'RETENCION' | 'PAGO' | 'COBRO' | 'REEMBOLSO';

/** MovimientoDto del back. El monto siempre llega positivo; el signo depende del tipo. */
export interface MovimientoApi {
  idMovimiento: number;
  idBilletera: number;
  idMision: number | null;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string;
  descripcion: string | null;
}

@Injectable({ providedIn: 'root' })
export class BilleteraService {
  constructor(private http: HttpClient) {}

  /** Billetera de la cuenta autenticada. */
  miBilletera(): Observable<Billetera> {
    return this.http.get<Billetera>(`${API_URL}/billeteras/yo`);
  }

  /** Recarga simulada; el back responde con la billetera ya actualizada. */
  recargar(monto: number): Observable<Billetera> {
    return this.http.post<Billetera>(`${API_URL}/billeteras/yo/recargas`, { monto });
  }

  /** Movimientos de la propia billetera, los más recientes primero. */
  movimientos(limite = 50): Observable<MovimientoApi[]> {
    return this.http.get<MovimientoApi[]>(`${API_URL}/movimientos`, { params: { limite } });
  }

  /** Cantidad de misiones propias que tienen créditos en custodia. */
  misionesActivas(): Observable<number> {
    return this.http
      .get<{ estado: string }[]>(`${API_URL}/misiones/mias`)
      .pipe(map((l) => l.filter((m) => m.estado === 'ASIGNADA' || m.estado === 'EN_CURSO').length));
  }
}
