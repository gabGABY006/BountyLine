import { ChangeDetectorRef, Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Rol } from '../../service/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: false,
  styleUrl: './inicio.component.css',
  templateUrl: './inicio.component.html',
})
export class InicioComponent {
  rol: 'usuario' | 'admin' = 'usuario';
  modo: 'normal' | 'cazarrecompensas' = 'cazarrecompensas';

  correo = '';
  contrasenia = '';
  recordar = false;
  mostrarContrasenia = false;
  mensaje = '';
  cargando = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  get etiquetaPerfil(): string {
    if (this.rol === 'admin') return 'administrador';
    return this.modo === 'cazarrecompensas' ? 'cazarrecompensas' : 'usuario';
  }

  /** Rol que el back debe devolver para el perfil elegido en pantalla. */
  private get rolEsperado(): Rol {
    if (this.rol === 'admin') return 'ADMINISTRADOR';
    return this.modo === 'cazarrecompensas' ? 'CAZARRECOMPENSAS' : 'USUARIO';
  }

  seleccionarRol(rol: 'usuario' | 'admin'): void {
    this.rol = rol;
    if (rol === 'admin') this.modo = 'normal';
    this.mensaje = '';
  }

  seleccionarModo(modo: 'normal' | 'cazarrecompensas'): void {
    this.modo = modo;
    this.mensaje = '';
  }

  iniciarSesion(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.mensaje = 'Revisa el correo y la contraseña.';
      return;
    }

    this.mensaje = '';
    this.cargando = true;

    this.auth.login(this.correo, this.contrasenia).subscribe({
      next: (sesion) => {
        this.cargando = false;
        this.cdr.markForCheck();
        if (sesion.rol !== this.rolEsperado) {
          // Credenciales válidas, pero el perfil elegido no es el de la cuenta
          this.auth.cerrarSesion();
          this.mensaje = `Esta cuenta es de tipo ${sesion.rol}. Selecciona el perfil correcto.`;
          return;
        }
        void this.router.navigate([this.auth.rutaInicio(sesion.rol)]);
      },
      error: (err) => {
        this.cargando = false;
        this.mensaje = this.auth.mensajeDeError(err);
        this.cdr.markForCheck();
      },
    });
  }
}
