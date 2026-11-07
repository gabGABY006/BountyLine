import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../service/api.service';

interface CatalogItem {
  id: number;
  nombre: string;
  descripcion: string;
  nivelPeligro?: number;
}

interface Mission {
  id: string;
  title: string;
  zone: string;
  specialty: string;
  reward: string;
  status: string;
  applicants: number;
  image: string;
}

type CatalogType = 'zone' | 'specialty';

@Component({
  selector: 'app-catalogos',
  standalone: false,
  styleUrl: './catalogos.component.css',
  templateUrl: './catalogos.component.html',
})
export class CatalogosComponent implements OnInit {
  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}
  zones: CatalogItem[] = [];
  specialties: CatalogItem[] = [];

  // Formulario (modal)
  modal: CatalogType | null = null;
  editando: CatalogItem | null = null;
  formNombre = '';
  formDescripcion = '';
  formError = '';
  readonly maxNombre = 40;
  readonly maxDescripcion = 120;

  cancelled: string[] = [];
  toast = '';

  missions: Mission[] = [];

  ngOnInit(): void {
    this.recargarCatalogos();
    this.cargarMisiones();
  }

  private cargarMisiones(): void {
    this.api.misiones().subscribe({ next: (xs) => { this.missions = xs.map((m) => ({ id: String(m.idMision), title: m.titulo, zone: m.zona, specialty: m.especialidad, reward: Number(m.montoRecompensa).toLocaleString('es-CO'), status: m.estado, applicants: m.postulaciones ?? 0, image: '' })); this.cdr.markForCheck(); }, error: () => { this.notify('No se pudieron cargar las misiones.'); this.cdr.markForCheck(); } });
  }

  private recargarCatalogos(): void {
    this.api.zonas().subscribe({ next: (xs) => { this.zones = xs.map((x) => ({ id: x.idZona, nombre: x.nombre, descripcion: x.descripcion ?? '', nivelPeligro: x.nivelPeligro })); this.cdr.markForCheck(); }, error: () => { this.notify('No se pudieron cargar las zonas.'); this.cdr.markForCheck(); } });
    this.api.especialidades().subscribe({ next: (xs) => { this.specialties = xs.map((x) => ({ id: x.idEspecialidad, nombre: x.nombre, descripcion: x.descripcion ?? '' })); this.cdr.markForCheck(); }, error: () => { this.notify('No se pudieron cargar las especialidades.'); this.cdr.markForCheck(); } });
  }

  get misionesVisibles(): Mission[] {
    return this.missions.filter((m) => m.status !== 'CERRADA' && m.status !== 'CANCELADA');
  }

  get misionesEnCurso(): number {
    return this.misionesVisibles.filter((m) => m.status === 'EN_CURSO' && !this.isCancelled(m.id)).length;
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  // ---------- Formulario de alta ----------
  abrirModal(type: CatalogType): void {
    this.modal = type;
    this.editando = null;
    this.formNombre = '';
    this.formDescripcion = '';
    this.formError = '';
  }

  editar(item: CatalogItem, type: CatalogType): void {
    this.modal = type; this.editando = item; this.formNombre = item.nombre; this.formDescripcion = item.descripcion; this.formError = '';
  }

  cerrarModal(): void {
    this.modal = null;
    this.editando = null;
    this.formError = '';
  }

  onNombre(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length > this.maxNombre) input.value = input.value.slice(0, this.maxNombre);
    this.formNombre = input.value;
    this.formError = '';
  }

  onDescripcion(event: Event): void {
    const area = event.target as HTMLTextAreaElement;
    if (area.value.length > this.maxDescripcion) area.value = area.value.slice(0, this.maxDescripcion);
    this.formDescripcion = area.value;
  }

  guardar(event: Event): void {
    event.preventDefault();
    if (!this.modal) return;

    const isZone = this.modal === 'zone';
    const nombre = this.formNombre.trim();
    const descripcion = this.formDescripcion.trim();
    const lista = isZone ? this.zones : this.specialties;

    if (!nombre) {
      this.formError = 'El nombre es obligatorio.';
      return;
    }
    if (nombre.length < 3) {
      this.formError = 'El nombre debe tener al menos 3 caracteres.';
      return;
    }
    if (lista.some((item) => item.id !== this.editando?.id && item.nombre.toLowerCase() === nombre.toLowerCase())) {
      this.formError = `Ya existe ${isZone ? 'una zona' : 'una especialidad'} con ese nombre.`;
      return;
    }

    const datosZona = { nombre, descripcion, nivelPeligro: this.editando?.nivelPeligro ?? 3 };
    const solicitud: Observable<unknown> = isZone
      ? this.editando ? this.api.actualizarZona(this.editando.id, datosZona) : this.api.crearZona(datosZona)
      : this.editando ? this.api.actualizarEspecialidad(this.editando.id, { nombre, descripcion }) : this.api.crearEspecialidad({ nombre, descripcion });
    solicitud.subscribe({ next: () => { const accion = this.editando ? 'actualizada' : 'añadida'; this.recargarCatalogos(); this.cerrarModal(); this.notify(`${isZone ? 'Zona' : 'Especialidad'} ${accion} en el catálogo`); this.cdr.markForCheck(); }, error: () => { this.formError = 'No se pudo guardar en el catálogo. Revisa que el nombre no exista.'; this.cdr.markForCheck(); } });
  }

  // ---------- Misiones ----------
  isCancelled(id: string): boolean {
    return this.cancelled.includes(id);
  }

  statusLabel(m: Mission): string {
    return this.isCancelled(m.id) ? 'CANCELADA' : m.status;
  }

  statusClass(m: Mission): string {
    return this.statusLabel(m).toLowerCase().replace(' ', '-');
  }

  cancelMission(m: Mission): void {
    if (this.isCancelled(m.id)) return;
    this.api.cancelarMision(Number(m.id)).subscribe({ next: () => { this.cancelled = [...this.cancelled, m.id]; this.cargarMisiones(); this.notify(`BL-${m.id} cancelada y saldo reembolsado`); this.cdr.markForCheck(); }, error: () => { this.notify(`No se pudo cancelar BL-${m.id}.`); this.cdr.markForCheck(); } });
  }

  private notify(message: string): void {
    this.toast = message;
    this.cdr.markForCheck();
    setTimeout(() => { this.toast = ''; this.cdr.markForCheck(); }, 2800);
  }
}
