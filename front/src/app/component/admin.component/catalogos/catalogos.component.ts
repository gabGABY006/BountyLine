import { Component } from '@angular/core';

interface CatalogItem {
  nombre: string;
  descripcion: string;
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
export class CatalogosComponent {
  zones: CatalogItem[] = [
    { nombre: 'Distrito Centro', descripcion: '' },
    { nombre: 'Puerto', descripcion: '' },
    { nombre: 'Zona industrial', descripcion: '' },
    { nombre: 'Suburbios', descripcion: '' },
    { nombre: 'Zona libre', descripcion: '' },
  ];
  specialties: CatalogItem[] = [
    { nombre: 'Recuperación', descripcion: '' },
    { nombre: 'Protección', descripcion: '' },
    { nombre: 'Rastreo', descripcion: '' },
    { nombre: 'Escolta', descripcion: '' },
    { nombre: 'Sabotaje', descripcion: '' },
  ];

  // Formulario (modal)
  modal: CatalogType | null = null;
  formNombre = '';
  formDescripcion = '';
  formError = '';
  readonly maxNombre = 40;
  readonly maxDescripcion = 120;

  cancelled: string[] = [];
  toast = '';

  missions: Mission[] = [
    { id: 'BL-2048', title: 'Recuperar créditos del Clan Kuro', zone: 'Distrito Centro', specialty: 'Recuperación', reward: '12.800', status: 'PUBLICADA', applicants: 4, image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520' },
    { id: 'BL-2039', title: 'Escolta hacia el Puerto Gris', zone: 'Puerto', specialty: 'Protección', reward: '8.400', status: 'EN CURSO', applicants: 1, image: 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520' },
    { id: 'BL-2014', title: 'Rastrear señal fantasma', zone: 'Zona industrial', specialty: 'Rastreo', reward: '5.900', status: 'CERRADA', applicants: 7, image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520' },
  ];

  get misionesVisibles(): Mission[] {
    return this.missions.filter((m) => m.status !== 'CERRADA');
  }

  get misionesEnCurso(): number {
    return this.misionesVisibles.filter((m) => !this.isCancelled(m.id)).length;
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  // ---------- Formulario de alta ----------
  abrirModal(type: CatalogType): void {
    this.modal = type;
    this.formNombre = '';
    this.formDescripcion = '';
    this.formError = '';
  }

  cerrarModal(): void {
    this.modal = null;
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
    if (lista.some((item) => item.nombre.toLowerCase() === nombre.toLowerCase())) {
      this.formError = `Ya existe ${isZone ? 'una zona' : 'una especialidad'} con ese nombre.`;
      return;
    }

    const nuevo: CatalogItem = { nombre, descripcion };
    if (isZone) this.zones = [...this.zones, nuevo];
    else this.specialties = [...this.specialties, nuevo];

    this.cerrarModal();
    this.notify(`${isZone ? 'Zona' : 'Especialidad'} añadida al catálogo`);
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
    this.cancelled = [...this.cancelled, m.id];
    this.notify(`${m.id} cancelada y saldo reembolsado`);
  }

  private notify(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2800);
  }
}
