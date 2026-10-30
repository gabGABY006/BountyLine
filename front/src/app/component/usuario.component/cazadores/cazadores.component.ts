import { Component } from '@angular/core';

type Tono = 'cyan' | 'pink' | 'amber';

interface Hunter {
  alias: string;
  initials: string;
  zone: string;
  specialty: string;
  rating: string;
  jobs: number;
  match: number;
  tone: Tono;
  level: string;
  success: string;
  bio: string;
}

@Component({
  selector: 'app-cazadores',
  standalone: false,
  styleUrl: './cazadores.component.css',
  templateUrl: './cazadores.component.html',
})
export class CazadoresComponent {
  // Datos de ejemplo: reemplazar por el servicio cuando exista el back.
  // Zonas y especialidades deberían venir del catálogo que administra el admin.
  readonly cero = 0;
  readonly stars: number[] = [1, 2, 3, 4, 5];
  readonly zonas: string[] = ['Distrito Centro', 'Puerto', 'Zona industrial', 'Suburbios', 'Zona libre'];
  readonly especialidades: string[] = ['Recuperación', 'Protección', 'Rastreo', 'Escolta', 'Sabotaje'];
  readonly motivos: string[] = ['Contenido inapropiado', 'Fraude o engaño', 'Suplantación'];

  hunters: Hunter[] = [
    { alias: 'VANTA_K', initials: 'VK', zone: 'Distrito Centro', specialty: 'Recuperación', rating: '4.9', jobs: 87, match: 98, tone: 'cyan', level: 'EXPERTO // 04', success: '96%', bio: 'Operador verificado, especialista en operaciones discretas y recuperación de activos.' },
    { alias: 'RØNIN_X', initials: 'RX', zone: 'Puerto', specialty: 'Protección', rating: '4.8', jobs: 72, match: 92, tone: 'pink', level: 'EXPERTO // 04', success: '94%', bio: 'Escoltas y custodia de cargamentos en el puerto. Respuesta rápida y comunicación constante.' },
    { alias: 'NIGHTMARE', initials: 'NM', zone: 'Zona industrial', specialty: 'Rastreo', rating: '4.7', jobs: 64, match: 89, tone: 'amber', level: 'AVANZADO // 03', success: '91%', bio: 'Rastreo de señales y objetivos en el anillo industrial. Conoce cada acceso del sector.' },
    { alias: 'MARA_V', initials: 'MV', zone: 'Suburbios', specialty: 'Escolta', rating: '4.6', jobs: 41, match: 84, tone: 'cyan', level: 'AVANZADO // 03', success: '90%', bio: 'Acompañamiento seguro de clientes en los suburbios. Disponible para trabajos nocturnos.' },
    { alias: 'GHOST_77', initials: 'G7', zone: 'Zona libre', specialty: 'Sabotaje', rating: '4.5', jobs: 33, match: 78, tone: 'pink', level: 'INTERMEDIO // 02', success: '88%', bio: 'Operaciones discretas en zona libre. Entrega informes detallados al cierre de cada misión.' },
  ];

  // Filtros aplicados (se actualizan al pulsar BUSCAR)
  filtro = { alias: '', zona: '', especialidad: '' };
  selectedAlias = 'VANTA_K';
  reportOpen = false;
  toast = '';

  get resultados(): Hunter[] {
    const { alias, zona, especialidad } = this.filtro;
    return this.hunters.filter(
      (h) =>
        h.alias.toLowerCase().includes(alias) &&
        (!zona || h.zone === zona) &&
        (!especialidad || h.specialty === especialidad),
    );
  }

  get selected(): Hunter {
    return this.hunters.find((h) => h.alias === this.selectedAlias) ?? this.hunters[0];
  }

  redondear(rating: string): number {
    return Math.round(Number(rating));
  }

  // ---------- Búsqueda ----------
  buscar(event: Event, alias: HTMLInputElement, zona: HTMLSelectElement, especialidad: HTMLSelectElement): void {
    event.preventDefault();
    this.filtro = {
      alias: alias.value.trim().toLowerCase(),
      zona: zona.value,
      especialidad: especialidad.value,
    };
    const primero = this.resultados[0];
    if (primero && !this.resultados.includes(this.selected)) this.selectedAlias = primero.alias;
  }

  limpiar(alias: HTMLInputElement, zona: HTMLSelectElement, especialidad: HTMLSelectElement): void {
    alias.value = '';
    zona.value = '';
    especialidad.value = '';
    this.filtro = { alias: '', zona: '', especialidad: '' };
  }

  seleccionar(hunter: Hunter): void {
    this.selectedAlias = hunter.alias;
  }

  invitar(): void {
    this.notify('Invitación enviada al cazador');
  }

  // ---------- Reporte ----------
  abrirReporte(): void {
    this.reportOpen = true;
  }

  cerrarReporte(): void {
    this.reportOpen = false;
  }

  enviarReporte(event: Event): void {
    event.preventDefault();
    this.reportOpen = false;
    this.notify('Reporte enviado a moderación');
  }

  private notify(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2800);
  }
}
