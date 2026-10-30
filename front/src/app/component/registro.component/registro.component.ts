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
  aceptaTerminos = false;
  terminosAbiertos = false;
  zonaId: number | null = null;
  mensaje = '';

  readonly terminos = [
    'Aceptación: Al registrarte, aceptas estas condiciones de uso.',
    'Uso de la plataforma: BountyLine permite publicar misiones, participar en ellas e interactuar con otros usuarios.',
    'Registro: Debes proporcionar información verdadera y mantener segura tu cuenta.',
    'Perfiles: Cada usuario debe utilizar su perfil de forma adecuada. El acceso de administrador es exclusivo para personas autorizadas.',
    'Misiones: Las misiones deben tener información clara, respetar las normas y no promover actividades ilegales o peligrosas.',
    'Recompensas: Las recompensas son virtuales y no representan dinero real ni pueden retirarse.',
    'Comunicación: Las publicaciones, comentarios y chats deben ser respetuosos y no vulnerar la privacidad de otras personas.',
    'Calificaciones: Las valoraciones deben ser honestas y estar relacionadas con las experiencias reales.',
    'Reportes: Puedes reportar comportamientos o contenidos inadecuados cuando esta función esté disponible.',
    'Uso responsable: No está permitido manipular la plataforma, acceder a cuentas ajenas ni afectar su funcionamiento.',
    'Datos personales: Tu información debe tratarse conforme a las condiciones de privacidad y las normas aplicables.',
    'Prototipo académico: Algunas funciones pueden ser demostrativas y no guardar información permanentemente.',
    'Actualizaciones: Las condiciones pueden cambiar cuando se actualice la plataforma.',
    'Incumplimiento: El uso inadecuado puede ocasionar restricciones según las reglas de la plataforma.',
    'Aceptación final: Al marcar la casilla, confirmas que leíste y aceptas estas condiciones.',
  ];

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

    if (!this.aceptaTerminos) {
      this.mensaje = 'Debes aceptar los términos y condiciones para crear una cuenta.';
      return;
    }

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
