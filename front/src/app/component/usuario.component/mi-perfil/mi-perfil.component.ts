import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface Habilidad {
  nombre: string;
  nivel: number;
}

@Component({
  selector: 'app-mi-perfil',
  standalone: false,
  styleUrl: './mi-perfil.component.css',
  templateUrl: './mi-perfil.component.html',
})
export class MiPerfilComponent {
  constructor(private readonly route: ActivatedRoute) {}

  // Datos de ejemplo: reemplazar por el servicio cuando exista el back.
  // Zonas y especialidades deberían venir del catálogo que administra el admin.
  readonly cero = 0;
  readonly zonas: string[] = ['Distrito Centro', 'Puerto', 'Zona industrial', 'Suburbios', 'Zona libre'];
  readonly especialidades: string[] = ['Recuperación', 'Protección', 'Rastreo', 'Escolta', 'Sabotaje'];

  perfil = {
    alias: 'AXIOM_47',
    zona: 'Distrito Centro',
    bio: 'Especialista en protección, rutas seguras y extracción de objetivos.',
  };

  habilidades: Habilidad[] = [
    { nombre: 'Protección', nivel: 92 },
    { nombre: 'Rastreo', nivel: 78 },
    { nombre: 'Recuperación', nivel: 64 },
  ];

  private readonly nivelInicial = 40;
  private readonly minimoAlias = 3;

  selectorAbierto = false;
  formError = '';
  toast = '';

  get mostrarEspecialidades(): boolean {
    return this.route.snapshot.data['mostrarEspecialidades'] === true;
  }

  get iniciales(): string {
    return this.perfil.alias.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase();
  }

  etiquetaNivel(nivel: number): string {
    if (nivel >= 85) return 'EXPERTO';
    if (nivel >= 70) return 'AVANZADO';
    if (nivel >= 60) return 'INTERMEDIO';
    return 'PRINCIPIANTE';
  }

  // ---------- Datos del perfil ----------
  guardar(event: Event, alias: HTMLInputElement, zona: HTMLSelectElement, bio: HTMLTextAreaElement): void {
    event.preventDefault();
    const nuevoAlias = alias.value.trim();

    if (nuevoAlias.length < this.minimoAlias) {
      this.formError = `El alias debe tener al menos ${this.minimoAlias} caracteres.`;
      return;
    }

    this.perfil = { alias: nuevoAlias, zona: zona.value, bio: bio.value.trim() };
    this.formError = '';
    this.notify('Perfil actualizado');
  }

  // ---------- Especialidades ----------
  abrirSelector(): void {
    this.selectorAbierto = true;
  }

  cerrarSelector(): void {
    this.selectorAbierto = false;
  }

  yaAnadida(nombre: string): boolean {
    return this.habilidades.some((h) => h.nombre === nombre);
  }

  anadir(nombre: string): void {
    if (this.yaAnadida(nombre)) return;
    this.habilidades = [...this.habilidades, { nombre, nivel: this.nivelInicial }];
    this.selectorAbierto = false;
    this.notify(`${nombre} añadida al perfil`);
  }

  quitar(skill: Habilidad): void {
    this.habilidades = this.habilidades.filter((h) => h !== skill);
    this.notify(`${skill.nombre} quitada del perfil`);
  }

  private notify(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2800);
  }
}
