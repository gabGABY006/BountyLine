import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Catalogo, CatalogoService } from '../../../service/catalogo.service';
import { CazadorApi, MisionService } from '../../../service/mision.service';
import { ApiService } from '../../../service/api.service';

type Tono = 'cyan' | 'pink' | 'amber';
interface Hunter { id: number; alias: string; initials: string; zone: string; specialty: string; rating: string; jobs: number; match: number; tone: Tono; level: string; success: string; bio: string; }

@Component({ selector: 'app-cazadores', standalone: false, styleUrl: './cazadores.component.css', templateUrl: './cazadores.component.html' })
export class CazadoresComponent implements OnInit {
  readonly cero = 0;
  readonly stars: number[] = [1, 2, 3, 4, 5];
  zonas: Catalogo[] = [];
  especialidades: Catalogo[] = [];
  readonly motivos: string[] = ['Contenido inapropiado', 'Fraude o engaño', 'Suplantación'];
  hunters: Hunter[] = [];
  cargando = true;
  error = '';
  filtro = { alias: '', zona: '', especialidad: '' };
  selectedAlias = '';
  reportOpen = false;
  toast = '';

  constructor(private api: MisionService, private catalogos: CatalogoService, private datosApi: ApiService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.catalogos.zonas().subscribe({ next: (x) => { this.zonas = x; this.cdr.markForCheck(); }, error: () => this.cdr.markForCheck() });
    this.catalogos.especialidades().subscribe({ next: (x) => { this.especialidades = x; this.cdr.markForCheck(); }, error: () => this.cdr.markForCheck() });
    this.cargar();
  }
  private cargar(): void {
    this.cargando = true;
    this.api.listarCazadores().subscribe({ next: (x) => { this.hunters = x.map((h, i) => this.adaptar(h, i)); this.selectedAlias = this.hunters[0]?.alias ?? ''; this.cargando = false; this.cdr.markForCheck(); }, error: () => { this.error = 'No se pudieron cargar los cazarrecompensas. Verifica que el back esté encendido.'; this.cargando = false; this.cdr.markForCheck(); } });
  }
  private adaptar(h: CazadorApi, i: number): Hunter {
    const alias = h.alias ?? '';
    const tones: Tono[] = ['cyan', 'pink', 'amber'];
    return { id: h.idCazarrecompensas, alias, initials: alias.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase(), zone: h.zona, specialty: (h.especialidades ?? '').split(',').map((s) => s.trim()).filter(Boolean).join(' · ') || 'Sin especialidad', rating: Number(h.reputacion ?? 0).toFixed(1), jobs: h.misionesCompletadas ?? 0, match: 0, tone: tones[i % tones.length], level: (h.reputacion ?? 0) >= 4.5 ? 'EXPERTO' : 'OPERADOR', success: '—', bio: h.biografia ?? 'Sin biografía.' };
  }
  get resultados(): Hunter[] { const { alias, zona, especialidad } = this.filtro; return this.hunters.filter((h) => h.alias.toLowerCase().includes(alias) && (!zona || h.zone === zona) && (!especialidad || h.specialty.split(' · ').includes(especialidad))); }
  get selected(): Hunter { return this.hunters.find((h) => h.alias === this.selectedAlias) ?? this.resultados[0] ?? this.hunters[0] ?? { id: 0, alias: '—', initials: '--', zone: '—', specialty: '—', rating: '0.0', jobs: 0, match: 0, tone: 'cyan', level: '—', success: '—', bio: 'No hay cazarrecompensas disponibles.' }; }
  redondear(rating: string): number { return Math.round(Number(rating)); }
  buscar(event: Event, alias: HTMLInputElement, zona: HTMLSelectElement, especialidad: HTMLSelectElement): void { event.preventDefault(); this.filtro = { alias: alias.value.trim().toLowerCase(), zona: zona.value, especialidad: especialidad.value }; if (this.resultados.length && !this.resultados.some((h) => h.alias === this.selectedAlias)) this.selectedAlias = this.resultados[0].alias; }
  limpiar(alias: HTMLInputElement, zona: HTMLSelectElement, especialidad: HTMLSelectElement): void { alias.value = ''; zona.value = ''; especialidad.value = ''; this.filtro = { alias: '', zona: '', especialidad: '' }; }
  seleccionar(hunter: Hunter): void { this.selectedAlias = hunter.alias; }
  invitar(): void { this.notify('La invitación se gestiona al asignar una misión publicada.'); }
  abrirReporte(): void { this.reportOpen = true; }
  cerrarReporte(): void { this.reportOpen = false; }
  enviarReporte(event: Event): void {
    event.preventDefault();
    const hunter = this.selected;
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const motivo = `${String(data.get('motivo') ?? '')}: ${String(data.get('detalle') ?? '').trim()}`.slice(0, 300);
    if (!hunter.id || !motivo.trim()) { this.notify('Selecciona un motivo y añade contexto para el reporte.'); return; }
    this.datosApi.crearReporte({ idCuentaReportada: hunter.id, motivo }).subscribe({ next: () => { this.reportOpen = false; this.notify('Reporte enviado a moderación'); this.cdr.markForCheck(); }, error: () => { this.notify('No se pudo enviar el reporte.'); this.cdr.markForCheck(); } });
  }
  private notify(message: string): void { this.toast = message; this.cdr.markForCheck(); setTimeout(() => { this.toast = ''; this.cdr.markForCheck(); }, 2800); }
}
