import { Component, ElementRef, Input, ViewChild } from '@angular/core';

/* =====================================================================
 * MODELOS
 *
 * Cada tarjeta del feed = una publicación (MongoDB) enlazada a una misión
 * (MySQL). El front trabaja con un solo objeto `Mision` que la API arma
 * juntando ambas fuentes:
 *
 *   MySQL · Misión ......... id, autor, zona, especialidad, titulo,
 *                            descripcion, recompensa, estado, creadaEn,
 *                            cazador, postulaciones
 *   MongoDB · publicaciones . etiquetas, reacciones, comentarios
 *                            (texto = descripcion, misionId = id)
 *   MongoDB · mensajes_chat . mensajes
 *
 * Cuando exista el back, muévelas a models/mision.ts y reemplaza los datos
 * de ejemplo por un MisionesService.
 * ===================================================================== */
export type Estado = 'PUBLICADA' | 'ASIGNADA' | 'EN_CURSO' | 'CERRADA' | 'CANCELADA';
export type Tono = 'cyan' | 'pink' | 'amber';
export type Accion = 'asignar' | 'cancelar' | 'cerrar';
export type Vista = 'RED' | 'MIAS';

export interface Autor {
  alias: string;
  iniciales: string;
}

/** Cazarrecompensas con los datos que muestra la interfaz (join en MySQL). */
export interface Cazador {
  alias: string;
  iniciales: string;
  zona: string;
  especialidad: string;
  rating: string; // fn_reputacion
  trabajos: number; // fn_misiones_completadas
  match: number; // fn_puntaje_match
}

/** MySQL · Postulación (fecha, mensaje) sobre un cazador. */
export interface Postulacion extends Cazador {
  mensaje: string;
  fecha: string;
}

/** MongoDB · mensajes_chat (un documento por mensaje, con misionId). */
export interface Mensaje {
  autor: string;
  iniciales: string;
  texto: string;
}

/** MongoDB · comentarios embebidos en la publicación. */
export interface Comentario {
  autor: string;
  iniciales: string;
  texto: string;
  fecha: string;
}

export interface Mision {
  id: string;
  autor: Autor;
  especialidad: string;
  zona: string;
  titulo: string;
  recompensa: number; // monto_recompensa
  descripcion: string;
  estado: Estado;
  cazador?: string;
  postulaciones: Postulacion[];
  creadaEn: string; // fecha_publicacion (ISO)
  // --- MongoDB · publicaciones ---
  etiquetas: string[];
  reacciones: Record<string, number>; // conteo por tipo
  miReaccion?: boolean;
  comentarios: Comentario[];
  // --- MongoDB · mensajes_chat ---
  mensajes: Mensaje[];
}

/**
 * Solo ayuda de interfaz (no existe en la base): arma la descripción a
 * partir de preguntas. Se identifica por el nombre de la especialidad.
 */
export interface CampoPlantilla {
  clave: string;
  etiqueta: string;
}
export interface Plantilla {
  especialidad: string;
  texto: string; // usa {clave} y {zona}
  campos: CampoPlantilla[];
}

const ago = (minutos: number): string => new Date(Date.now() - minutos * 60000).toISOString();

@Component({
  selector: 'app-misiones',
  standalone: false,
  styleUrl: './misiones.component.css',
  templateUrl: './misiones.component.html',
})
export class MisionesComponent {
  /** Texto de búsqueda (opcional): si tu topbar tiene buscador, pásalo con [query]="..." */
  @Input() query = '';
  @ViewChild('detalle') detalle?: ElementRef<HTMLElement>;

  // ---------- Datos de ejemplo (reemplazar por servicios cuando exista el back) ----------
  readonly miAlias = 'AXIOM_47';
  readonly miIniciales = 'AX';
  readonly stars: number[] = [1, 2, 3, 4, 5];
  readonly pasos: string[] = ['Publicada', 'Cazador asignado', 'En curso', 'Cierre confirmado'];
  readonly filtros: string[] = ['TODAS', 'PUBLICADA', 'ASIGNADA', 'EN_CURSO', 'CERRADA'];
  readonly vistas: { id: Vista; texto: string }[] = [
    { id: 'RED', texto: 'RED' },
    { id: 'MIAS', texto: 'MIS MISIONES' },
  ];
  readonly motivos: string[] = ['Contenido inapropiado', 'Fraude o engaño', 'Suplantación'];

