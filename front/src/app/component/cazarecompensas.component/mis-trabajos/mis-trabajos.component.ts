import { Component } from '@angular/core';

type Estado = 'POSTULADA' | 'ASIGNADA' | 'EN CURSO' | 'CERRADA';
type Tono = 'cyan' | 'pink' | 'amber';

interface Mensaje {
  autor: string;
  iniciales: string;
  tono: Tono;
  texto: string;
}

interface Job {
  id: string;
  title: string;
  zone: string;
  specialty: string;
  reward: number;
  status: Estado;
  tone: Tono;
  image: string;
  client: string;
  messages: Mensaje[];
}

@Component({
  selector: 'app-mis-trabajos',
  standalone: false,
  styleUrl: './mis-trabajos.component.css',
  templateUrl: './mis-trabajos.component.html',
})
export class MisTrabajosComponent {
  // Datos de ejemplo: reemplazar por el servicio cuando exista el back
  readonly cero = 0;
  readonly miAlias = 'AXIOM_47';
  readonly miIniciales = 'AX';
  readonly pestanas: string[] = ['POSTULACIONES', 'ASIGNADAS', 'EN CURSO', 'CERRADAS'];
  readonly pasos: string[] = ['Postulación enviada', 'Misión asignada', 'En curso', 'Cierre confirmado'];

  private readonly estadoPorPestana: Record<string, Estado> = {
    POSTULACIONES: 'POSTULADA',
    ASIGNADAS: 'ASIGNADA',
    'EN CURSO': 'EN CURSO',
    CERRADAS: 'CERRADA',
  };

  jobs: Job[] = [
    {
      id: 'BL-2048', title: 'Recuperar créditos del Clan Kuro', zone: 'Distrito Centro', specialty: 'Recuperación',
      reward: 12800, status: 'POSTULADA', tone: 'cyan', client: 'KIRA_09',
      image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520',
      messages: [],
    },
    {
      id: 'BL-2053', title: 'Escolta nocturna en los suburbios', zone: 'Suburbios', specialty: 'Escolta',
      reward: 6300, status: 'POSTULADA', tone: 'pink', client: 'MARA_V',
      image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520',
      messages: [],
    },
    {
      id: 'BL-2051', title: 'Protección para cruce de frontera', zone: 'Puerto', specialty: 'Protección',
      reward: 8400, status: 'ASIGNADA', tone: 'amber', client: 'GHOST_77',
      image: 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520',
      messages: [{ autor: 'GHOST_77', iniciales: 'G7', tono: 'pink', texto: 'Quedas asignado. Avísame cuando estés listo para iniciar.' }],
    },
    {
      id: 'BL-2039', title: 'Escolta hacia el Puerto Gris', zone: 'Puerto', specialty: 'Protección',
      reward: 8400, status: 'EN CURSO', tone: 'amber', client: 'KIRA_09',
      image: 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520',
      messages: [{ autor: 'KIRA_09', iniciales: 'K9', tono: 'amber', texto: 'Te espero en el muelle. Confirma cuando salgas.' }],
    },
    {
      id: 'BL-2014', title: 'Rastrear señal fantasma', zone: 'Zona industrial', specialty: 'Rastreo',
      reward: 5900, status: 'CERRADA', tone: 'pink', client: 'MARA_V',
      image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520',
      messages: [{ autor: 'MARA_V', iniciales: 'MV', tono: 'cyan', texto: 'Trabajo recibido. Pago liberado, gracias.' }],
    },
  ];

  pestana = 'POSTULACIONES';
  selectedId = 'BL-2048';
  pendiente: Job | null = null;
  toast = '';

  // ---------- Getters ----------
  get lista(): Job[] {
    return this.jobs.filter((j) => j.status === this.estadoPorPestana[this.pestana]);
  }

  get selected(): Job {
    return this.jobs.find((j) => j.id === this.selectedId) ?? this.jobs[0];
  }

  get tieneCanal(): boolean {
    return ['ASIGNADA', 'EN CURSO', 'CERRADA'].includes(this.selected.status);
  }

  get chatActivo(): boolean {
    return ['ASIGNADA', 'EN CURSO'].includes(this.selected.status);
  }

  // ---------- Utilidades ----------
  contar(pestana: string): number {
    return this.jobs.filter((j) => j.status === this.estadoPorPestana[pestana]).length;
  }

  formatear(valor: number): string {
    return valor.toLocaleString('es-CO');
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  textoAccion(job: Job): string {
    if (job.status === 'ASIGNADA') return 'INICIAR MISIÓN';
    if (job.status === 'EN CURSO') return 'ABRIR CANAL';
    return 'VER DETALLE';
  }

  // ---------- Pestañas y selección ----------
  cambiarPestana(pestana: string): void {
    this.pestana = pestana;
    const primero = this.lista[0];
    if (primero) this.selectedId = primero.id;
  }

  seleccionar(job: Job): void {
    this.selectedId = job.id;
  }

  // ---------- Línea de tiempo ----------
  private pasosCompletados(job: Job): number {
    const mapa: Record<Estado, number> = { POSTULADA: 1, ASIGNADA: 2, 'EN CURSO': 3, CERRADA: 4 };
    return mapa[job.status];
  }

  estaCompleto(indice: number): boolean {
    return indice < this.pasosCompletados(this.selected);
  }

  subtituloPaso(indice: number): string {
    const completados = this.pasosCompletados(this.selected);
    if (indice < completados) return 'COMPLETADO';
    return indice === completados ? 'PENDIENTE' : 'EN ESPERA';
  }

  // ---------- Acción de la tarjeta ----------
  accion(event: Event, job: Job, mensaje: HTMLInputElement): void {
    event.stopPropagation();
    this.selectedId = job.id;

    if (job.status === 'ASIGNADA') {
      this.pendiente = job;
    } else if (job.status === 'EN CURSO') {
      setTimeout(() => mensaje.focus());
    }
  }

  cancelarInicio(): void {
    this.pendiente = null;
  }

  confirmarInicio(): void {
    if (!this.pendiente) return;
    this.pendiente.status = 'EN CURSO';
    this.notify(`Misión ${this.pendiente.id} iniciada`);
    this.pendiente = null;
    this.cambiarPestana('EN CURSO');
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

  private notify(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2800);
  }
}
