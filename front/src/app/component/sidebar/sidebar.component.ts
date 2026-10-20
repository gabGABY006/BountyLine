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
      { texto: 'Mis misiones', ruta: '/usuario/mis-misiones', icono: 'pi-list' },
      { texto: 'Billetera', ruta: '/usuario/billetera', icono: 'pi-wallet' },
      { texto: 'Mi perfil', ruta: '/usuario/mi-perfil', icono: 'pi-user' },
    ],
    CAZARRECOMPENSAS: [
      { texto: 'Misiones disponibles', ruta: '/cazarrecompensas/misiones-disponibles', icono: 'pi-receipt' },
      { texto: 'Mis postulaciones', ruta: '/cazarrecompensas/mis-misiones', icono: 'pi-send' },
      { texto: 'Ranking', ruta: '/cazarrecompensas/ranking', icono: 'pi-trophy' },
      { texto: 'Mi calificación', ruta: '/cazarrecompensas/mi-calificacion', icono: 'pi-star' },
      { texto: 'Billetera', ruta: '/usuario/billetera', icono: 'pi-wallet' },
      { texto: 'Mi perfil', ruta: '/usuario/mi-perfil', icono: 'pi-user' },
    ],
    ADMIN: [
      { texto: 'Panel', ruta: '/admin/panel', icono: 'pi-th-large' },
      { texto: 'Usuarios', ruta: '/admin/usuarios', icono: 'pi-users' },
      { texto: 'Reportes', ruta: '/admin/reportes', icono: 'pi-exclamation-triangle' },
      { texto: 'Catálogos', ruta: '/admin/catalogos', icono: 'pi-list' },
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