  /** Catálogos: vienen de MySQL (Zona y Especialidad, gestionadas por el administrador). */
  readonly zonas: string[] = ['Distrito Centro', 'Puerto', 'Zona industrial', 'Suburbios'];
  readonly especialidades: string[] = ['Recuperación', 'Protección', 'Escolta', 'Venganza', 'Sabotaje'];

  readonly plantillas: Plantilla[] = [
    {
      especialidad: 'Recuperación',
      texto: 'Me quitaron {objeto} en {zona}. Última vez visto: {cuando}. Necesito {necesito}.',
      campos: [
        { clave: 'objeto', etiqueta: '¿Qué perdiste?' },
        { clave: 'cuando', etiqueta: '¿Cuándo fue la última vez?' },
        { clave: 'necesito', etiqueta: '¿Qué necesitas que haga el cazador?' },
      ],
    },
    {
      especialidad: 'Protección',
      texto: 'Necesito protección en {zona} para {quien}. Durante {cuando}. Riesgo principal: {riesgo}.',
      campos: [
        { clave: 'quien', etiqueta: '¿A quién o qué hay que proteger?' },
        { clave: 'cuando', etiqueta: '¿Cuándo y por cuánto tiempo?' },
        { clave: 'riesgo', etiqueta: '¿Cuál es el riesgo principal?' },
      ],
    },
    {
      especialidad: 'Escolta',
      texto: 'Necesito escolta desde {origen} hasta {destino}. Salida: {cuando}. Llevo {carga}.',
      campos: [
        { clave: 'origen', etiqueta: '¿Desde dónde sales?' },
        { clave: 'destino', etiqueta: '¿Hasta dónde vas?' },
        { clave: 'cuando', etiqueta: '¿Cuándo sales?' },
        { clave: 'carga', etiqueta: '¿Qué llevas?' },
      ],
    },
    {
      especialidad: 'Venganza',
      texto: 'Quiero cobrarme una ofensa de {objetivo}. Pasó en {zona} {cuando}. Lo que espero: {necesito}.',
      campos: [
        { clave: 'objetivo', etiqueta: '¿Quién te ofendió?' },
        { clave: 'cuando', etiqueta: '¿Cuándo pasó?' },
        { clave: 'necesito', etiqueta: '¿Qué esperas conseguir?' },
      ],
    },
    {
      especialidad: 'Sabotaje',
      texto: 'Necesito inhabilitar {objetivo} en {zona}. Plazo: {cuando}. Condición: {condicion}.',
      campos: [
        { clave: 'objetivo', etiqueta: '¿Qué hay que inhabilitar?' },
        { clave: 'cuando', etiqueta: '¿Cuál es el plazo?' },
        { clave: 'condicion', etiqueta: '¿Qué condición debe cumplirse?' },
      ],
    },
  ];

  /** Si el administrador crea una especialidad nueva sin plantilla, se usa esta. */
  private readonly plantillaGenerica: Plantilla = {
    especialidad: '',
    texto: 'Necesito ayuda en {zona}: {detalle}',
    campos: [{ clave: 'detalle', etiqueta: '¿Qué necesitas?' }],
  };

  /** Cazadores disponibles. Mock de lo que devolvería sp_sugerir_cazarrecompensas. */
  private readonly cazadores: Cazador[] = [
    { alias: 'VANTA_K', iniciales: 'VK', zona: 'Distrito Centro', especialidad: 'Recuperación', rating: '4.9', trabajos: 87, match: 0 },
    { alias: 'RØNIN_X', iniciales: 'RX', zona: 'Puerto', especialidad: 'Protección', rating: '4.8', trabajos: 72, match: 0 },
    { alias: 'NIGHTMARE', iniciales: 'NM', zona: 'Zona industrial', especialidad: 'Sabotaje', rating: '4.7', trabajos: 64, match: 0 },
    { alias: 'SPECTRE_8', iniciales: 'S8', zona: 'Suburbios', especialidad: 'Venganza', rating: '4.6', trabajos: 41, match: 0 },
  ];

  private siguienteId = 2060;
  saldoDisponible = 42850;

