import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import { BilleteraService, MovimientoApi } from '../../../service/billetera.service';
import { AuthService } from '../../../service/auth.service';

type Tono = 'cyan' | 'pink' | 'amber';
interface Resumen { titulo: string; valor: string; nota: string; icono: 'wallet' | 'target' | 'star'; tone: Tono; }
interface Pago { titulo: string; id: string; zona: string; monto: number; }
interface Calificacion { alias: string; estrellas: number; texto: string; tone: Tono; }
@Component({ selector: 'app-ganancias', standalone: false, styleUrl: './ganancias.component.css', templateUrl: './ganancias.component.html' })
export class GananciasComponent implements OnInit {
  readonly estrellas = [1, 2, 3, 4, 5];
  resumen: Resumen[] = [];
  pagos: Pago[] = [];
  calificaciones: Calificacion[] = [];
  constructor(private api: ApiService, private wallet: BilleteraService, private auth: AuthService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    const id = this.auth.sesion?.idCuenta;
    forkJoin({ movimientos: this.wallet.movimientos(100), misiones: this.api.mias(), calificaciones: this.api.calificaciones(id) }).subscribe({
      next: ({ movimientos, misiones, calificaciones }) => {
        const cobros = movimientos.filter((m: MovimientoApi) => m.tipo === 'COBRO');
        this.pagos = cobros.map((m) => { const mission = misiones.find((x) => x.idMision === m.idMision); return { titulo: mission?.titulo ?? m.descripcion ?? 'Pago de misión', id: m.idMision == null ? `MOV-${m.idMovimiento}` : `MISIÓN-${m.idMision}`, zona: mission?.zona ?? '—', monto: Number(m.monto) }; });
        const promedio = calificaciones.length ? calificaciones.reduce((s, c) => s + c.puntaje, 0) / calificaciones.length : 0;
        const cerradas = misiones.filter((m) => m.estado === 'CERRADA').length;
        const total = cobros.reduce((s, m) => s + Number(m.monto), 0);
        this.resumen = [
          { titulo: 'GANANCIAS REGISTRADAS', valor: `${total.toLocaleString('es-CO')} CR`, nota: 'Suma de los últimos 100 movimientos', icono: 'wallet', tone: 'cyan' },
          { titulo: 'MISIONES CERRADAS', valor: String(cerradas), nota: 'Según el historial de misiones', icono: 'target', tone: 'amber' },
          { titulo: 'REPUTACIÓN', valor: promedio.toFixed(1), nota: `${calificaciones.length} calificaciones`, icono: 'star', tone: 'pink' },
        ];
        this.calificaciones = calificaciones.map((c, i) => ({ alias: c.aliasCazarrecompensas, estrellas: c.puntaje, texto: c.comentario ?? 'Sin comentario.', tone: (['cyan', 'pink', 'amber'] as Tono[])[i % 3] }));
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck(),
    });
  }
  formatear(valor: number): string { return valor.toLocaleString('es-CO'); }
}
