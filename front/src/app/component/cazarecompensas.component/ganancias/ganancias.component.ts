import { Component } from '@angular/core';

type Tono = 'cyan' | 'pink' | 'amber';

interface Resumen {
  titulo: string;
  valor: string;
  nota: string;
  icono: 'wallet' | 'target' | 'star';
  tone: Tono;
}

interface Pago {
  titulo: string;
  id: string;
  zona: string;
  monto: number;
}

interface Calificacion {
  alias: string;
  estrellas: number;
  texto: string;
  tone: Tono;
}

@Component({
  selector: 'app-ganancias',
  standalone: false,
  styleUrl: './ganancias.component.css',
  templateUrl: './ganancias.component.html',
})
export class GananciasComponent {
  // Datos de ejemplo: reemplazar por el servicio cuando exista el back
  readonly estrellas: number[] = [1, 2, 3, 4, 5];

  resumen: Resumen[] = [
    { titulo: 'GANANCIAS TOTALES', valor: '84.250 CR', nota: '+12% este mes', icono: 'wallet', tone: 'cyan' },
    { titulo: 'MISIONES CERRADAS', valor: '18', nota: '96% de éxito', icono: 'target', tone: 'amber' },
    { titulo: 'REPUTACIÓN', valor: '4.9', nota: '42 calificaciones', icono: 'star', tone: 'pink' },
  ];

  pagos: Pago[] = [
    { titulo: 'Recuperar créditos del Clan Kuro', id: 'BL-2048', zona: 'Distrito Centro', monto: 12800 },
    { titulo: 'Escolta hacia el Puerto Gris', id: 'BL-2039', zona: 'Puerto', monto: 8400 },
    { titulo: 'Rastrear señal fantasma', id: 'BL-2014', zona: 'Zona industrial', monto: 5900 },
    { titulo: 'Escolta nocturna en los suburbios', id: 'BL-1996', zona: 'Suburbios', monto: 6300 },
    { titulo: 'Neutralizar relé en zona libre', id: 'BL-1981', zona: 'Zona libre', monto: 9700 },
  ];

  calificaciones: Calificacion[] = [
    { alias: 'KIRA_09', estrellas: 5, texto: 'Excelente comunicación y entrega impecable.', tone: 'cyan' },
    { alias: 'MARA_V', estrellas: 5, texto: 'Conoce la zona y actuó muy rápido.', tone: 'pink' },
    { alias: 'GHOST_77', estrellas: 4, texto: 'Objetivo recuperado sin daños. Recomendado.', tone: 'amber' },
  ];

  formatear(valor: number): string {
    return valor.toLocaleString('es-CO');
  }
}