  misiones: Mision[] = [
    {
      id: 'BL-2048',
      autor: { alias: 'AXIOM_47', iniciales: 'AX' },
      especialidad: 'Recuperación', zona: 'Distrito Centro',
      titulo: 'Recuperar créditos del Clan Kuro', recompensa: 12800,
      descripcion: 'Me quitaron créditos en Distrito Centro. Última vez visto: hace 3 días. Necesito que alguien negocie la devolución.',
      estado: 'PUBLICADA',
      postulaciones: [
        { alias: 'VANTA_K', iniciales: 'VK', zona: 'Distrito Centro', especialidad: 'Recuperación', rating: '4.9', trabajos: 87, match: 98, mensaje: 'Conozco la zona.', fecha: ago(40) },
        { alias: 'NIGHTMARE', iniciales: 'NM', zona: 'Zona industrial', especialidad: 'Sabotaje', rating: '4.7', trabajos: 64, match: 61, mensaje: 'Puedo empezar hoy.', fecha: ago(25) },
      ],
      creadaEn: ago(95),
      etiquetas: ['#RECUPERACIÓN', '#DISTRITO_CENTRO', '#CLAN_KURO'],
      reacciones: { apoyo: 14 },
      comentarios: [{ autor: 'KIRA_09', iniciales: 'K9', texto: '¿Hay testigos del robo?', fecha: ago(30) }],
      mensajes: [],
    },
    {
      id: 'BL-2039',
      autor: { alias: 'AXIOM_47', iniciales: 'AX' },
      especialidad: 'Escolta', zona: 'Puerto',
      titulo: 'Escolta hacia el Puerto Gris', recompensa: 8400,
      descripcion: 'Necesito escolta desde Distrito Centro hasta Puerto Gris. Salida: esta noche. Llevo un contenedor sellado.',
      estado: 'EN_CURSO', cazador: 'RØNIN_X',
      postulaciones: [
        { alias: 'RØNIN_X', iniciales: 'RX', zona: 'Puerto', especialidad: 'Protección', rating: '4.8', trabajos: 72, match: 92, mensaje: 'Tengo una ruta segura.', fecha: ago(300) },
      ],
      creadaEn: ago(400),
      etiquetas: ['#ESCOLTA', '#PUERTO'],
      reacciones: { apoyo: 9 },
      comentarios: [],
      mensajes: [{ autor: 'RØNIN_X', iniciales: 'RX', texto: 'Tengo una ruta segura. Puedo iniciar en 20 minutos.' }],
    },
    {
      id: 'BL-2014',
      autor: { alias: 'AXIOM_47', iniciales: 'AX' },
      especialidad: 'Venganza', zona: 'Zona industrial',
      titulo: 'Cobrar una deuda al Clan Hoshi', recompensa: 5900,
      descripcion: 'Quiero cobrarme una ofensa de un lugarteniente del Clan Hoshi. Pasó en Zona industrial la semana pasada. Lo que espero: que pague lo que debe.',
      estado: 'CERRADA', cazador: 'VANTA_K',
      postulaciones: [
        { alias: 'VANTA_K', iniciales: 'VK', zona: 'Distrito Centro', especialidad: 'Recuperación', rating: '4.9', trabajos: 87, match: 58, mensaje: 'Lo tomo.', fecha: ago(3000) },
      ],
      creadaEn: ago(3200),
      etiquetas: ['#VENGANZA', '#ZONA_INDUSTRIAL'],
      reacciones: { apoyo: 31 },
      comentarios: [],
      mensajes: [{ autor: 'VANTA_K', iniciales: 'VK', texto: 'Listo. Entrego el reporte ahora.' }],
    },
    {
      id: 'BL-2051',
      autor: { alias: 'KIRA_09', iniciales: 'K9' },
      especialidad: 'Recuperación', zona: 'Zona industrial',
      titulo: 'Cargamento perdido en el anillo industrial', recompensa: 9600,
      descripcion: 'Me quitaron un cargamento en Zona industrial. Última vez visto: ayer por la noche. Necesito alguien que conozca los accesos del sector.',
      estado: 'PUBLICADA',
      postulaciones: [],
      creadaEn: ago(12),
      etiquetas: ['#RECUPERACIÓN', '#ZONA_INDUSTRIAL'],
      reacciones: { apoyo: 28 },
      comentarios: [],
      mensajes: [],
    },
    {
      id: 'BL-2046',
      autor: { alias: 'NOVA_12', iniciales: 'N1' },
      especialidad: 'Protección', zona: 'Puerto',
      titulo: 'Custodia de testigo en el muelle 4', recompensa: 7200,
      descripcion: 'Necesito protección en Puerto para un testigo clave. Durante las próximas 48 horas. Riesgo principal: seguimiento de un clan rival.',
      estado: 'PUBLICADA',
      postulaciones: [],
      creadaEn: ago(34),
      etiquetas: ['#PROTECCIÓN', '#PUERTO'],
      reacciones: { apoyo: 6 },
      comentarios: [{ autor: 'VANTA_K', iniciales: 'VK', texto: '¿Cuántas personas necesitan cobertura?', fecha: ago(20) }],
      mensajes: [],
    },
  ];

