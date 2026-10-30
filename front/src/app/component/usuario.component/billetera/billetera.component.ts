import { Component } from '@angular/core';

interface Movimiento {
  concepto: string;
  mision: string;
  fecha: string;
  monto: number;
}

@Component({
  selector: 'app-billetera',
  standalone: false,
  styleUrl: './billetera.component.css',
  templateUrl: './billetera.component.html',
})
export class BilleteraComponent {
  // Datos de ejemplo: reemplazar por el servicio cuando exista el back
  saldoDisponible = 42850;
  saldoRetenido = 12800;
  misionesActivas = 1;

  readonly cero = 0;
  readonly metodos: string[] = ['NeonPay •••• 2048', 'Transferencia de red'];

  movimientos: Movimiento[] = [
    { concepto: 'Recarga de créditos', mision: '—', fecha: 'HOY · 09:12', monto: 20000 },
    { concepto: 'Retención de recompensa', mision: 'BL-2048', fecha: 'AYER · 18:44', monto: -12800 },
    { concepto: 'Reembolso de misión', mision: 'BL-1982', fecha: '12 OCT · 14:20', monto: 4500 },
    { concepto: 'Pago de operación', mision: 'BL-1960', fecha: '08 OCT · 21:03', monto: -7200 },
  ];

  formError = '';
  toast = '';

  get textoMisionesActivas(): string {
    const n = this.misionesActivas;
    return `${n} ${n === 1 ? 'misión activa' : 'misiones activas'}`;
  }

  formatear(valor: number): string {
    return valor.toLocaleString('es-CO');
  }

  textoMonto(valor: number): string {
    return `${valor > 0 ? '+' : '-'}${this.formatear(Math.abs(valor))}`;
  }

  recargar(event: Event, input: HTMLInputElement, metodo: HTMLSelectElement): void {
    event.preventDefault();
    const cantidad = Number(input.value);

    if (!input.value || !Number.isInteger(cantidad) || cantidad <= 0) {
      this.formError = 'Escribe un monto entero mayor a cero.';
      return;
    }

    const ahora = new Date();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');

    this.saldoDisponible += cantidad;
    this.movimientos = [
      { concepto: `Recarga de créditos · ${metodo.value}`, mision: '—', fecha: `HOY · ${hora}:${minutos}`, monto: cantidad },
      ...this.movimientos,
    ];
    this.formError = '';
    input.value = '';
    this.notify('Recarga acreditada correctamente');
  }

  private notify(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2800);
  }
}
