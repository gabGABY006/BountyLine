import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(private ruta: ActivatedRoute) {}

  ngOnInit(): void {
    this.modo = this.ruta.snapshot.data['modo'] ?? 'NORMAL';
  }
}
