import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import { AuthService } from '../../../service/auth.service';
import { Catalogo, CatalogoService } from '../../../service/catalogo.service';
import { BilleteraService } from '../../../service/billetera.service';
import { MisionService, SugerenciaApi } from '../../../service/mision.service';

/* =====================================================================
 * MODELOS
 *
 * Datos relacionales de una misión y sus postulaciones. Las interacciones
 * sociales marcadas abajo dependen de MongoDB y siguen fuera de alcance:
 *
 *   MySQL · Misión ......... id, autor, zona, especialidad, titulo,
 *                            descripcion, recompensa, estado, creadaEn,
 *                            cazador, postulaciones
 *   MongoDB · publicaciones . etiquetas, reacciones, comentarios
 *                            (texto = descripcion, misionId = id)
 *   MongoDB · mensajes_chat . mensajes
 *
 * La pantalla obtiene el ciclo de vida de misiones desde la API Spring.
 * ===================================================================== */
export type Estado = 'PUBLICADA' | 'ASIGNADA' | 'EN_CURSO' | 'CERRADA' | 'CANCELADA';
export type Tono = 'cyan' | 'pink' | 'amber';
export type Accion = 'asignar' | 'cancelar' | 'cerrar';
export type Vista = 'RED' | 'MIAS';

export interface Autor {
  idCuenta: number;
  alias: string;
  iniciales: string;
}

/** Cazarrecompensas con los datos que muestra la interfaz (join en MySQL). */
export interface Cazador {
  idCazarrecompensas: number;
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

@Component({
  selector: 'app-misiones',
  standalone: false,
  styleUrl: './misiones.component.css',
  templateUrl: './misiones.component.html',
})
export class MisionesComponent implements OnInit {
  /** Texto de búsqueda (opcional): si tu topbar tiene buscador, pásalo con [query]="..." */
  @Input() query = '';
  @ViewChild('detalle') detalle?: ElementRef<HTMLElement>;

  // ---------- Datos de sesión y catálogo ----------
  get miAlias(): string { return this.auth.sesion?.alias ?? ''; }
  get miIniciales(): string { return this.miAlias.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase(); }
  readonly stars: number[] = [1, 2, 3, 4, 5];
  readonly pasos: string[] = ['Publicada', 'Cazador asignado', 'En curso', 'Cierre confirmado'];
  readonly filtros: string[] = ['TODAS', 'PUBLICADA', 'ASIGNADA', 'EN_CURSO', 'CERRADA', 'CANCELADA'];
  readonly vistas: { id: Vista; texto: string }[] = [
    { id: 'RED', texto: 'RED' },
    { id: 'MIAS', texto: 'MIS MISIONES' },
  ];
  readonly motivos: string[] = ['Contenido inapropiado', 'Fraude o engaño', 'Suplantación'];

  /** Catálogos: vienen de MySQL (Zona y Especialidad, gestionadas por el administrador). */
  zonas: string[] = [];
  especialidades: string[] = [];
  private zonasApi: Catalogo[] = [];
  private especialidadesApi: Catalogo[] = [];
  cazadores: Cazador[] = [];
  misiones: Mision[] = [];
  cargando = true;
  saldoDisponible = 0;

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

  // ---------- Estado de la vista ----------
  vista: Vista = 'RED';
  filtro = 'TODAS';
  selectedId = '';
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

