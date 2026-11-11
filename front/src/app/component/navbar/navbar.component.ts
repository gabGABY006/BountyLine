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

  get rutaBase(): string {
    const bases: Record<ModoApp, string> = {
      NORMAL: '/usuario',
      CAZARRECOMPENSAS: '/cazarrecompensas',
      ADMIN: '/admin',
    };
    return bases[this.modo] ?? '/usuario';
  }

  get etiquetaModo(): string {
    const etiquetas: Record<ModoApp, string> = {
      NORMAL: 'NORMAL',
      CAZARRECOMPENSAS: 'CAZARRECOMPENSAS',
      ADMIN: 'ADMINISTRADOR',
    };
    return etiquetas[this.modo] ?? 'NORMAL';
  }

}
