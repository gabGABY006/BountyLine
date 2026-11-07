import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../service/api.service';

type Tono = 'cian' | 'ambar' | 'rosa';

interface Metrica {
  indice: string;
  etiqueta: string;
  valor: string;
  detalle: string;
  icono: string;
  tono: Tono;
}

interface Incidente {
  id: string;
  objetivo: string;
  motivo: string;
  hace: string;
  nivel: 'ALFA' | 'BETA';
}

interface Punto {
  hora: string;
  valor: number;
}

interface Evento {
  titulo: string;
  detalle: string;
  hora: string;
  icono: string;
  tono: Tono;
}

interface Acceso {
  titulo: string;
  detalle: string;
  icono: string;
  ruta: string;
}

@Component({
  selector: 'app-admin',
  standalone: false,
  styleUrl: './admin.component.css',
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {
  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}
  canceladas = 0;

  metricas: Metrica[] = [];

  incidentes: Incidente[] = [];

  flujo: Punto[] = [];

  eventos: Evento[] = [];
  cargando = true;
  fuentesConError: string[] = [];

  accesos: Acceso[] = [
    { titulo: 'GESTIONAR OPERADORES', detalle: 'Altas, permisos y suspensiones', icono: 'pi-users', ruta: '/admin/usuarios' },
    { titulo: 'EDITAR CATÁLOGOS', detalle: 'Zonas y especialidades', icono: 'pi-map', ruta: '/admin/catalogos' },
  ];

  ngOnInit(): void {
    this.cargando = true;
    this.fuentesConError = [];
    forkJoin({
      cuentas: this.api.cuentas().pipe(catchError(() => { this.fuentesConError.push('cuentas'); return of([]); })),
      misiones: this.api.misiones().pipe(catchError(() => { this.fuentesConError.push('misiones'); return of([]); })),
      reportes: this.api.reportes().pipe(catchError(() => { this.fuentesConError.push('reportes'); return of([]); })),
      auditoria: this.api.auditoria().pipe(catchError(() => { this.fuentesConError.push('auditoría'); return of([]); })),
    }).subscribe({
      next: ({ cuentas, misiones, reportes, auditoria }) => {
        const cazadores = cuentas.filter((c) => c.rol === 'CAZARRECOMPENSAS').length;
        const abiertas = misiones.filter((m) => ['PUBLICADA', 'ASIGNADA', 'EN_CURSO'].includes(m.estado)).length;
        const enCurso = misiones.filter((m) => m.estado === 'EN_CURSO').length;
        const cerradas = misiones.filter((m) => m.estado === 'CERRADA').length;
        const pendientes = reportes.filter((r) => r.estado === 'PENDIENTE').length;
        this.canceladas = misiones.filter((m) => m.estado === 'CANCELADA').length;
        this.metricas = [
          { indice: '01', etiqueta: 'Usuarios', valor: String(cuentas.length), detalle: `${cazadores} cazarrecompensas`, icono: 'pi-users', tono: 'cian' },
          { indice: '02', etiqueta: 'Misiones abiertas', valor: String(abiertas), detalle: `${enCurso} activas en curso`, icono: 'pi-folder-open', tono: 'cian' },
          { indice: '03', etiqueta: 'Misiones cerradas', valor: String(cerradas), detalle: 'Pagos completados', icono: 'pi-check-circle', tono: 'ambar' },
          { indice: '04', etiqueta: 'Reportes pendientes', valor: String(pendientes), detalle: 'Requieren revisión', icono: 'pi-exclamation-triangle', tono: 'rosa' },
        ];
        this.incidentes = reportes.filter((r) => r.estado === 'PENDIENTE').slice(0, 4).map((r) => ({ id: `R-${r.idReporte}`, objetivo: r.aliasReportada ?? `CUENTA-${r.idCuentaReportada ?? ''}`, motivo: r.motivo, hace: new Date(r.fechaReporte).toLocaleString('es-CO'), nivel: 'ALFA' as const }));
        const now = Date.now();
        this.flujo = Array.from({ length: 12 }, (_, i) => { const date = new Date(now - (11 - i) * 3600000); return { hora: date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }), valor: misiones.filter((m) => Math.abs(new Date(m.fechaPublicacion).getTime() - date.getTime()) < 3600000).length }; });
        this.eventos = auditoria.slice(0, 5).map((a) => ({ titulo: `${a.campoModificado} actualizado`, detalle: `${a.usuarioBd} · cuenta ${a.idCuenta}`, hora: new Date(a.fechaCambio).toLocaleTimeString('es-CO'), icono: 'pi-user', tono: 'cian' as const }));
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => { this.cargando = false; this.fuentesConError = ['datos del panel']; this.cdr.markForCheck(); },
    });
  }

  get totalPublicadas(): number {
    return this.flujo.reduce((suma, p) => suma + p.valor, 0);
  }

  get maximo(): number {
    return Math.max(1, ...this.flujo.map(p => p.valor));
  }

  get escala(): number[] {
    const m = this.maximo;
    return [m, Math.round((m * 2) / 3), Math.round(m / 3), 0];
  }

  alturaBarra(valor: number): number {
    return Math.round((valor / this.maximo) * 100);
  }
}