  constructor(private api: ApiService, private auth: AuthService, private catalogos: CatalogoService, private wallet: BilleteraService, private missionApi: MisionService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    forkJoin({ zonas: this.catalogos.zonas(), especialidades: this.catalogos.especialidades(), misiones: this.api.misiones(), propias: this.api.mias(), wallet: this.wallet.miBilletera() }).subscribe({
      next: ({ zonas, especialidades, misiones, propias, wallet }) => {
        this.zonasApi = zonas; this.especialidadesApi = especialidades;
        this.zonas = zonas.map((x) => x.nombre); this.especialidades = especialidades.map((x) => x.nombre);
        const todos = [...misiones, ...propias].filter((m, i, xs) => xs.findIndex((x) => x.idMision === m.idMision) === i);
        this.misiones = todos.map((m: any) => this.adaptarMision(m));
        this.saldoDisponible = Number(wallet.saldoDisponible);
        this.selectedId = this.misiones[0]?.id ?? '';
        this.cargando = false;
        this.cdr.markForCheck();
        if (this.selected) this.cargarPostulaciones(this.selected);
        const misIds = new Set(this.misiones.filter((m) => this.esMia(m)).map((m) => this.idMision(m)));
        this.api.calificaciones().subscribe({ next: (xs) => { for (const c of xs) if (misIds.has(c.idMision)) this.calificadas[`BL-${c.idMision}`] = c.puntaje; this.cdr.markForCheck(); }, error: () => this.cdr.markForCheck() });
      },
      error: () => { this.cargando = false; this.notify('No se pudieron cargar las misiones. Verifica la conexión con el backend.'); this.cdr.markForCheck(); },
    });
  }

  private adaptarMision(m: any): Mision {
    return { id: `BL-${m.idMision}`, autor: { idCuenta: m.idUsuario, alias: m.aliasUsuario, iniciales: (m.aliasUsuario ?? '').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() }, especialidad: m.especialidad, zona: m.zona, titulo: m.titulo, recompensa: Number(m.montoRecompensa), descripcion: m.descripcion, estado: m.estado, cazador: m.aliasCazarrecompensas ?? undefined, postulaciones: [], creadaEn: m.fechaPublicacion, etiquetas: [], reacciones: {}, comentarios: [], mensajes: [] };
  }

  private idMision(m: Mision): number { return Number(m.id.replace(/^BL-/, '')); }

  private cargarPostulaciones(m: Mision): void {
    const id = this.idMision(m);
    this.api.postulacionesMision(id).subscribe({ next: (xs) => { m.postulaciones = xs.map((p: any) => ({ idCazarrecompensas: p.idCazarrecompensas, alias: p.alias, iniciales: (p.alias ?? '').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase(), zona: '', especialidad: '', rating: '0.0', trabajos: 0, match: p.puntaje ?? 0, mensaje: p.mensaje ?? '', fecha: p.fechaPostulacion })); this.cazadorSel = m.postulaciones[0]?.alias ?? ''; this.cdr.markForCheck(); }, error: () => { this.notify('No se pudieron cargar las postulaciones.'); this.cdr.markForCheck(); } });
    this.missionApi.sugerencias(id).subscribe({ next: (xs: SugerenciaApi[]) => { this.cazadores = xs.map((c) => ({ idCazarrecompensas: c.idCazarrecompensas, alias: c.alias, iniciales: c.alias.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase(), zona: c.zona, especialidad: '', rating: Number(c.reputacion ?? 0).toFixed(1), trabajos: c.misionesCompletadas ?? 0, match: c.puntaje })); this.cdr.markForCheck(); }, error: () => { this.cazadores = []; this.cdr.markForCheck(); } });
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
    return this.cazadores.filter((c) => !m.postulaciones.some((p) => p.alias === c.alias));
  }

