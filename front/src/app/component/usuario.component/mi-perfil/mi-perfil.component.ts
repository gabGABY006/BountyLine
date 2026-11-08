import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { ApiService, CuentaApi, HabilidadApi, ZonaApi } from '../../../service/api.service';
import { Catalogo, CatalogoService } from '../../../service/catalogo.service';
import { AuthService } from '../../../service/auth.service';

interface Habilidad { id: number; idEspecialidad: number; nombre: string; nivel: number; }
@Component({ selector: 'app-mi-perfil', standalone: false, styleUrl: './mi-perfil.component.css', templateUrl: './mi-perfil.component.html' })
export class MiPerfilComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute, private api: ApiService, private catalogos: CatalogoService, private auth: AuthService, private cdr: ChangeDetectorRef) {}
  readonly cero = 0;
  zonas: ZonaApi[] = [];
  especialidades: Catalogo[] = [];
  perfil = { alias: '', correo: '', idZona: 0, zona: '', bio: '', disponibilidad: 'DISPONIBLE' };
  habilidades: Habilidad[] = [];
  private idsPorNombre = new Map<string, number>();
  private readonly nivelInicial = 3;
  selectorAbierto = false;
  formError = '';
  toast = '';
  cargando = true;
  correoOriginal = '';
  contrasenaActual = '';
  contrasenaNueva = '';
  contrasenaConfirmar = '';
  errorContrasena = '';
  guardandoContrasena = false;
  get mostrarEspecialidades(): boolean { return this.route.snapshot.data['mostrarEspecialidades'] === true; }
  get esAdministrador(): boolean { return this.route.snapshot.data['esAdministrador'] === true; }
  get iniciales(): string { return this.perfil.alias.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase(); }
  ngOnInit(): void {
    this.perfil.alias = this.auth.sesion?.alias ?? '';
    if (this.mostrarEspecialidades) this.catalogos.especialidades().subscribe({ next: (e) => { this.especialidades = e; this.idsPorNombre = new Map(e.map((x) => [x.nombre, x.id])); this.cdr.markForCheck(); }, error: () => this.cdr.markForCheck() });
    const id = this.auth.sesion?.idCuenta;
    if (!id) { this.cargando = false; this.formError = 'No se encontró la sesión.'; this.cdr.markForCheck(); return; }
    if (this.esAdministrador) {
      this.api.cuenta(id).subscribe({ next: (cuenta) => { this.perfil.alias = cuenta.alias; this.perfil.correo = cuenta.correo; this.correoOriginal = cuenta.correo; this.cargando = false; this.cdr.markForCheck(); }, error: () => { this.cargando = false; this.formError = 'No se pudo cargar el perfil.'; this.cdr.markForCheck(); } });
      return;
    }
    if (this.mostrarEspecialidades) {
      forkJoin({ perfil: this.api.miCazador(), cuenta: this.api.cuenta(id), habilidades: this.api.habilidades(id), zonas: this.api.zonas() }).subscribe({ next: ({ perfil, cuenta, habilidades, zonas }) => { this.perfil = { alias: perfil.alias, correo: cuenta.correo, idZona: perfil.idZona, zona: perfil.zona, bio: perfil.biografia ?? '', disponibilidad: perfil.disponibilidad }; this.correoOriginal = cuenta.correo; this.zonas = zonas; this.habilidades = habilidades.map((h: HabilidadApi) => ({ id: h.idEspecialidad, idEspecialidad: h.idEspecialidad, nombre: h.especialidad, nivel: h.nivel * 20 })); this.cargando = false; this.cdr.markForCheck(); }, error: () => { this.cargando = false; this.formError = 'No se pudo cargar el perfil.'; this.cdr.markForCheck(); } });
    } else {
      forkJoin({ perfil: this.api.miUsuario(), cuenta: this.api.cuenta(id) }).subscribe({ next: ({ perfil, cuenta }) => { this.perfil = { alias: perfil.alias, correo: cuenta.correo, idZona: 0, zona: '', bio: perfil.biografia ?? '', disponibilidad: 'DISPONIBLE' }; this.correoOriginal = cuenta.correo; this.cargando = false; this.cdr.markForCheck(); }, error: () => { this.cargando = false; this.formError = 'No se pudo cargar el perfil.'; this.cdr.markForCheck(); } });
    }
  }
  etiquetaNivel(nivel: number): string { if (nivel >= 85) return 'EXPERTO'; if (nivel >= 70) return 'AVANZADO'; if (nivel >= 60) return 'INTERMEDIO'; return 'PRINCIPIANTE'; }
  guardar(event: Event): void {
    event.preventDefault();
    const texto = this.perfil.bio.trim();
    const correo = this.perfil.correo.trim();
    if (this.esAdministrador) {
      if (correo === this.correoOriginal) { this.notify('No hay cambios por guardar'); return; }
      this.api.cambiarCorreo(correo).subscribe({ next: (cuenta) => { this.perfil.correo = cuenta.correo; this.correoOriginal = cuenta.correo; this.formError = ''; this.notify('Perfil actualizado'); this.cdr.markForCheck(); }, error: (err) => { this.formError = this.auth.mensajeDeError(err); this.cdr.markForCheck(); } });
      return;
    }
    const guardarPerfil = this.mostrarEspecialidades
      ? this.api.actualizarCazador({ idZona: Number(this.perfil.idZona), biografia: texto, disponibilidad: this.perfil.disponibilidad })
      : this.api.actualizarUsuario(texto);
    const guardarCorreo = correo !== this.correoOriginal ? this.api.cambiarCorreo(correo) : of(null);
    forkJoin({ perfil: guardarPerfil, cuenta: guardarCorreo }).subscribe({ next: ({ perfil, cuenta }) => { this.perfil.bio = perfil.biografia ?? texto; if (cuenta) this.perfil.correo = (cuenta as CuentaApi).correo; this.correoOriginal = this.perfil.correo; this.formError = ''; this.notify('Perfil actualizado'); this.cdr.markForCheck(); }, error: (err) => { this.formError = this.auth.mensajeDeError(err); this.cdr.markForCheck(); } });
  }
  cambiarContrasena(event: Event): void {
    event.preventDefault();
    this.errorContrasena = '';
    if (!this.contrasenaActual || !this.contrasenaNueva || !this.contrasenaConfirmar) { this.errorContrasena = 'Completa los tres campos.'; this.cdr.markForCheck(); return; }
    if (this.contrasenaNueva.length < 8 || this.contrasenaNueva.length > 72) { this.errorContrasena = 'La nueva contraseña debe tener entre 8 y 72 caracteres.'; this.cdr.markForCheck(); return; }
    if (this.contrasenaNueva !== this.contrasenaConfirmar) { this.errorContrasena = 'Las contraseñas nuevas no coinciden.'; this.cdr.markForCheck(); return; }
    if (this.contrasenaNueva === this.contrasenaActual) { this.errorContrasena = 'La nueva contraseña debe ser distinta de la actual.'; this.cdr.markForCheck(); return; }
    this.guardandoContrasena = true;
    this.api.cambiarContrasena(this.contrasenaActual, this.contrasenaNueva).subscribe({ next: () => { this.contrasenaActual = ''; this.contrasenaNueva = ''; this.contrasenaConfirmar = ''; this.errorContrasena = ''; this.guardandoContrasena = false; this.notify('Contraseña actualizada'); this.cdr.markForCheck(); }, error: (err) => { this.errorContrasena = this.auth.mensajeDeError(err); this.guardandoContrasena = false; this.cdr.markForCheck(); } });
  }
  abrirSelector(): void { this.selectorAbierto = true; }
  cerrarSelector(): void { this.selectorAbierto = false; }
  yaAnadida(nombre: string): boolean { return this.habilidades.some((h) => h.nombre === nombre); }
  anadir(nombre: string): void { const id = this.idsPorNombre.get(nombre); if (id == null || this.yaAnadida(nombre)) return; this.api.agregarHabilidad(id, this.nivelInicial).subscribe({ next: (list) => { this.habilidades = list.map((h) => ({ id: h.idEspecialidad, idEspecialidad: h.idEspecialidad, nombre: h.especialidad, nivel: h.nivel * 20 })); this.selectorAbierto = false; this.notify(`${nombre} añadida al perfil`); this.cdr.markForCheck(); }, error: () => { this.formError = 'No se pudo añadir la especialidad.'; this.cdr.markForCheck(); } }); }
  quitar(skill: Habilidad): void { this.api.quitarHabilidad(skill.idEspecialidad).subscribe({ next: () => { this.habilidades = this.habilidades.filter((h) => h !== skill); this.notify(`${skill.nombre} quitada del perfil`); this.cdr.markForCheck(); }, error: () => { this.formError = 'No se pudo quitar la especialidad.'; this.cdr.markForCheck(); } }); }
  private notify(message: string): void { this.toast = message; this.cdr.markForCheck(); setTimeout(() => { this.toast = ''; this.cdr.markForCheck(); }, 2800); }
}