  // ---------- Estado de la vista ----------
  vista: Vista = 'RED';
  filtro = 'TODAS';
  selectedId = 'BL-2048';
  cazadorSel = '';
  formError = '';
  pendiente: { accion: Accion; texto: string } | null = null;
  reportando: Mision | null = null;
  calificacion = 0;
  calificadas: Record<string, number> = {};
  toast = '';

  // ---------- Estado del composer ----------
  tituloNuevo = '';
  especialidadSel = '';
  zonaSel = '';
  recompensaNueva = '';
  etiquetasNuevas = '';
  valores: Record<string, string> = {};

  constructor() {
    this.cazadorSel = this.selected?.postulaciones[0]?.alias ?? '';
  }

  // ---------- Getters ----------
  get visibles(): Mision[] {
    const q = this.query.toLowerCase();
    return this.misiones.filter(
      (m) =>
        (this.vista === 'RED' || this.esMia(m)) &&
        (this.filtro === 'TODAS' || m.estado === this.filtro) &&
        `${m.titulo} ${m.descripcion} ${m.zona} ${m.especialidad} ${m.autor.alias} ${m.etiquetas.join(' ')}`
          .toLowerCase()
          .includes(q),
    );
  }

  get selected(): Mision | undefined {
    return this.misiones.find((m) => m.id === this.selectedId);
  }

  get puedeAsignar(): boolean {
    const m = this.selected;
    return !!m && this.esMia(m) && m.estado === 'PUBLICADA' && m.postulaciones.some((p) => p.alias === this.cazadorSel);
  }

  get puedeCancelar(): boolean {
    const m = this.selected;
    return !!m && this.esMia(m) && ['PUBLICADA', 'ASIGNADA', 'EN_CURSO'].includes(m.estado);
  }

  get puedeCerrar(): boolean {
    const m = this.selected;
    return !!m && this.esMia(m) && m.estado === 'EN_CURSO';
  }

  get chatActivo(): boolean {
    const m = this.selected;
    return !!m && this.esMia(m) && !!m.cazador && ['ASIGNADA', 'EN_CURSO'].includes(m.estado);
  }

  get yaCalificada(): boolean {
    return !!this.selected && this.selected.id in this.calificadas;
  }

  get valorEstrellas(): number {
    return this.selected && this.yaCalificada ? this.calificadas[this.selected.id] : this.calificacion;
  }

  // ---------- Composer: plantilla ----------
  get plantillaActual(): Plantilla | undefined {
    if (!this.especialidadSel) return undefined;
    return this.plantillas.find((p) => p.especialidad === this.especialidadSel) ?? this.plantillaGenerica;
  }

  /** Texto final que se guardará como `descripcion`, con huecos si falta algo. */
  get descripcionPrevia(): string {
    const p = this.plantillaActual;
    if (!p) return '';
    return p.texto.replace(/\{(\w+)\}/g, (_: string, clave: string) => {
      if (clave === 'zona') return this.zonaSel || '[zona]';
      const valor = this.valores[clave]?.trim();
      const etiqueta = p.campos.find((c) => c.clave === clave)?.etiqueta ?? clave;
      return valor || `[${etiqueta}]`;
    });
  }

  elegirEspecialidad(valor: string): void {
    this.especialidadSel = valor;
    this.valores = {};
  }

