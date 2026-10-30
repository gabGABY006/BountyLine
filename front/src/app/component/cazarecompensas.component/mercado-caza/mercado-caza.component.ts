import { Component } from '@angular/core';

type Tono = 'cyan' | 'pink' | 'amber';

interface Mission {
  id: string;
  title: string;
  zone: string;
  specialty: string;
  reward: number;
  status: string;
  tone: Tono;
  image: string;
}

@Component({
  selector: 'app-mercado-caza',
  standalone: false,
  styleUrl: './mercado-caza.component.css',
  templateUrl: './mercado-caza.component.html',
})
export class MercadoCazaComponent {
  // Datos de ejemplo: reemplazar por el servicio cuando exista el back.
  // Zonas y especialidades deberían venir del catálogo que administra el admin.
  readonly cero = 0;
  readonly zonas: string[] = ['Distrito Centro', 'Puerto', 'Zona industrial', 'Suburbios', 'Zona libre'];
  readonly especialidades: string[] = ['Recuperación', 'Protección', 'Rastreo', 'Escolta', 'Sabotaje'];

  misiones: Mission[] = [
    { id: 'BL-2048', title: 'Recuperar créditos del Clan Kuro', zone: 'Distrito Centro', specialty: 'Recuperación', reward: 12800, status: 'PUBLICADA', tone: 'cyan', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520' },
    { id: 'BL-2051', title: 'Protección para cruce de frontera', zone: 'Puerto', specialty: 'Protección', reward: 8400, status: 'PUBLICADA', tone: 'amber', image: 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520' },
    { id: 'BL-2053', title: 'Escolta nocturna en los suburbios', zone: 'Suburbios', specialty: 'Escolta', reward: 6300, status: 'PUBLICADA', tone: 'pink', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520' },
    { id: 'BL-2056', title: 'Neutralizar relé en zona libre', zone: 'Zona libre', specialty: 'Sabotaje', reward: 9700, status: 'PUBLICADA', tone: 'cyan', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520' },
  ];

  // Filtros aplicados (se actualizan al pulsar FILTRAR)
  filtro = { texto: '', zona: '', especialidad: '' };
  postuladas: string[] = [];
  pendiente: Mission | null = null;
  toast = '';

  get resultados(): Mission[] {
    const { texto, zona, especialidad } = this.filtro;
    return this.misiones.filter(
      (m) =>
        m.status === 'PUBLICADA' &&
        m.title.toLowerCase().includes(texto) &&
        (!zona || m.zone === zona) &&
        (!especialidad || m.specialty === especialidad),
    );
  }

  formatear(valor: number): string {
    return valor.toLocaleString('es-CO');
  }

  yaPostulado(mission: Mission): boolean {
    return this.postuladas.includes(mission.id);
  }

  // ---------- Filtros ----------
  filtrar(event: Event, texto: HTMLInputElement, zona: HTMLSelectElement, especialidad: HTMLSelectElement): void {
    event.preventDefault();
    this.filtro = {
      texto: texto.value.trim().toLowerCase(),
      zona: zona.value,
      especialidad: especialidad.value,
    };
  }

  limpiar(texto: HTMLInputElement, zona: HTMLSelectElement, especialidad: HTMLSelectElement): void {
    texto.value = '';
    zona.value = '';
    especialidad.value = '';
    this.filtro = { texto: '', zona: '', especialidad: '' };
  }

  // ---------- Postulación ----------
  pedirPostulacion(mission: Mission): void {
    this.pendiente = mission;
  }

  cancelarPostulacion(): void {
    this.pendiente = null;
  }

  confirmarPostulacion(): void {
    if (!this.pendiente) return;
    this.postuladas = [...this.postuladas, this.pendiente.id];
    this.notify(`Postulación enviada a ${this.pendiente.id}`);
    this.pendiente = null;
  }

  private notify(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2800);
  }
}
