import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
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

  iniciarSesion(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.mensaje = 'Revisa el correo y la contraseña.';
      return;
    }

    this.mensaje =
      'Formulario válido. Falta verificar la autenticación.';
  }
}
