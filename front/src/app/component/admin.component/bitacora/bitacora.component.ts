import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
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
  readonly filters = ['TODOS', 'PAGO', 'MISIÓN', 'CUENTA', 'REPORTE'];
  metrics: AuditMetric[] = [];
  events: AuditEvent[] = [];
  cargando = true;
  error = '';

  ngOnInit(): void { this.cargar(); }

  private cargar(): void {
    this.cargando = true;
    this.error = '';
    this.api.bitacora(500).subscribe({
      next: (registros) => {
        this.events = registros.map((r) => this.evento(r.fecha, r.tipo === 'MISION' ? 'MISIÓN' : r.tipo, r.operador ?? '—', r.accion, r.referencia, r.detalle ?? '', r.tipo === 'CUENTA' ? 'pink' : r.tipo === 'REPORTE' ? 'amber' : 'cyan')).sort((a, b) => b.timestamp - a.timestamp);
        this.metrics = [
          { label: 'EVENTOS VISIBLES', value: String(this.events.length), note: 'Hasta 500 registros recientes' },
          { label: 'MOVIMIENTOS DE CRÉDITO', value: String(registros.filter((r) => r.tipo === 'PAGO').length), note: 'Pagos y movimientos de billetera' },
          { label: 'REPORTES', value: String(registros.filter((r) => r.tipo === 'REPORTE').length), note: 'Creados y resueltos' },
        ];
        this.cargando = false;
        if (!registros.length) this.error = 'Todavía no hay eventos registrados.';
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'No se pudieron cargar los registros. Revisa la conexión y los permisos de administrador.';
        this.events = [];
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
