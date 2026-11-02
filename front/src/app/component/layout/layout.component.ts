import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModoApp } from '../navbar/navbar.component';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit {
  modo: ModoApp = 'NORMAL';
  alias = '';

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.modo = this.ruta.snapshot.data['modo'] ?? 'NORMAL';
    this.alias = this.auth.sesion?.alias ?? '';
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    void this.router.navigate(['/inicio']);
  }
}
