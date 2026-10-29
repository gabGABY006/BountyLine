import { Component, Input } from '@angular/core';

type Estado = 'PUBLICADA' | 'ASIGNADA' | 'EN CURSO' | 'CERRADA' | 'CANCELADA';
type Tono = 'cyan' | 'pink' | 'amber';
type Accion = 'asignar' | 'cancelar' | 'cerrar';

interface Mensaje {
  autor: string;
  iniciales: string;
  tono: Tono;
  texto: string;
}

interface Mission {
  id: string;
  title: string;
  zone: string;
  specialty: string;
  reward: number;
  status: Estado;
  applicants: number;
  tone: Tono;
  image: string;
  hunter?: string;
  messages: Mensaje[];
}

interface Hunter {
  alias: string;
  initials: string;
  zone: string;
  specialty: string;
  rating: string;
  jobs: number;
  match: number;
  tone: Tono;
}

@Component({
  selector: 'app-misiones',
  standalone: false,
  styleUrl: './misiones.component.css',
  templateUrl: './misiones.component.html',
})
export class MisionesComponent {
  /** Texto de búsqueda (opcional): si tu topbar tiene buscador, pásalo con [query]="..." */
  @Input() query = '';

  // ---------- Datos de ejemplo (reemplazar por servicios cuando exista el back) ----------
  readonly miAlias = 'AXIOM_47';
  readonly miIniciales = 'AX';
  readonly stars: number[] = [1, 2, 3, 4, 5];
  readonly pasos: string[] = ['Publicada', 'Cazador asignado', 'En curso', 'Cierre confirmado'];
  readonly filtros: string[] = ['TODAS', 'PUBLICADA', 'ASIGNADA', 'EN CURSO', 'CERRADA'];
  readonly zonas: string[] = ['Distrito Centro', 'Puerto', 'Zona industrial', 'Suburbios', 'Zona libre'];
  readonly especialidades: string[] = ['Recuperación', 'Protección', 'Rastreo', 'Escolta', 'Sabotaje'];

  private readonly imagenPorDefecto =
    'https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520';
  private siguienteId = 2050;

  saldoDisponible = 42850;

  missions: Mission[] = [
    {
      id: 'BL-2048', title: 'Recuperar créditos del Clan Kuro', zone: 'Distrito Centro', specialty: 'Recuperación',
      reward: 12800, status: 'PUBLICADA', applicants: 4, tone: 'cyan',
      image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520',
      messages: [],
    },
    {
      id: 'BL-2039', title: 'Escolta hacia el Puerto Gris', zone: 'Puerto', specialty: 'Protección',
      reward: 8400, status: 'EN CURSO', applicants: 1, tone: 'amber',
      image: 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520',
      hunter: 'RØNIN_X',
      messages: [{ autor: 'RØNIN_X', iniciales: 'RX', tono: 'pink', texto: 'Tengo una ruta segura. Puedo iniciar en 20 minutos.' }],
    },
    {
      id: 'BL-2014', title: 'Rastrear señal fantasma', zone: 'Zona industrial', specialty: 'Rastreo',
      reward: 5900, status: 'CERRADA', applicants: 7, tone: 'pink',
      image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520',
      hunter: 'VANTA_K',
      messages: [{ autor: 'VANTA_K', iniciales: 'VK', tono: 'cyan', texto: 'Señal localizada. Entrego el reporte ahora.' }],
    },
  ];

  hunters: Hunter[] = [
    { alias: 'VANTA_K', initials: 'VK', zone: 'Distrito Centro', specialty: 'Recuperación', rating: '4.9', jobs: 87, match: 98, tone: 'cyan' },
    { alias: 'RØNIN_X', initials: 'RX', zone: 'Puerto', specialty: 'Protección', rating: '4.8', jobs: 72, match: 92, tone: 'pink' },
    { alias: 'NIGHTMARE', initials: 'NM', zone: 'Zona industrial', specialty: 'Rastreo', rating: '4.7', jobs: 64, match: 89, tone: 'amber' },
  ];

  // ---------- Estado de la vista ----------
  filtro = 'TODAS';
  selectedId = 'BL-2048';
  selectedHunter = 'VANTA_K';
  formError = '';
  pendiente: { accion: Accion; texto: string } | null = null;
  calificacion = 0;
  calificadas: Record<string, number> = {};
  toast = '';

  // ---------- Getters ----------
  get filtradas(): Mission[] {
    const q = this.query.toLowerCase();
    return this.missions.filter(
      (m) =>
        (this.filtro === 'TODAS' || m.status === this.filtro) &&
        `${m.title} ${m.zone} ${m.specialty}`.toLowerCase().includes(q),
    );
  }

  get selected(): Mission {
    return this.missions.find((m) => m.id === this.selectedId) ?? this.missions[0];
  }

  get puedeAsignar(): boolean {
    return this.selected.status === 'PUBLICADA' && !!this.selectedHunter;
  }

