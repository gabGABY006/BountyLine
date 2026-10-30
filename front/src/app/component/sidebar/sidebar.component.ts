import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModoApp } from '../navbar/navbar.component';

interface ItemMenu {
  texto: string;
  ruta: string;
  icono: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  styleUrl: './sidebar.component.css',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Input() modo: ModoApp = 'NORMAL';
  @Input() misionesActivas = 0;
  @Input() reputacion = 0;
  @Input() reportesPendientes = 0;

  @Output() cerrarSesion = new EventEmitter<void>();

  private readonly menuPorModo: Record<ModoApp, ItemMenu[]> = {
    NORMAL: [
      { texto: 'Misiones', ruta: '/usuario/misiones', icono: 'pi-list' },
      { texto: 'Billetera', ruta: '/usuario/billetera', icono: 'pi-wallet' },
      { texto: 'Mi perfil', ruta: '/usuario/mi-perfil', icono: 'pi-user' },
      { texto: 'Cazadores', ruta: '/usuario/cazadores', icono: 'pi-book' },
    ],
    CAZARRECOMPENSAS: [
      { texto: 'Mercado', ruta: '/cazarrecompensas/mercado', icono: 'pi-bullseye' },
      { texto: 'Mis trabajos', ruta: '/cazarrecompensas/trabajos', icono: 'pi-map-marker' },
      { texto: 'Ganancias', ruta: '/cazarrecompensas/ganancias', icono: 'pi-wallet' },
      { texto: 'Mi perfil', ruta: '/cazarrecompensas/mi-perfil', icono: 'pi-user' },
    ],
    ADMIN: [
      { texto: 'Panel', ruta: '/admin/panel', icono: 'pi-th-large' },
      { texto: 'Usuarios', ruta: '/admin/usuarios', icono: 'pi-users' },
      { texto: 'Reportes', ruta: '/admin/reportes', icono: 'pi-exclamation-triangle' },
      { texto: 'Catálogos', ruta: '/admin/catalogos', icono: 'pi-list' },
      { texto: 'Bitácora', ruta: '/admin/bitacora', icono: 'pi-clock' },
    ],
  };

  get etiquetaModo(): string {
    const etiquetas: Record<ModoApp, string> = {
      NORMAL: 'NORMAL',
      CAZARRECOMPENSAS: 'CAZARRECOMPENSAS',
      ADMIN: 'ADMINISTRADOR',
    };
    return etiquetas[this.modo];
  }

  get menu(): ItemMenu[] {
    return this.menuPorModo[this.modo].map(item =>
      item.ruta === '/admin/reportes'
        ? { ...item, badge: this.reportesPendientes }
        : item
    );
  }

  get esNormal(): boolean {
    return this.modo === 'NORMAL';
  }

  get esAdmin(): boolean {
    return this.modo === 'ADMIN';
  }
}
