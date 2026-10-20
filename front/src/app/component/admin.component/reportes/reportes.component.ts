import { Component } from '@angular/core';

type Estado = 'PENDIENTE' | 'EN REVISIÓN' | 'RESUELTO';
type Tipo = 'POST' | 'USUARIO';
type Accion = 'NINGUNA' | 'ELIMINAR_POST' | 'SUSPENDER_USUARIO';

interface Reporte {
  id: string;
  tipo: Tipo;
  objetivo: string;
  motivo: string;
  reportadoPor: string;
  hace: string;
  estado: Estado;
  accion: Accion | null;
}

@Component({
  selector: 'app-reportes',
  standalone: false,
  styleUrl: './reportes.component.css',
  templateUrl: './reportes.component.html',
})
export class ReportesComponent {
  reportes: Reporte[] = [
    { id: 'RPT-2084', tipo: 'POST', objetivo: '65a1f3c2e4b0a1d2c3e4f501', motivo: 'Red de perfiles publicando contratos duplicados para capturar depósitos de garantía.', reportadoPor: 'VANTA_K', hace: '04 MIN', estado: 'PENDIENTE', accion: null },
    { id: 'RPT-2079', tipo: 'USUARIO', objetivo: 'OPERATOR_19', motivo: 'Seis intentos de autenticación simultáneos con la misma firma desde ubicaciones incompatibles.', reportadoPor: 'SENTINEL_AI', hace: '18 MIN', estado: 'EN REVISIÓN', accion: null },
    { id: 'RPT-2071', tipo: 'POST', objetivo: '65a1f3c2e4b0a1d2c3e4f502', motivo: 'La entidad contratante rechaza la prueba de entrega del operador en esta publicación.', reportadoPor: 'RØNIN_X', hace: '42 MIN', estado: 'PENDIENTE', accion: null },
    { id: 'RPT-2066', tipo: 'USUARIO', objetivo: 'KIRA_09', motivo: 'Identidad no verificada usando variaciones del alias y material visual del operador afectado.', reportadoPor: 'NYX', hace: '1 H', estado: 'PENDIENTE', accion: null },
    { id: 'RPT-2058', tipo: 'POST', objetivo: '65a1f3c2e4b0a1d2c3e4f503', motivo: 'Publicación con datos personales no autorizados en el canal público.', reportadoPor: 'AKIRA_V', hace: '3 H', estado: 'RESUELTO', accion: 'ELIMINAR_POST' },
  ];

  filtrosEstado: { valor: 'TODOS' | Estado; texto: string }[] = [
    { valor: 'TODOS', texto: 'TODOS' },
    { valor: 'PENDIENTE', texto: 'PENDIENTE' },
    { valor: 'EN REVISIÓN', texto: 'EN REVISIÓN' },
    { valor: 'RESUELTO', texto: 'RESUELTO' },
  ];

  readonly acciones: { valor: Accion; detalle: string }[] = [
    { valor: 'NINGUNA', detalle: 'Cerrar el reporte sin sanción.' },
    { valor: 'ELIMINAR_POST', detalle: 'Quitar la publicación del feed. Solo para reportes de tipo POST.' },
    { valor: 'SUSPENDER_USUARIO', detalle: 'Suspender la cuenta reportada. Solo para reportes de tipo USUARIO.' },
  ];

  busqueda = '';
  filtroEstado: 'TODOS' | Estado = 'TODOS';
  seleccionadoId = 'RPT-2084';

  resolviendo = false;
  accionElegida: Accion = 'NINGUNA';
  mensaje = '';
  tipoMensaje: 'ok' | 'error' = 'ok';

  // Nuevo reporte
  creando = false;
  intentoEnvio = false;
  nuevo: { tipo: Tipo; objetivo: string; motivo: string } = { tipo: 'POST', objetivo: '', motivo: '' };
  readonly maxMotivo = 300;
  private siguienteNumero = 2085;
  private readonly patronIdPost = /^[a-fA-F0-9]{24}$/;

  get total(): number {
    return this.reportes.length;
  }

  get seleccionado(): Reporte {
    return this.reportes.find(r => r.id === this.seleccionadoId) ?? this.reportes[0];
  }

  get puedeResolver(): boolean {
    return this.seleccionado.estado !== 'RESUELTO';
  }

  get abiertos(): number {
    return this.reportes.filter(r => r.estado !== 'RESUELTO').length;
  }

  get nivelAmenaza(): string {
    return this.contar('PENDIENTE') >= 2 ? 'ELEVADO' : 'MODERADO';
  }

