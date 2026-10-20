import { Component } from '@angular/core';

type Estado = 'ACTIVA' | 'SUSPENDIDA' | 'ELIMINADA';
type Rol = 'NORMAL' | 'CAZARRECOMPENSAS';
type FiltroEstado = Estado | 'TODAS';

interface Usuario {
  id: number;
  codigo: string;
  alias: string;
  iniciales: string;
  correo: string;
  rol: Rol;
  estado: Estado;
  registro: string;
}

@Component({
  selector: 'app-gestion-usuarios',
  standalone: false,
  styleUrl: './gestion-usuarios.component.css',
  templateUrl: './gestion-usuarios.component.html',
})
export class GestionUsuariosComponent {
  // Cuenta de la sesión actual (simulada). No puede suspenderse a sí misma.
  readonly idSesion = 1;

  // Datos simulados con las cuentas semilla de la guía (sección 14).
  usuarios: Usuario[] = [
    { id: 1, codigo: 'OP-1001', alias: 'admin', iniciales: 'AD', correo: 'admin@bountyline.com', rol: 'NORMAL', estado: 'ACTIVA', registro: '12 ENE 2026' },
    { id: 2, codigo: 'OP-1002', alias: 'kira', iniciales: 'KI', correo: 'kira@bountyline.com', rol: 'NORMAL', estado: 'ACTIVA', registro: '03 FEB 2026' },
    { id: 3, codigo: 'OP-1003', alias: 'solano', iniciales: 'SO', correo: 'solano@bountyline.com', rol: 'NORMAL', estado: 'ACTIVA', registro: '20 FEB 2026' },
    { id: 4, codigo: 'OP-1004', alias: 'nyx', iniciales: 'NY', correo: 'nyx@bountyline.com', rol: 'NORMAL', estado: 'SUSPENDIDA', registro: '08 MAR 2026' },
    { id: 5, codigo: 'OP-1005', alias: 'jack', iniciales: 'JA', correo: 'jack@bountyline.com', rol: 'CAZARRECOMPENSAS', estado: 'ACTIVA', registro: '15 MAR 2026' },
    { id: 6, codigo: 'OP-1006', alias: 'lady', iniciales: 'LA', correo: 'lady@bountyline.com', rol: 'CAZARRECOMPENSAS', estado: 'ACTIVA', registro: '02 ABR 2026' },
    { id: 7, codigo: 'OP-1007', alias: 'mamba', iniciales: 'MA', correo: 'mamba@bountyline.com', rol: 'CAZARRECOMPENSAS', estado: 'ELIMINADA', registro: '19 ABR 2026' },
  ];

  filtrosEstado: { valor: FiltroEstado; texto: string }[] = [
    { valor: 'TODAS', texto: 'TODOS' },
    { valor: 'ACTIVA', texto: 'ACTIVAS' },
    { valor: 'SUSPENDIDA', texto: 'SUSPENDIDAS' },
    { valor: 'ELIMINADA', texto: 'ELIMINADAS' },
  ];

  busqueda = '';
  filtroEstado: FiltroEstado = 'TODAS';
  filtroRol: Rol | 'TODOS' = 'TODOS';

  seleccionadoId = 1;
  pendiente: Usuario | null = null;
  mensaje = '';
  tipoMensaje: 'ok' | 'error' = 'ok';

  get total(): number {
    return this.usuarios.length;
  }

  get totalCazadores(): number {
    return this.usuarios.filter(u => u.rol === 'CAZARRECOMPENSAS').length;
  }

  get seleccionado(): Usuario {
    return this.usuarios.find(u => u.id === this.seleccionadoId) ?? this.usuarios[0];
  }

  get usuariosFiltrados(): Usuario[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.usuarios.filter(u =>
      (this.filtroEstado === 'TODAS' || u.estado === this.filtroEstado) &&
      (this.filtroRol === 'TODOS' || u.rol === this.filtroRol) &&
      (!texto || u.alias.toLowerCase().includes(texto) || u.correo.toLowerCase().includes(texto))
    );
  }

  contar(estado: Estado): number {
    return this.usuarios.filter(u => u.estado === estado).length;
  }

  contarFiltro(valor: FiltroEstado): number {
    return valor === 'TODAS' ? this.total : this.contar(valor);
  }

  etiquetaRol(rol: Rol): string {
    return rol === 'CAZARRECOMPENSAS' ? 'CAZADOR' : 'NORMAL';
  }

  iconoEstado(estado: Estado): string {
    const iconos: Record<Estado, string> = {
      ACTIVA: 'pi-check',
      SUSPENDIDA: 'pi-ban',
      ELIMINADA: 'pi-trash',
    };
    return iconos[estado];
  }

  descripcionEstado(estado: Estado): string {
    const textos: Record<Estado, string> = {
      ACTIVA: 'Acceso permitido a la red.',
      SUSPENDIDA: 'Sin acceso a la red hasta que sea reactivada.',
      ELIMINADA: 'Cuenta dada de baja. No admite cambios de estado.',
    };
    return textos[estado];
  }

  seleccionar(usuario: Usuario): void {
    this.seleccionadoId = usuario.id;
  }

  pedirCambio(): void {
    const cuenta = this.seleccionado;
    if (cuenta.estado === 'ELIMINADA') return;

    if (cuenta.id === this.idSesion) {
      this.avisar('No puedes suspender tu propia cuenta.', 'error');
      return;
    }

    this.pendiente = cuenta;
  }

  confirmar(): void {
    const cuenta = this.pendiente;
    if (!cuenta) return;

    const nuevoEstado: Estado = cuenta.estado === 'ACTIVA' ? 'SUSPENDIDA' : 'ACTIVA';
    this.usuarios = this.usuarios.map(u =>
      u.id === cuenta.id ? { ...u, estado: nuevoEstado } : u
    );

    this.pendiente = null;
    this.avisar(`La cuenta ${cuenta.alias} ahora está ${nuevoEstado.toLowerCase()}.`, 'ok');
  }

  cancelar(): void {
    this.pendiente = null;
  }

  private avisar(texto: string, tipo: 'ok' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
  }
}