  get puedeCancelar(): boolean {
    return ['PUBLICADA', 'ASIGNADA', 'EN CURSO'].includes(this.selected.status);
  }

  get puedeCerrar(): boolean {
    return this.selected.status === 'EN CURSO';
  }

  get chatActivo(): boolean {
    return !!this.selected.hunter && ['ASIGNADA', 'EN CURSO'].includes(this.selected.status);
  }

  get yaCalificada(): boolean {
    return this.selected.id in this.calificadas;
  }

  get valorEstrellas(): number {
    return this.yaCalificada ? this.calificadas[this.selected.id] : this.calificacion;
  }

  // ---------- Utilidades ----------
  formatear(valor: number): string {
    return valor.toLocaleString('es-CO');
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  seleccionar(mission: Mission): void {
    this.selectedId = mission.id;
    this.calificacion = 0;
  }

  // ---------- Línea de tiempo ----------
  private pasosCompletados(m: Mission): number {
    const mapa: Record<Estado, number> = {
      PUBLICADA: 1,
      ASIGNADA: 2,
      'EN CURSO': 3,
      CERRADA: 4,
      CANCELADA: 1,
    };
    return mapa[m.status];
  }

  estaCompleto(indice: number): boolean {
    return indice < this.pasosCompletados(this.selected);
  }

  subtituloPaso(indice: number): string {
    if (this.selected.status === 'CANCELADA' && indice > 0) return 'MISIÓN CANCELADA';
    const completados = this.pasosCompletados(this.selected);
    if (indice < completados) return 'COMPLETADO';
    return indice === completados ? 'PENDIENTE' : 'EN ESPERA';
  }

  // ---------- Publicar misión ----------
  publicar(
    event: Event,
    titulo: HTMLInputElement,
    zona: HTMLSelectElement,
    especialidad: HTMLSelectElement,
    recompensa: HTMLInputElement,
  ): void {
    event.preventDefault();
    const monto = Number(recompensa.value);

    if (!titulo.value.trim() || !zona.value || !especialidad.value || !(monto > 0)) {
      this.formError = 'Completa el título, la zona, la especialidad y una recompensa mayor a cero.';
      return;
    }
    if (monto > this.saldoDisponible) {
      this.formError = 'Saldo insuficiente para retener esa recompensa.';
      return;
    }

    const nueva: Mission = {
      id: `BL-${this.siguienteId++}`,
      title: titulo.value.trim(),
      zone: zona.value,
      specialty: especialidad.value,
      reward: monto,
      status: 'PUBLICADA',
      applicants: 0,
      tone: 'cyan',
      image: this.imagenPorDefecto,
      messages: [],
    };

    this.missions = [nueva, ...this.missions];
    this.saldoDisponible -= monto;
    this.selectedId = nueva.id;
    this.filtro = 'TODAS';
    this.formError = '';

    titulo.value = '';
    zona.value = '';
    especialidad.value = '';
    recompensa.value = '';
    this.notify('Misión publicada y créditos retenidos');
  }

  // ---------- Acciones sobre la misión (con confirmación) ----------
  pedir(accion: Accion): void {
    const m = this.selected;
    const textos: Record<Accion, string> = {
      asignar: `Vas a asignar la misión ${m.id} a ${this.selectedHunter}.`,
      cancelar: 'Se cancelará la misión y el monto retenido volverá a tu saldo.',
      cerrar: 'Se liberará el pago al cazarrecompensas y la misión quedará cerrada.',
    };
    this.pendiente = { accion, texto: textos[accion] };
  }

  cancelarConfirmacion(): void {
    this.pendiente = null;
  }

  confirmar(): void {
    if (!this.pendiente) return;
    const m = this.selected;

    switch (this.pendiente.accion) {
      case 'asignar':
        m.status = 'ASIGNADA';
        m.hunter = this.selectedHunter;
        this.notify(`Misión asignada a ${this.selectedHunter}`);
        break;
      case 'cancelar':
        m.status = 'CANCELADA';
        this.saldoDisponible += m.reward;
        this.notify('Misión cancelada y saldo reembolsado');
        break;
      case 'cerrar':
        m.status = 'CERRADA';
        this.notify('Cierre confirmado y pago liberado');
        break;
    }
    this.pendiente = null;
  }

  // ---------- Chat ----------
  enviarMensaje(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    const texto = input.value.trim();
    if (!texto || !this.chatActivo) return;
    this.selected.messages = [
      ...this.selected.messages,
      { autor: this.miAlias, iniciales: this.miIniciales, tono: 'cyan', texto },
    ];
    input.value = '';
  }

  // ---------- Calificación ----------
  enviarCalificacion(event: Event, comentario: HTMLInputElement): void {
    event.preventDefault();
    if (this.yaCalificada) return;
    if (this.calificacion === 0) {
      this.notify('Elige una calificación de estrellas');
      return;
    }
    this.calificadas = { ...this.calificadas, [this.selected.id]: this.calificacion };
    comentario.value = '';
    this.notify('Calificación enviada');
  }

  private notify(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2800);
  }
}
