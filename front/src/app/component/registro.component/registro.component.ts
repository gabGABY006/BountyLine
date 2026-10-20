import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

interface Catalogo {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-registro',
  standalone: false,
  styleUrl: './registro.component.css',
  templateUrl: './registro.component.html',
})
export class RegistroComponent {
  rol: 'usuario' | 'admin' = 'usuario';
  rolInicial: 'NORMAL' | 'CAZARRECOMPENSAS' = 'NORMAL';

  nombre = '';
  alias = '';
  correo = '';
  contrasenia = '';
  confirmacion = '';
  codigoAdmin = '';
  avatar = '';
  descripcion = '';
  zonaId: number | null = null;
  mensaje = '';

  // Catálogos simulados (sección 14 de la guía)
  zonas: Catalogo[] = [
    { id: 1, nombre: 'Centro' },
    { id: 2, nombre: 'Distrito industrial' },
    { id: 3, nombre: 'Suburbios' },
    { id: 4, nombre: 'Puerto' },
    { id: 5, nombre: 'Orbital' },
  ];

  especialidades: Catalogo[] = [
    { id: 1, nombre: 'Robo' },
    { id: 2, nombre: 'Venganza' },
    { id: 3, nombre: 'Protección' },
    { id: 4, nombre: 'Sabotaje' },
  ];

  especialidadesMarcadas: Record<number, boolean> = {};
  zonasMarcadas: Record<number, boolean> = {};

  get contraseniasCoinciden(): boolean {
    return this.contrasenia === this.confirmacion;
  }

  cambiarRol(nuevoRol: 'usuario' | 'admin'): void {
    this.rol = nuevoRol;
    this.mensaje = '';
  }

  registrar(form: NgForm): void {
    this.mensaje = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.mensaje = 'Completa correctamente todos los campos obligatorios.';
      return;
    }

    if (this.rol === 'usuario') {
      if (!this.contraseniasCoinciden) {
        this.mensaje = 'Las contraseñas no coinciden.';
        return;
      }

      if (this.rolInicial === 'CAZARRECOMPENSAS') {
        if (!this.descripcion.trim()) {
          this.mensaje = 'La descripción es obligatoria para cazarrecompensas.';
          return;
        }

        const especialidades = this.especialidades.filter(e => this.especialidadesMarcadas[e.id]);
        if (especialidades.length === 0) {
          this.mensaje = 'Selecciona al menos una especialidad.';
          return;
        }

        const zonasOperacion = this.zonas.filter(z => this.zonasMarcadas[z.id]);
        if (zonasOperacion.length === 0) {
          this.mensaje = 'Selecciona al menos una zona de operación.';
          return;
        }
      }
    }

    if (this.rol === 'admin' && !this.codigoAdmin.trim()) {
      this.mensaje = 'Se requiere un código de autorización.';
      return;
    }

    this.mensaje = 'Formulario válido. Falta conectar el registro con el servicio.';
  }
}
