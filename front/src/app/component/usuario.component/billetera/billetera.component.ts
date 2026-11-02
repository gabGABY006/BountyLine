import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../service/auth.service';
import { BilleteraService, MovimientoApi, TipoMovimiento } from '../../../service/billetera.service';

interface Movimiento {
  concepto: string;
  mision: string;
  fecha: string;
  monto: number;
}

const CONCEPTO: Record<TipoMovimiento, string> = {
  RECARGA: 'Recarga de créditos',
  RETENCION: 'Retención de recompensa',
  PAGO: 'Pago de operación',
  COBRO: 'Cobro de operación',
  REEMBOLSO: 'Reembolso de misión',
};

/** Tipos que suman al saldo disponible; el resto resta. */
const SUMAN: TipoMovimiento[] = ['RECARGA', 'COBRO', 'REEMBOLSO'];

@Component({
  selector: 'app-billetera',
  standalone: false,
  styleUrl: './billetera.component.css',
  templateUrl: './billetera.component.html',
})
export class BilleteraComponent implements OnInit {
  saldoDisponible = 0;
  saldoRetenido = 0;
  misionesActivas = 0;

  readonly cero = 0;
  readonly metodos: string[] = ['NeonPay •••• 2048', 'Transferencia de red'];

  movimientos: Movimiento[] = [];

  formError = '';
  toast = '';
  cargando = true;
  enviando = false;

  constructor(
    private billeteraApi: BilleteraService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  /** Trae saldo, movimientos y misiones activas desde el back. */
  private cargar(): void {
    forkJoin({
      billetera: this.billeteraApi.miBilletera(),
      movimientos: this.billeteraApi.movimientos(),
      activas: this.billeteraApi.misionesActivas(),
    }).subscribe({
      next: ({ billetera, movimientos, activas }) => {
        this.saldoDisponible = billetera.saldoDisponible;
        this.saldoRetenido = billetera.saldoRetenido;
        this.misionesActivas = activas;
        this.movimientos = movimientos.map((m) => this.aMovimiento(m));
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.formError = this.auth.mensajeDeError(err);
      },
    });
  }

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

  recargar(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    const cantidad = Number(input.value);

    if (!input.value || !Number.isInteger(cantidad) || cantidad <= 0) {
      this.formError = 'Escribe un monto entero mayor a cero.';
      return;
    }

    this.formError = '';
    this.enviando = true;
    this.billeteraApi.recargar(cantidad).subscribe({
      next: () => {
        this.enviando = false;
        input.value = '';
        this.cargar(); // el saldo y el historial salen de la base de datos
        this.notify('Recarga acreditada correctamente');
      },
      error: (err) => {
        this.enviando = false;
        this.formError = this.auth.mensajeDeError(err);
      },
    });
  }

  private aMovimiento(m: MovimientoApi): Movimiento {
    return {
      concepto: m.descripcion?.trim() || CONCEPTO[m.tipo],
      mision: m.idMision === null ? '—' : `BL-${m.idMision}`,
      fecha: this.textoFecha(m.fecha),
      monto: SUMAN.includes(m.tipo) ? m.monto : -m.monto,
    };
  }

  /** HOY · 09:12, AYER · 18:44 o 12 OCT · 14:20 */
  private textoFecha(iso: string): string {
    const f = new Date(iso);
    const hora = `${String(f.getHours()).padStart(2, '0')}:${String(f.getMinutes()).padStart(2, '0')}`;
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);
    if (f.toDateString() === hoy.toDateString()) return `HOY · ${hora}`;
    if (f.toDateString() === ayer.toDateString()) return `AYER · ${hora}`;
    const dia = String(f.getDate()).padStart(2, '0');
    const mes = f.toLocaleString('es-CO', { month: 'short' }).replace('.', '').toUpperCase();
    return `${dia} ${mes} · ${hora}`;
  }

  private notify(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2800);
  }
}
