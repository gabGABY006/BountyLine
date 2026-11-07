import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService, CuentaApi } from '../../../service/api.service';
import { AuthService } from '../../../service/auth.service';

type Estado = 'ACTIVA' | 'SUSPENDIDA' | 'ELIMINADA';
type Rol = 'NORMAL' | 'CAZARRECOMPENSAS';
type FiltroEstado = Estado | 'TODAS';
interface Usuario { id: number; codigo: string; alias: string; iniciales: string; correo: string; rol: Rol; estado: Estado; registro: string; }
@Component({ selector: 'app-gestion-usuarios', standalone: false, styleUrl: './gestion-usuarios.component.css', templateUrl: './gestion-usuarios.component.html' })
export class GestionUsuariosComponent implements OnInit {
  get idSesion(): number { return this.auth.sesion?.idCuenta ?? -1; }
  usuarios: Usuario[] = [];
  filtrosEstado: { valor: FiltroEstado; texto: string }[] = [{ valor: 'TODAS', texto: 'TODOS' }, { valor: 'ACTIVA', texto: 'ACTIVAS' }, { valor: 'SUSPENDIDA', texto: 'SUSPENDIDAS' }, { valor: 'ELIMINADA', texto: 'ELIMINADAS' }];
  busqueda = '';
  filtroEstado: FiltroEstado = 'TODAS';
  filtroRol: Rol | 'TODOS' = 'TODOS';
  seleccionadoId = -1;
  pendiente: Usuario | null = null;
  mensaje = '';
  tipoMensaje: 'ok' | 'error' = 'ok';
  constructor(private api: ApiService, private auth: AuthService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.cargar(); }
  private cargar(): void { this.api.cuentas().subscribe({ next: (xs) => { this.usuarios = xs.map((x) => this.adaptar(x)); if (!this.usuarios.some((x) => x.id === this.seleccionadoId)) this.seleccionadoId = this.usuarios[0]?.id ?? -1; this.cdr.markForCheck(); }, error: () => { this.avisar('No se pudieron cargar las cuentas.', 'error'); this.cdr.markForCheck(); } }); }
  private adaptar(x: CuentaApi): Usuario { return { id: x.idCuenta, codigo: `OP-${String(x.idCuenta).padStart(4, '0')}`, alias: x.alias, iniciales: x.alias.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase(), correo: x.correo, rol: x.rol === 'CAZARRECOMPENSAS' ? 'CAZARRECOMPENSAS' : 'NORMAL', estado: x.estado as Estado, registro: x.fechaRegistro ? new Date(x.fechaRegistro).toLocaleDateString('es-CO') : '—' }; }
  get total(): number { return this.usuarios.length; }
  get totalCazadores(): number { return this.usuarios.filter((u) => u.rol === 'CAZARRECOMPENSAS').length; }
  get seleccionado(): Usuario { return this.usuarios.find((u) => u.id === this.seleccionadoId) ?? this.usuarios[0] ?? { id: -1, codigo: '—', alias: 'Sin cuentas', iniciales: '--', correo: '—', rol: 'NORMAL', estado: 'ELIMINADA', registro: '—' }; }
  get usuariosFiltrados(): Usuario[] { const q = this.busqueda.trim().toLowerCase(); return this.usuarios.filter((u) => (this.filtroEstado === 'TODAS' || u.estado === this.filtroEstado) && (this.filtroRol === 'TODOS' || u.rol === this.filtroRol) && (!q || u.alias.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q))); }
  contar(estado: Estado): number { return this.usuarios.filter((u) => u.estado === estado).length; }
  contarFiltro(estado: FiltroEstado): number { return estado === 'TODAS' ? this.total : this.contar(estado); }
  etiquetaRol(rol: Rol): string { return rol === 'CAZARRECOMPENSAS' ? 'CAZADOR' : 'NORMAL'; }
  iconoEstado(estado: Estado): string { return ({ ACTIVA: 'pi-check', SUSPENDIDA: 'pi-ban', ELIMINADA: 'pi-trash' })[estado]; }
  descripcionEstado(estado: Estado): string { return ({ ACTIVA: 'Acceso permitido a la red.', SUSPENDIDA: 'Sin acceso a la red hasta que sea reactivada.', ELIMINADA: 'Cuenta dada de baja.' })[estado]; }
  seleccionar(usuario: Usuario): void { this.seleccionadoId = usuario.id; }
  pedirCambio(): void { if (this.seleccionado.id === this.idSesion) { this.avisar('No puedes suspender tu propia cuenta.', 'error'); return; } if (this.seleccionado.estado !== 'ELIMINADA') this.pendiente = this.seleccionado; }
  confirmar(): void { const u = this.pendiente; if (!u) return; const estado = u.estado === 'ACTIVA' ? 'SUSPENDIDA' : 'ACTIVA'; this.api.cambiarEstado(u.id, estado).subscribe({ next: () => { this.pendiente = null; this.cargar(); this.avisar(`La cuenta ${u.alias} ahora está ${estado.toLowerCase()}.`, 'ok'); this.cdr.markForCheck(); }, error: () => { this.avisar('No se pudo cambiar el estado de la cuenta.', 'error'); this.cdr.markForCheck(); } }); }
  cancelar(): void { this.pendiente = null; }
  private avisar(texto: string, tipo: 'ok' | 'error'): void { this.mensaje = texto; this.tipoMensaje = tipo; }
}
