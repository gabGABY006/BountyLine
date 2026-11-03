import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService, ReporteApi } from '../../../service/api.service';

type Estado = 'PENDIENTE' | 'DESCARTADO' | 'RESUELTO';
type Tipo = 'POST' | 'USUARIO';
type Accion = 'NINGUNA' | 'SUSPENDER_USUARIO';

interface Reporte {
  id: string;
  tipo: Tipo;
  objetivo: string;
  motivo: string;
  reportadoPor: string;
  hace: string;
  estado: Estado;
  accion: Accion | null;
}

@Component({
  selector: 'app-reportes',
  standalone: false,
  styleUrl: './reportes.component.css',
  templateUrl: './reportes.component.html',
})
export class ReportesComponent implements OnInit {
  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}
  reportes: Reporte[] = [];
  private ids = new Map<string, number>();
  ngOnInit(): void { this.cargar(); }
  private cargar(): void { this.api.reportes().subscribe({ next: (xs) => { this.reportes = xs.map((x) => this.adaptar(x)); if (!this.reportes.some((r) => r.id === this.seleccionadoId)) this.seleccionadoId = this.reportes[0]?.id ?? ''; this.cdr.markForCheck(); }, error: () => { this.avisar('No se pudieron cargar los reportes.', 'error'); this.cdr.markForCheck(); } }); }
  private adaptar(x: ReporteApi): Reporte { const id = `RPT-${x.idReporte}`; this.ids.set(id, x.idReporte); return { id, tipo: x.idContenido ? 'POST' : 'USUARIO', objetivo: x.idContenido ?? x.aliasReportada ?? String(x.idCuentaReportada ?? ''), motivo: x.motivo, reportadoPor: x.aliasReporta, hace: this.hace(x.fechaReporte), estado: x.estado as Estado, accion: x.fechaResolucion ? (x.idCuentaReportada ? 'SUSPENDER_USUARIO' : 'NINGUNA') : null }; }
  private hace(fecha: string): string { const n = Math.max(0, Math.floor((Date.now() - new Date(fecha).getTime()) / 60000)); return n < 60 ? `${n} MIN` : `${Math.floor(n / 60)} H`; }

  filtrosEstado: { valor: 'TODOS' | Estado; texto: string }[] = [
    { valor: 'TODOS', texto: 'TODOS' },
    { valor: 'PENDIENTE', texto: 'PENDIENTE' },
    { valor: 'DESCARTADO', texto: 'DESCARTADOS' },
    { valor: 'RESUELTO', texto: 'RESUELTO' },
  ];

  readonly acciones: { valor: Accion; detalle: string }[] = [
    { valor: 'NINGUNA', detalle: 'Cerrar el reporte sin sanción.' },
    { valor: 'SUSPENDER_USUARIO', detalle: 'Suspender la cuenta reportada. Solo para reportes de tipo USUARIO.' },
  ];

  busqueda = '';
  filtroEstado: 'TODOS' | Estado = 'TODOS';
  seleccionadoId = '';

  resolviendo = false;
  accionElegida: Accion = 'NINGUNA';
  mensaje = '';
  tipoMensaje: 'ok' | 'error' = 'ok';

  get total(): number {
    return this.reportes.length;
  }

  get seleccionado(): Reporte { return this.reportes.find(r => r.id === this.seleccionadoId) ?? this.reportes[0] ?? { id: '', tipo: 'USUARIO', objetivo: '', motivo: '', reportadoPor: '', hace: '', estado: 'RESUELTO', accion: null }; }

  get puedeResolver(): boolean {
    return this.seleccionado.estado === 'PENDIENTE';
  }

  get abiertos(): number {
    return this.reportes.filter(r => r.estado === 'PENDIENTE').length;
  }

  get nivelAmenaza(): string {
    return this.contar('PENDIENTE') >= 2 ? 'ELEVADO' : 'MODERADO';
  }

  get reportesFiltrados(): Reporte[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.reportes.filter(r =>
      (this.filtroEstado === 'TODOS' || r.estado === this.filtroEstado) &&
      (!texto ||
        r.id.toLowerCase().includes(texto) ||
        r.motivo.toLowerCase().includes(texto) ||
        r.objetivo.toLowerCase().includes(texto))
    );
  }

  contar(estado: Estado): number {
    return this.reportes.filter(r => r.estado === estado).length;
  }

  contarFiltro(valor: 'TODOS' | Estado): number {
    return valor === 'TODOS' ? this.total : this.contar(valor);
  }

  claseEstado(estado: Estado): string {
    const clases: Record<Estado, string> = {
      'PENDIENTE': 'pendiente',
      'DESCARTADO': 'revision',
      'RESUELTO': 'resuelto',
    };
    return clases[estado];
  }

  accionDisponible(accion: Accion, reporte: Reporte): boolean {
    if (accion === 'SUSPENDER_USUARIO') return reporte.tipo === 'USUARIO';
    return true;
  }

  seleccionar(reporte: Reporte): void {
    this.seleccionadoId = reporte.id;
  }

  abrirResolucion(): void {
    if (!this.puedeResolver) return;
    this.accionElegida = 'NINGUNA';
    this.resolviendo = true;
  }

  confirmarResolucion(): void {
    const reporte = this.seleccionado;
    if (!this.accionDisponible(this.accionElegida, reporte)) {
      this.avisar('Esa acción no aplica a este tipo de reporte.', 'error');
      return;
    }

    const id = this.ids.get(reporte.id);
    if (id == null) return;
    this.api.resolverReporte(id, this.accionElegida === 'NINGUNA' ? 'DESCARTADO' : 'RESUELTO', this.accionElegida === 'SUSPENDER_USUARIO').subscribe({ next: (x) => { this.actualizar(reporte.id, this.adaptar(x)); this.resolviendo = false; this.cargar(); this.avisar(`${reporte.id} resuelto.`, 'ok'); this.cdr.markForCheck(); }, error: () => { this.avisar('No se pudo resolver el reporte.', 'error'); this.cdr.markForCheck(); } });
  }

  cancelarResolucion(): void {
    this.resolviendo = false;
  }

  private actualizar(id: string, cambios: Partial<Reporte>): void {
    this.reportes = this.reportes.map(r => (r.id === id ? { ...r, ...cambios } : r));
  }

  private avisar(texto: string, tipo: 'ok' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
  }

}
