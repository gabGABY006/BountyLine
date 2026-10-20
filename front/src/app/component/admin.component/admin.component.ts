import { Component } from '@angular/core';

type Tono = 'cian' | 'ambar' | 'rosa';

interface Metrica {
  indice: string;
  etiqueta: string;
  valor: string;
  detalle: string;
  icono: string;
  tono: Tono;
}

interface Incidente {
  id: string;
  objetivo: string;
  motivo: string;
  hace: string;
  nivel: 'ALFA' | 'BETA';
}

interface Punto {
  hora: string;
  valor: number;
}

interface Evento {
  titulo: string;
  detalle: string;
  hora: string;
  icono: string;
  tono: Tono;
}

interface Acceso {
  titulo: string;
  detalle: string;
  icono: string;
  ruta: string;
}

@Component({
  selector: 'app-admin',
  standalone: false,
  styleUrl: './admin.component.css',
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  // Datos simulados. Más adelante vendrán de admin.service.
  canceladas = 38;

  metricas: Metrica[] = [
    { indice: '01', etiqueta: 'Usuarios', valor: '128', detalle: '34 cazarrecompensas', icono: 'pi-users', tono: 'cian' },
    { indice: '02', etiqueta: 'Misiones abiertas', valor: '12', detalle: '7 activas en curso', icono: 'pi-folder-open', tono: 'cian' },
    { indice: '03', etiqueta: 'Misiones cerradas', valor: '45', detalle: 'Pagos completados', icono: 'pi-check-circle', tono: 'ambar' },
    { indice: '04', etiqueta: 'Reportes pendientes', valor: '03', detalle: 'Requieren revisión', icono: 'pi-exclamation-triangle', tono: 'rosa' },
  ];

  incidentes: Incidente[] = [
    { id: 'R-014', objetivo: 'GHOST_FEED', motivo: 'Contenido ofensivo en el feed', hace: 'HACE 04 MIN', nivel: 'ALFA' },
    { id: 'R-013', objetivo: 'OPERATOR_19', motivo: 'Suplantación de alias', hace: 'HACE 18 MIN', nivel: 'ALFA' },
    { id: 'R-012', objetivo: 'NX-0802', motivo: 'Spam de contratos falsos', hace: 'HACE 42 MIN', nivel: 'BETA' },
  ];

  flujo: Punto[] = [
    { hora: '06:00', valor: 42 }, { hora: '07:00', valor: 56 }, { hora: '08:00', valor: 48 },
    { hora: '09:00', valor: 72 }, { hora: '10:00', valor: 61 }, { hora: '11:00', valor: 88 },
    { hora: '12:00', valor: 70 }, { hora: '13:00', valor: 93 }, { hora: '14:00', valor: 78 },
    { hora: '15:00', valor: 100 }, { hora: '16:00', valor: 84 }, { hora: '17:00', valor: 96 },
  ];

  eventos: Evento[] = [
    { titulo: 'Reporte R-012 resuelto', detalle: 'Sin sanción · ADMIN_CORE', hora: '14:32:08', icono: 'pi-check', tono: 'cian' },
    { titulo: 'Operador KIRA_09 verificado', detalle: 'Protocolo de identidad completado', hora: '14:28:41', icono: 'pi-user', tono: 'ambar' },
    { titulo: 'Misión MS-0798 cancelada', detalle: 'Regla automática R-17', hora: '14:21:19', icono: 'pi-ban', tono: 'rosa' },
    { titulo: 'Zona Orbital actualizada', detalle: 'Catálogo de zonas · ADMIN_CORE', hora: '13:58:02', icono: 'pi-map', tono: 'cian' },
  ];

  accesos: Acceso[] = [
    { titulo: 'GESTIONAR OPERADORES', detalle: 'Altas, permisos y suspensiones', icono: 'pi-users', ruta: '/admin/usuarios' },
    { titulo: 'EDITAR CATÁLOGOS', detalle: 'Zonas y especialidades', icono: 'pi-map', ruta: '/admin/catalogos' },
  ];

  get totalPublicadas(): number {
    return this.flujo.reduce((suma, p) => suma + p.valor, 0);
  }

  get maximo(): number {
    return Math.max(...this.flujo.map(p => p.valor));
  }

  get escala(): number[] {
    const m = this.maximo;
    return [m, Math.round((m * 2) / 3), Math.round(m / 3), 0];
  }

  alturaBarra(valor: number): number {
    return Math.round((valor / this.maximo) * 100);
  }
}
