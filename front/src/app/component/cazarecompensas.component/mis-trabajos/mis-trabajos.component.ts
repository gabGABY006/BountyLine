import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../service/api.service';

type Estado = 'POSTULADA' | 'ASIGNADA' | 'EN CURSO' | 'CERRADA';
type Tono = 'cyan' | 'pink' | 'amber';
interface Job { id: string; missionId: number; title: string; zone: string; specialty: string; reward: number; status: Estado; tone: Tono; image: string; client: string; messages: never[]; }
@Component({ selector: 'app-mis-trabajos', standalone: false, styleUrl: './mis-trabajos.component.css', templateUrl: './mis-trabajos.component.html' })
export class MisTrabajosComponent implements OnInit {
  readonly cero = 0;
  readonly miAlias = '';
  readonly miIniciales = '';
  readonly pestanas = ['POSTULACIONES', 'ASIGNADAS', 'EN CURSO', 'CERRADAS'];
  readonly pasos = ['Postulación enviada', 'Misión asignada', 'En curso', 'Cierre confirmado'];
  private readonly estadoPorPestana: Record<string, Estado> = { POSTULACIONES: 'POSTULADA', ASIGNADAS: 'ASIGNADA', 'EN CURSO': 'EN CURSO', CERRADAS: 'CERRADA' };
  jobs: Job[] = [];
  cargando = true;
  error = '';
  pestana = 'POSTULACIONES';
  selectedId = '';
  pendiente: Job | null = null;
  toast = '';
  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.cargar(); }
  private cargar(): void {
    this.cargando = true;
    forkJoin({ asignadas: this.api.mias(), postulaciones: this.api.postulacionesMias() }).pipe(
      switchMap(({ asignadas, postulaciones }) => {
        const ids = new Set<number>([...asignadas.map((m: any) => m.idMision), ...postulaciones.map((p: any) => p.idMision)]);
        const detalles$ = ids.size ? forkJoin([...ids].map((id) => this.api.detalleMision(id).pipe(catchError(() => of(null))))) : of([]);
        return detalles$.pipe(map((detalles) => ({ asignadas, postulaciones, detalles })));
      }),
    ).subscribe({ next: ({ asignadas, postulaciones, detalles }) => {
      const asignados = new Set(asignadas.map((m: any) => m.idMision));
      this.jobs = detalles.filter(Boolean).map((m: any, i: number) => {
        const aplicada = postulaciones.some((p: any) => p.idMision === m.idMision && p.estadoPostulacion !== 'RECHAZADA');
        const status = m.estado === 'CERRADA' ? 'CERRADA' : m.estado === 'EN_CURSO' ? 'EN CURSO' : m.estado === 'ASIGNADA' ? 'ASIGNADA' : aplicada && !asignados.has(m.idMision) ? 'POSTULADA' : 'ASIGNADA';
        return { id: `BL-${m.idMision}`, missionId: m.idMision, title: m.titulo, zone: m.zona, specialty: m.especialidad, reward: Number(m.montoRecompensa), status, tone: (['cyan', 'pink', 'amber'] as Tono[])[i % 3], image: '', client: m.aliasUsuario, messages: [] };
      });
      this.selectedId = this.jobs[0]?.id ?? ''; this.cargando = false; this.error = ''; this.cdr.markForCheck();
    }, error: () => { this.cargando = false; this.error = 'No se pudieron cargar tus trabajos.'; this.cdr.markForCheck(); } });
  }
  get lista(): Job[] { return this.jobs.filter((j) => j.status === this.estadoPorPestana[this.pestana]); }
  get selected(): Job { return this.jobs.find((j) => j.id === this.selectedId) ?? this.lista[0] ?? this.jobs[0] ?? { id: '—', missionId: 0, title: 'Sin trabajos', zone: '—', specialty: '—', reward: 0, status: 'POSTULADA', tone: 'cyan', image: '', client: '—', messages: [] }; }
  get tieneCanal(): boolean { return false; }
  get chatActivo(): boolean { return false; }
  contar(pestana: string): number { return this.jobs.filter((j) => j.status === this.estadoPorPestana[pestana]).length; }
  formatear(valor: number): string { return valor.toLocaleString('es-CO'); }
  statusClass(status: string): string { return status.toLowerCase().replace(' ', '-'); }
  textoAccion(job: Job): string { return job.status === 'ASIGNADA' ? 'INICIAR MISIÓN' : job.status === 'EN CURSO' ? 'EN CURSO' : 'VER DETALLE'; }
  cambiarPestana(pestana: string): void { this.pestana = pestana; if (this.lista[0]) this.selectedId = this.lista[0].id; }
  seleccionar(job: Job): void { this.selectedId = job.id; }
  private pasosCompletados(job: Job): number { return ({ POSTULADA: 1, ASIGNADA: 2, 'EN CURSO': 3, CERRADA: 4 })[job.status]; }
  estaCompleto(indice: number): boolean { return indice < this.pasosCompletados(this.selected); }
  subtituloPaso(indice: number): string { const n = this.pasosCompletados(this.selected); return indice < n ? 'COMPLETADO' : indice === n ? 'PENDIENTE' : 'EN ESPERA'; }
  accion(event: Event, job: Job): void { event.stopPropagation(); this.selectedId = job.id; if (job.status === 'ASIGNADA') this.pendiente = job; }
  cancelarInicio(): void { this.pendiente = null; }
  confirmarInicio(): void { const job = this.pendiente; if (!job) return; this.api.iniciarMision(job.missionId).subscribe({ next: () => { this.pendiente = null; this.notify(`Misión ${job.id} iniciada`); this.pestana = 'EN CURSO'; this.cargar(); this.cdr.markForCheck(); }, error: () => { this.notify('No se pudo iniciar la misión.'); this.cdr.markForCheck(); } }); }
  enviarMensaje(): void { this.notify('El chat se conectará cuando esté disponible la integración con MongoDB.'); }
  private notify(message: string): void { this.toast = message; this.cdr.markForCheck(); setTimeout(() => { this.toast = ''; this.cdr.markForCheck(); }, 2800); }
}