  /** #ESPECIALIDAD y #ZONA automáticas + las que escriba el usuario. */
  private armarEtiquetas(especialidad: string, zona: string, extra: string): string[] {
    const limpiar = (t: string) => t.replace(/^#+/, '').trim().toUpperCase().replace(/\s+/g, '_');
    const propias = extra.split(/[\s,]+/).map(limpiar).filter(Boolean);
    return [...new Set([limpiar(especialidad), limpiar(zona), ...propias].map((t) => `#${t}`))];
  }

  // ---------- Utilidades ----------
  formatear(valor: number): string {
    return valor.toLocaleString('es-CO');
  }

  /** La base usa EN_CURSO; en pantalla se muestra con espacio. */
  etiquetaEstado(estado: string): string {
    return estado.replace('_', ' ');
  }

  statusClass(estado: string): string {
    return estado.toLowerCase().replace('_', '-');
  }

  esMia(m: Mision): boolean {
    return m.autor.alias === this.miAlias;
  }

  contar(vista: Vista): number {
    return vista === 'RED' ? this.misiones.length : this.misiones.filter((m) => this.esMia(m)).length;
  }

  porId(_: number, m: Mision): string {
    return m.id;
  }

  /** Color de la tarjeta según el estado de la misión. */
  tono(m: Mision): Tono {
    if (m.estado === 'PUBLICADA') return 'cyan';
    if (m.estado === 'ASIGNADA' || m.estado === 'EN_CURSO') return 'amber';
    return 'pink';
  }

  /** Color estable del avatar a partir del alias. */
  tonoAutor(alias: string): Tono {
    const tonos: Tono[] = ['cyan', 'pink', 'amber'];
    const suma = [...alias].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return tonos[suma % tonos.length];
  }

  hace(iso: string): string {
    const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (min < 1) return 'AHORA';
    if (min < 60) return `HACE ${min} MIN`;
    const horas = Math.floor(min / 60);
    if (horas < 24) return `HACE ${horas} H`;
    return `HACE ${Math.floor(horas / 24)} D`;
  }

  comentariosAbiertos(m: Mision): boolean {
    return m.estado !== 'CERRADA' && m.estado !== 'CANCELADA';
  }

  /**
   * Mock de sp_sugerir_cazarrecompensas: puntaje por zona (40), especialidad (40)
   * y reputación (hasta 20). Reemplazar por la llamada real al back.
   */
  sugeridosDe(m: Mision): Cazador[] {
    return this.cazadores
      .filter((c) => !m.postulaciones.some((p) => p.alias === c.alias))
      .map((c) => ({
        ...c,
        match:
          (c.zona === m.zona ? 40 : 0) + (c.especialidad === m.especialidad ? 40 : 0) + Math.round(parseFloat(c.rating) * 4),
      }))
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);
  }

