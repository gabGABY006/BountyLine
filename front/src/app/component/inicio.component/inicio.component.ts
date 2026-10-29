import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  iniciarSesion(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.mensaje = 'Revisa el correo y la contraseña.';
      return;
    }

    // TEMPORAL: borrar este bloque cuando exista la autenticación con el back
    if (this.rol === 'admin') {
      this.router.navigate(['/admin/panel']);
    } else if (this.modo === 'cazarrecompensas') {
      this.router.navigate(['/cazarrecompensas/mercado']);
    } else {
      this.router.navigate(['/usuario/misiones']);
    }
  }
}
