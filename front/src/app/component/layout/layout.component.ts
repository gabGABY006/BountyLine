import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModoApp } from '../navbar/navbar.component';
import { AuthService } from '../../service/auth.service';
import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit {
  modo: ModoApp = 'NORMAL';
  alias = '';

  misionesActivas = 0;
  reputacion = 0;

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.modo = this.ruta.snapshot.data['modo'] ?? 'NORMAL';
    this.alias = this.auth.sesion?.alias ?? '';
    if (this.modo === 'CAZARRECOMPENSAS') {
      this.api.resumenCazador().subscribe({
        next: (resumen) => { this.misionesActivas = resumen.misionesActivas ?? 0; this.reputacion = Number(resumen.reputacion ?? 0); this.cdr.markForCheck(); },
        error: () => this.cdr.markForCheck(),
      });
    }
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    void this.router.navigate(['/inicio']);
  }
}