  get reportesFiltrados(): Reporte[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.reportes.filter(r =>
      (this.filtroEstado === 'TODOS' || r.estado === this.filtroEstado) &&
      (!texto ||
        r.id.toLowerCase().includes(texto) ||
        r.motivo.toLowerCase().includes(texto) ||
        r.objetivo.toLowerCase().includes(texto))
    );
  }

  get errorObjetivo(): string {
    const valor = this.nuevo.objetivo.trim();
    if (!valor) {
      return this.nuevo.tipo === 'POST' ? 'Indica el ID del post.' : 'Indica el alias del usuario.';
    }
    if (this.nuevo.tipo === 'POST' && !this.patronIdPost.test(valor)) {
      return 'El ID debe tener 24 caracteres hexadecimales.';
    }
    if (this.nuevo.tipo === 'USUARIO' && (valor.length < 3 || valor.length > 30)) {
      return 'El alias debe tener entre 3 y 30 caracteres.';
    }
    return '';
  }

  get errorMotivo(): string {
    const motivo = this.nuevo.motivo.trim();
    if (!motivo) return 'El motivo es obligatorio.';
    if (motivo.length > this.maxMotivo) return `Máximo ${this.maxMotivo} caracteres.`;
    return '';
  }

  contar(estado: Estado): number {
    return this.reportes.filter(r => r.estado === estado).length;
  }

  contarFiltro(valor: 'TODOS' | Estado): number {
    return valor === 'TODOS' ? this.total : this.contar(valor);
  }

  claseEstado(estado: Estado): string {
    const clases: Record<Estado, string> = {
      'PENDIENTE': 'pendiente',
      'EN REVISIÓN': 'revision',
      'RESUELTO': 'resuelto',
    };
    return clases[estado];
  }

  accionDisponible(accion: Accion, reporte: Reporte): boolean {
    if (accion === 'ELIMINAR_POST') return reporte.tipo === 'POST';
    if (accion === 'SUSPENDER_USUARIO') return reporte.tipo === 'USUARIO';
    return true;
  }

  seleccionar(reporte: Reporte): void {
    this.seleccionadoId = reporte.id;
  }

  marcarEnRevision(): void {
    const reporte = this.seleccionado;
    if (reporte.estado !== 'PENDIENTE') return;

    this.actualizar(reporte.id, { estado: 'EN REVISIÓN' });
    this.avisar(`${reporte.id} pasó a revisión.`, 'ok');
  }

  abrirResolucion(): void {
    if (!this.puedeResolver) return;
    this.accionElegida = 'NINGUNA';
    this.resolviendo = true;
  }

  confirmarResolucion(): void {
    const reporte = this.seleccionado;
    if (!this.accionDisponible(this.accionElegida, reporte)) {
      this.avisar('Esa acción no aplica a este tipo de reporte.', 'error');
      return;
    }

    this.actualizar(reporte.id, { estado: 'RESUELTO', accion: this.accionElegida });
    this.resolviendo = false;
    this.avisar(`${reporte.id} resuelto con acción ${this.accionElegida}.`, 'ok');
  }

  cancelarResolucion(): void {
    this.resolviendo = false;
  }

  // NUEVO REPORTE

  abrirNuevo(): void {
    this.nuevo = { tipo: 'POST', objetivo: '', motivo: '' };
    this.intentoEnvio = false;
    this.creando = true;
  }

  cerrarNuevo(): void {
    this.creando = false;
  }

  cambiarTipoNuevo(tipo: Tipo): void {
    this.nuevo.tipo = tipo;
    this.nuevo.objetivo = '';
    this.intentoEnvio = false;
  }

  crearReporte(): void {
    this.intentoEnvio = true;
    if (this.errorObjetivo || this.errorMotivo) return;

    const id = `RPT-${this.siguienteNumero++}`;
    const nuevoReporte: Reporte = {
      id,
      tipo: this.nuevo.tipo,
      objetivo: this.nuevo.objetivo.trim(),
      motivo: this.nuevo.motivo.trim(),
      reportadoPor: 'ADMIN_CORE',
      hace: 'AHORA',
      estado: 'PENDIENTE',
      accion: null,
    };

    this.reportes = [nuevoReporte, ...this.reportes];
    this.seleccionadoId = id;
    this.filtroEstado = 'TODOS';
    this.busqueda = '';
    this.creando = false;
    this.avisar(`${id} creado y en cola de moderación.`, 'ok');
  }

  private actualizar(id: string, cambios: Partial<Reporte>): void {
    this.reportes = this.reportes.map(r => (r.id === id ? { ...r, ...cambios } : r));
  }

  private avisar(texto: string, tipo: 'ok' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
  }
}
