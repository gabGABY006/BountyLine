import { Component, Input } from '@angular/core';

interface AuditEvent {
  time: string;
  type: string;
  operator: string;
  action: string;
  reference: string;
  detail: string;
  tone: 'cyan' | 'pink' | 'amber';
}

interface AuditMetric {
  label: string;
  value: string;
  note: string;
}

@Component({
  selector: 'app-bitacora',
  standalone: false,
  styleUrl: './bitacora.component.css',
  templateUrl: './bitacora.component.html',
})
export class BitacoraComponent {
  /** Texto de búsqueda (opcional): si tu topbar tiene buscador, pásalo con [query]="..." */
  @Input() query = '';

  type = 'TODOS';
  readonly filters: string[] = ['TODOS', 'PAGO', 'MISIÓN', 'CUENTA', 'REPORTE'];

  metrics: AuditMetric[] = [
    { label: 'EVENTOS HOY', value: '184', note: '+18 desde las 12:00' },
    { label: 'MOVIMIENTOS DE CRÉDITO', value: '62', note: 'Todos conciliados' },
    { label: 'ACCIONES ADMIN', value: '14', note: '2 requieren revisión' },
  ];

  events: AuditEvent[] = [
    { time: '14:32:08', type: 'PAGO', operator: 'KIRA_09', action: 'Pago liberado al cazarrecompensas VANTA_K', reference: 'BL-2014', detail: '5.900 CR', tone: 'cyan' },
    { time: '14:18:44', type: 'CUENTA', operator: 'ADMIN_CORE', action: 'Cuenta suspendida por revisión de seguridad', reference: 'NULL_SPECTRE', detail: 'RPT-2084', tone: 'pink' },
    { time: '13:56:12', type: 'MISIÓN', operator: 'AXIOM_47', action: 'Misión publicada y recompensa retenida', reference: 'BL-2048', detail: '12.800 CR', tone: 'amber' },
    { time: '12:41:03', type: 'CATÁLOGO', operator: 'ADMIN_CORE', action: 'Nueva zona habilitada para toda la red', reference: 'Zona libre', detail: 'Z-05', tone: 'cyan' },
    { time: '11:27:36', type: 'REEMBOLSO', operator: 'MARA_V', action: 'Misión cancelada y créditos devueltos', reference: 'BL-1982', detail: '4.500 CR', tone: 'amber' },
    { time: '10:09:51', type: 'REPORTE', operator: 'SENTINEL_AI', action: 'Reporte crítico escalado a moderación', reference: 'RPT-2079', detail: 'PRIORIDAD ALFA', tone: 'pink' },
  ];

  get visible(): AuditEvent[] {
    const q = this.query.toLowerCase();
    return this.events.filter(
      (e) =>
        (this.type === 'TODOS' || e.type === this.type) &&
        `${e.operator} ${e.action} ${e.reference}`.toLowerCase().includes(q),
    );
  }

  setType(type: string): void {
    this.type = type;
  }
}
