import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../service/api.service';

interface AuditEvent {
  timestamp: number;
  time: string;
  type: string;
  operator: string;
  action: string;
  reference: string;
  detail: string;
  tone: 'cyan' | 'pink' | 'amber';
}
interface AuditMetric { label: string; value: string; note: string; }

@Component({ selector: 'app-bitacora', standalone: false, styleUrl: './bitacora.component.css', templateUrl: './bitacora.component.html' })
export class BitacoraComponent implements OnInit {
  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}
  @Input() query = '';
  type = 'TODOS';
  readonly filters = ['TODOS', 'PAGO', 'MISIÓN', 'CUENTA', 'REPORTE', 'MOVIMIENTO'];
  metrics: AuditMetric[] = [];
  events: AuditEvent[] = [];
  cargando = true;
  error = '';
  fuentesConError: string[] = [];

  ngOnInit(): void { this.cargar(); }

  private cargar(): void {
    this.cargando = true;
    this.error = '';
    this.fuentesConError = [];
    forkJoin({
      auditoria: this.api.auditoria().pipe(catchError(() => { this.fuentesConError.push('auditoría'); return of([]); })),
      movimientos: this.api.movimientos(undefined, 500).pipe(catchError(() => { this.fuentesConError.push('movimientos'); return of([]); })),
      reportes: this.api.reportes().pipe(catchError(() => { this.fuentesConError.push('reportes'); return of([]); })),
      misiones: this.api.misiones().pipe(catchError(() => { this.fuentesConError.push('misiones'); return of([]); })),
    }).subscribe({
      next: ({ auditoria, movimientos, reportes, misiones }) => {
      const eventosCuenta: AuditEvent[] = auditoria.map((a) => this.evento(a.fechaCambio, 'CUENTA', a.usuarioBd, `${a.campoModificado} actualizado`, `CUENTA-${a.idCuenta}`, `${a.valorAnterior ?? '—'} → ${a.valorNuevo ?? '—'}`, 'pink'));
      const eventosMovimiento: AuditEvent[] = movimientos.map((m) => {
        const tipo = m.tipo === 'PAGO' || m.tipo === 'COBRO' ? 'PAGO' : m.tipo === 'RETENCION' ? 'MISIÓN' : 'MOVIMIENTO';
        return this.evento(m.fecha, tipo, `BILLETERA-${m.idBilletera}`, m.descripcion ?? m.tipo, m.idMision == null ? `MOV-${m.idMovimiento}` : `MISIÓN-${m.idMision}`, `${m.tipo} · ${Number(m.monto).toLocaleString('es-CO')} CR`, tipo === 'MOVIMIENTO' ? 'amber' : 'cyan');
      });
      const eventosReporte: AuditEvent[] = reportes.map((r) => this.evento(r.fechaResolucion ?? r.fechaReporte, 'REPORTE', r.aliasReporta, `Reporte ${r.estado.toLowerCase()}: ${r.motivo}`, `RPT-${r.idReporte}`, r.aliasReportada ?? r.idContenido ?? `CUENTA-${r.idCuentaReportada ?? '—'}`, r.estado === 'PENDIENTE' ? 'pink' : 'amber'));
      const eventosMision: AuditEvent[] = misiones.map((m) => this.evento(m.fechaPublicacion, 'MISIÓN', m.aliasUsuario, `Misión ${m.estado.toLowerCase()}: ${m.titulo}`, `MISIÓN-${m.idMision}`, `${m.zona} · ${Number(m.montoRecompensa).toLocaleString('es-CO')} CR`, 'cyan'));
      this.events = [...eventosCuenta, ...eventosMovimiento, ...eventosReporte, ...eventosMision].sort((a, b) => b.timestamp - a.timestamp);
      this.metrics = [
        { label: 'EVENTOS VISIBLES', value: String(this.events.length), note: 'Auditoría, operaciones y reportes' },
        { label: 'MOVIMIENTOS DE CRÉDITO', value: String(movimientos.length), note: 'Hasta 500 registros recientes' },
        { label: 'REPORTES PENDIENTES', value: String(reportes.filter((r) => r.estado === 'PENDIENTE').length), note: 'Estado actual de moderación' },
      ];
      this.cargando = false;
      if (!auditoria.length && !movimientos.length && !reportes.length && !misiones.length) this.error = this.fuentesConError.length
        ? 'No se pudieron cargar los registros. Revisa la conexión y los permisos de administrador.'
        : 'Todavía no hay eventos registrados.';
      this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'No se pudieron cargar los registros. Revisa la conexión con el backend.';
        this.cargando = false;
        this.cdr.markForCheck();
      },
    });
  }

  get visible(): AuditEvent[] {
    const q = this.query.toLocaleLowerCase();
    return this.events.filter((e) => (this.type === 'TODOS' || e.type === this.type) && `${e.operator} ${e.action} ${e.reference} ${e.detail}`.toLocaleLowerCase().includes(q));
  }
  setType(type: string): void { this.type = type; }
  private evento(fecha: string, type: string, operator: string, action: string, reference: string, detail: string, tone: AuditEvent['tone']): AuditEvent {
    const timestamp = new Date(fecha).getTime();
    return { timestamp, time: Number.isFinite(timestamp) ? new Date(timestamp).toLocaleString('es-CO') : '—', type, operator: operator || '—', action, reference, detail, tone };
  }
}