  seleccionar(m: Mision): void {
    this.selectedId = m.id;
    this.calificacion = 0;
    this.cazadorSel = m.postulaciones[0]?.alias ?? '';
    this.cargarPostulaciones(m);
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
    this.notify('Las reacciones se habilitarán con la integración de MongoDB.');
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

    const idZona = this.zonasApi.find((z) => z.nombre === this.zonaSel)?.id;
    const idEspecialidad = this.especialidadesApi.find((e) => e.nombre === this.especialidadSel)?.id;
    if (!idZona || !idEspecialidad) { this.formError = 'Selecciona una zona y especialidad vigentes del catálogo.'; return; }
    this.api.publicarMision({ idZona, idEspecialidad, titulo: this.tituloNuevo.trim(), descripcion: this.descripcionPrevia, monto }).subscribe({
      next: (respuesta) => {
        const nueva = this.adaptarMision(respuesta);
        this.misiones = [nueva, ...this.misiones]; this.selectedId = nueva.id; this.cazadorSel = ''; this.vista = 'MIAS'; this.filtro = 'TODAS'; this.formError = '';
        this.tituloNuevo = ''; this.especialidadSel = ''; this.zonaSel = ''; this.recompensaNueva = ''; this.etiquetasNuevas = ''; this.valores = {};
        this.wallet.miBilletera().subscribe((b) => { this.saldoDisponible = Number(b.saldoDisponible); this.cdr.markForCheck(); });
        this.notify('Misión publicada y créditos retenidos');
        this.cdr.markForCheck();
      },
      error: (err) => { this.formError = err?.error?.error ?? 'No se pudo publicar la misión. Revisa tu saldo y vuelve a intentar.'; this.cdr.markForCheck(); },
    });
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

  confirmar(): void {
    const m = this.selected;
    if (!this.pendiente || !m) return;
    const accion = this.pendiente.accion;
    let request;
    if (accion === 'asignar') {
      const candidato = m.postulaciones.find((p) => p.alias === this.cazadorSel);
      if (!candidato) { this.notify('Selecciona una postulación para asignar.'); return; }
      request = this.api.asignarMision(this.idMision(m), candidato.idCazarrecompensas);
    } else if (accion === 'cancelar') request = this.api.cancelarMision(this.idMision(m));
    else request = this.api.cerrarMision(this.idMision(m));
    request.subscribe({ next: (r: any) => { const postulaciones = m.postulaciones; Object.assign(m, this.adaptarMision(r)); m.postulaciones = postulaciones; this.pendiente = null; this.notify(accion === 'asignar' ? `Misión asignada a ${this.cazadorSel}` : accion === 'cancelar' ? 'Misión cancelada y saldo reembolsado' : 'Cierre confirmado y pago liberado'); this.wallet.miBilletera().subscribe((b) => { this.saldoDisponible = Number(b.saldoDisponible); this.cdr.markForCheck(); }); this.cdr.markForCheck(); }, error: (err: any) => { this.notify(err?.error?.error ?? 'No se pudo completar la acción.'); this.cdr.markForCheck(); } });
  }

  // ---------- Chat privado (dueño ↔ cazador asignado) ----------
  enviarMensaje(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    input.value = '';
    this.notify('El chat se habilitará con la integración de MongoDB.');
  }

  // ---------- Comentarios públicos ----------
  enviarComentario(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    input.value = '';
    this.notify('Los comentarios se habilitarán con la integración de MongoDB.');
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
    this.api.calificar(this.idMision(m), this.calificacion, comentario.value.trim()).subscribe({ next: () => { this.calificadas = { ...this.calificadas, [m.id]: this.calificacion }; comentario.value = ''; this.notify('Calificación enviada'); this.cdr.markForCheck(); }, error: () => { this.notify('No se pudo enviar la calificación.'); this.cdr.markForCheck(); } });
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
    const m = this.reportando;
    if (!m) return;
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const motivo = `${String(data.get('motivo') ?? '')}: ${String(data.get('detalle') ?? '').trim()}`.slice(0, 300);
    this.api.crearReporte({ idCuentaReportada: m.autor.idCuenta, motivo }).subscribe({ next: () => { this.reportando = null; this.notify('Reporte enviado a moderación'); this.cdr.markForCheck(); }, error: () => { this.notify('No se pudo enviar el reporte.'); this.cdr.markForCheck(); } });
  }

  private notify(message: string): void {
    this.toast = message;
    this.cdr.markForCheck();
    setTimeout(() => { this.toast = ''; this.cdr.markForCheck(); }, 2800);
  }
}
