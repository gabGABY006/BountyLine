import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

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

  termino = '';

  @ViewChild('buscador') buscadorRef!: ElementRef<HTMLInputElement>;

  constructor(private router: Router) {}

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

  get rutaBusqueda(): string[] {
    const rutas: Record<ModoApp, string[]> = {
      NORMAL: ['/usuario', 'misiones'],
      CAZARRECOMPENSAS: ['/cazarrecompensas', 'mercado'],
      ADMIN: ['/admin', 'usuarios'],
    };
    return rutas[this.modo] ?? rutas['NORMAL'];
  }

  buscar(): void {
    const texto = this.termino.trim();
    if (!texto) return;
    this.router.navigate(this.rutaBusqueda, { queryParams: { q: texto } });
    this.termino = '';
  }

  @HostListener('document:keydown', ['$event'])
  atajoBuscador(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.buscadorRef?.nativeElement.focus();
    }
  }
}
