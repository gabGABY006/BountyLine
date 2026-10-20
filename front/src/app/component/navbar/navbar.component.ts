import { Component, Input } from '@angular/core';

export type ModoApp = 'NORMAL' | 'CAZARRECOMPENSAS' | 'ADMIN';

@Component({
  selector: 'app-navbar',
  standalone: false,
  styleUrl: './navbar.component.css',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  @Input() alias = 'OPERADOR';
  @Input() modo: ModoApp = 'NORMAL';
  @Input() notificaciones = 0;

  get etiquetaModo(): string {
    const etiquetas: Record<ModoApp, string> = {
      NORMAL: 'NORMAL',
      CAZARRECOMPENSAS: 'CAZARRECOMPENSAS',
      ADMIN: 'ADMINISTRADOR',
    };
    return etiquetas[this.modo];
  }
}