  seleccionar(m: Mision): void {
    this.selectedId = m.id;
    this.calificacion = 0;
    this.cazadorSel = m.postulaciones[0]?.alias ?? '';
    if (window.innerWidth <= 1100) {
      this.detalle?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ---------- Reacciones (MongoDB · publicaciones) ----------
  totalReacciones(m: Mision): number {
    return Object.values(m.reacciones).reduce((suma, n) => suma + n, 0);
  }

  reaccionar(m: Mision, event: Event): void {
    event.stopPropagation();
    m.miReaccion = !m.miReaccion;
    const actual = m.reacciones['apoyo'] ?? 0;
    m.reacciones = { ...m.reacciones, apoyo: Math.max(0, actual + (m.miReaccion ? 1 : -1)) };
    if (m.miReaccion) this.notify('Reacción registrada');
  }

  // ---------- Línea de tiempo ----------
  private pasosCompletados(m: Mision): number {
    const mapa: Record<Estado, number> = {
      PUBLICADA: 1,
      ASIGNADA: 2,
      EN_CURSO: 3,
      CERRADA: 4,
      CANCELADA: 1,
    };
    return mapa[m.estado];
  }

  estaCompleto(m: Mision, indice: number): boolean {
    return indice < this.pasosCompletados(m);
  }

  subtituloPaso(m: Mision, indice: number): string {
    if (m.estado === 'CANCELADA' && indice > 0) return 'MISIÓN CANCELADA';
    const completados = this.pasosCompletados(m);
    if (indice < completados) return 'COMPLETADO';
    return indice === completados ? 'PENDIENTE' : 'EN ESPERA';
  }

  // ---------- Publicar misión ----------
  publicar(event: Event): void {
    event.preventDefault();
    const p = this.plantillaActual;
    const monto = Number(this.recompensaNueva);

    if (!this.tituloNuevo.trim() || !this.zonaSel || !p || !(monto > 0)) {
      this.formError = 'Completa el título, la especialidad, la zona y una recompensa mayor a cero.';
      return;
    }
    if (p.campos.some((c) => !this.valores[c.clave]?.trim())) {
      this.formError = 'Responde todas las preguntas de la plantilla para armar la descripción.';
      return;
    }
    if (monto > this.saldoDisponible) {
      this.formError = 'Saldo insuficiente para retener esa recompensa.';
      return;
    }

    // Con el back: 1) sp_publicar_mision (MySQL) valida saldo y retiene el monto;
    //              2) se inserta la publicación en MongoDB con el id de la misión.
    const nueva: Mision = {
      id: `BL-${this.siguienteId++}`,
      autor: { alias: this.miAlias, iniciales: this.miIniciales },
      especialidad: this.especialidadSel,
      zona: this.zonaSel,
      titulo: this.tituloNuevo.trim(),
      recompensa: monto,
      descripcion: this.descripcionPrevia,
      estado: 'PUBLICADA',
      postulaciones: [],
      creadaEn: new Date().toISOString(),
      etiquetas: this.armarEtiquetas(this.especialidadSel, this.zonaSel, this.etiquetasNuevas),
      reacciones: {},
      comentarios: [],
      mensajes: [],
    };

    this.misiones = [nueva, ...this.misiones];
    this.saldoDisponible -= monto;
    this.selectedId = nueva.id;
    this.cazadorSel = '';
    this.vista = 'MIAS';
    this.filtro = 'TODAS';
    this.formError = '';

    this.tituloNuevo = '';
    this.especialidadSel = '';
    this.zonaSel = '';
    this.recompensaNueva = '';
    this.etiquetasNuevas = '';
    this.valores = {};
    this.notify('Misión publicada y créditos retenidos');
  }

  // ---------- Acciones sobre la misión (con confirmación) ----------
  pedir(accion: Accion): void {
    const m = this.selected;
    if (!m) return;
    const textos: Record<Accion, string> = {
      asignar: `Vas a asignar la misión ${m.id} a ${this.cazadorSel}. Las demás postulaciones serán rechazadas.`,
      cancelar: 'Se cancelará la misión y el monto retenido volverá a tu saldo.',
      cerrar: 'Se liberará el pago al cazarrecompensas y la misión quedará cerrada.',
    };
    this.pendiente = { accion, texto: textos[accion] };
  }

  cancelarConfirmacion(): void {
    this.pendiente = null;
  }

  /** Con el back: sp_asignar_cazarrecompensas / sp_cancelar_mision / sp_cerrar_mision. */
  confirmar(): void {
    const m = this.selected;
    if (!this.pendiente || !m) return;

    switch (this.pendiente.accion) {
      case 'asignar':
        m.estado = 'ASIGNADA';
        m.cazador = this.cazadorSel;
        this.notify(`Misión asignada a ${this.cazadorSel}`);
        break;
      case 'cancelar':
        m.estado = 'CANCELADA';
        this.saldoDisponible += m.recompensa;
        this.notify('Misión cancelada y saldo reembolsado');
        break;
      case 'cerrar':
        m.estado = 'CERRADA';
        this.notify('Cierre confirmado y pago liberado');
        break;
    }
    this.pendiente = null;
  }

  // ---------- Chat privado (dueño ↔ cazador asignado) ----------
  enviarMensaje(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    const m = this.selected;
    const texto = input.value.trim();
    if (!m || !texto || !this.chatActivo) return;
    m.mensajes = [...m.mensajes, { autor: this.miAlias, iniciales: this.miIniciales, texto }];
    input.value = '';
  }

  // ---------- Comentarios públicos ----------
  enviarComentario(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    const m = this.selected;
    const texto = input.value.trim();
    if (!m || !texto || !this.comentariosAbiertos(m)) return;
    m.comentarios = [
      ...m.comentarios,
      { autor: this.miAlias, iniciales: this.miIniciales, texto, fecha: new Date().toISOString() },
    ];
    input.value = '';
    this.notify('Comentario añadido');
  }

  // ---------- Calificación ----------
  enviarCalificacion(event: Event, comentario: HTMLInputElement): void {
    event.preventDefault();
    const m = this.selected;
    if (!m || this.yaCalificada) return;
    if (this.calificacion === 0) {
      this.notify('Elige una calificación de estrellas');
      return;
    }
    this.calificadas = { ...this.calificadas, [m.id]: this.calificacion };
    comentario.value = '';
    this.notify('Calificación enviada');
  }

  // ---------- Reporte (tabla Reporte en MySQL, guarda el id de la publicación) ----------
  abrirReporte(m: Mision, event: Event): void {
    event.stopPropagation();
    this.reportando = m;
  }

  cerrarReporte(): void {
    this.reportando = null;
  }

  enviarReporte(event: Event): void {
    event.preventDefault();
    this.reportando = null;
    this.notify('Reporte enviado a moderación');
  }

  private notify(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2800);
  }
}