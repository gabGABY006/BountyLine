import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModoApp } from '../navbar/navbar.component';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit {
  modo: ModoApp = 'NORMAL';
  alias = 'AXIOM_47';

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.modo = this.ruta.snapshot.data['modo'] ?? 'NORMAL';
  }

  cerrarSesion(): void {
    void this.router.navigate(['/inicio']);
  }
}
