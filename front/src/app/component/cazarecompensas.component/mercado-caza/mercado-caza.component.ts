import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Catalogo, CatalogoService } from '../../../service/catalogo.service';
import { MisionApi, MisionService } from '../../../service/mision.service';
import { ApiService } from '../../../service/api.service';

type Tono = 'cyan' | 'pink' | 'amber';
interface Mission { id: number; title: string; zone: string; specialty: string; reward: number; status: string; tone: Tono; image: string; }

@Component({ selector: 'app-mercado-caza', standalone: false, styleUrl: './mercado-caza.component.css', templateUrl: './mercado-caza.component.html' })
export class MercadoCazaComponent implements OnInit {
  readonly cero = 0;
  zonas: Catalogo[] = [];
  especialidades: Catalogo[] = [];
  misiones: Mission[] = [];
  cargando = true;
  error = '';
  filtro = { texto: '', zona: '', especialidad: '' };
  postuladas: number[] = [];
  pendiente: Mission | null = null;
  toast = '';
  private readonly imagen = 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520';
  constructor(private api: MisionService, private catalogos: CatalogoService, private datosApi: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.catalogos.zonas().subscribe({ next: (v) => { this.zonas = v; this.cdr.markForCheck(); }, error: () => { this.error = 'No se pudieron cargar las zonas.'; this.cdr.markForCheck(); } });
    this.catalogos.especialidades().subscribe({ next: (v) => { this.especialidades = v; this.cdr.markForCheck(); }, error: () => { this.error = 'No se pudieron cargar las especialidades.'; this.cdr.markForCheck(); } });
    this.datosApi.postulacionesMias().subscribe({ next: (xs) => { this.postuladas = xs.map((x) => x.idMision); this.cdr.markForCheck(); }, error: () => this.cdr.markForCheck() });
    this.cargar();
  }

  private cargar(): void {
    this.cargando = true;
    this.api.listarPublicadas().subscribe({
      next: (lista) => { this.misiones = lista.map((m) => this.adaptar(m)); this.cargando = false; this.error = ''; this.cdr.markForCheck(); },
      error: () => { this.cargando = false; this.error = 'No se pudieron cargar las misiones. Verifica que el back esté encendido.'; this.cdr.markForCheck(); },
    });
  }

  private adaptar(m: MisionApi): Mission { return { id: m.idMision, title: m.titulo, zone: m.zona, specialty: m.especialidad, reward: Number(m.montoRecompensa), status: m.estado, tone: m.estado === 'PUBLICADA' ? 'cyan' : 'amber', image: this.imagen }; }
  get resultados(): Mission[] { const { texto, zona, especialidad } = this.filtro; return this.misiones.filter((m) => m.status === 'PUBLICADA' && m.title.toLowerCase().includes(texto) && (!zona || m.zone === zona) && (!especialidad || m.specialty === especialidad)); }
  formatear(valor: number): string { return valor.toLocaleString('es-CO'); }
  yaPostulado(mission: Mission): boolean { return this.postuladas.includes(mission.id); }
  filtrar(event: Event, texto: HTMLInputElement, zona: HTMLSelectElement, especialidad: HTMLSelectElement): void { event.preventDefault(); this.filtro = { texto: texto.value.trim().toLowerCase(), zona: zona.value, especialidad: especialidad.value }; }
  limpiar(texto: HTMLInputElement, zona: HTMLSelectElement, especialidad: HTMLSelectElement): void { texto.value = ''; zona.value = ''; especialidad.value = ''; this.filtro = { texto: '', zona: '', especialidad: '' }; }
  pedirPostulacion(mission: Mission): void { this.pendiente = mission; }
  cancelarPostulacion(): void { this.pendiente = null; }
  confirmarPostulacion(): void {
    const m = this.pendiente;
    if (!m) return;
    this.api.postular(m.id).subscribe({
      next: () => { this.postuladas = [...this.postuladas, m.id]; this.notify(`Postulación enviada a BL-${m.id}`); this.pendiente = null; this.cdr.markForCheck(); },
      error: () => { this.notify('No se pudo enviar la postulación. Inténtalo de nuevo.'); this.cdr.markForCheck(); },
    });
  }
  private notify(message: string): void { this.toast = message; this.cdr.markForCheck(); setTimeout(() => { this.toast = ''; this.cdr.markForCheck(); }, 2800); }
}
