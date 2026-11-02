import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegistroPeticion } from '../../service/auth.service';
import { Catalogo, CatalogoService } from '../../service/catalogo.service';

@Component({
  selector: 'app-registro',
  standalone: false,
  styleUrl: './registro.component.css',
  templateUrl: './registro.component.html',
})
export class RegistroComponent implements OnInit {
  rolInicial: 'NORMAL' | 'CAZARRECOMPENSAS' = 'NORMAL';

  alias = '';
  correo = '';
  contrasenia = '';
  confirmacion = '';
  descripcion = '';
  aceptaTerminos = false;
  terminosAbiertos = false;
  zonaId: number | null = null;
  mensaje = '';
  cargando = false;

  readonly terminos = [
    'Aceptación: Al registrarte, aceptas estas condiciones de uso.',
    'Uso de la plataforma: BountyLine permite publicar misiones, participar en ellas e interactuar con otros usuarios.',
    'Registro: Debes proporcionar información verdadera y mantener segura tu cuenta.',
    'Perfiles: Cada usuario debe utilizar su perfil de forma adecuada. El acceso de administrador es exclusivo para personas autorizadas.',
    'Misiones: Las misiones deben tener información clara, respetar las normas y no promover actividades ilegales o peligrosas.',
    'Recompensas: Las recompensas son virtuales y no representan dinero real ni pueden retirarse.',
    'Comunicación: Las publicaciones, comentarios y chats deben ser respetuosos y no vulnerar la privacidad de otras personas.',
    'Calificaciones: Las valoraciones deben ser honestas y estar relacionadas con las experiencias reales.',
    'Reportes: Puedes reportar comportamientos o contenidos inadecuados cuando esta función esté disponible.',
    'Uso responsable: No está permitido manipular la plataforma, acceder a cuentas ajenas ni afectar su funcionamiento.',
    'Datos personales: Tu información debe tratarse conforme a las condiciones de privacidad y las normas aplicables.',
    'Prototipo académico: Algunas funciones pueden ser demostrativas y no guardar información permanentemente.',
    'Actualizaciones: Las condiciones pueden cambiar cuando se actualice la plataforma.',
    'Incumplimiento: El uso inadecuado puede ocasionar restricciones según las reglas de la plataforma.',
    'Aceptación final: Al marcar la casilla, confirmas que leíste y aceptas estas condiciones.',
  ];

  // Catálogos: se cargan desde el back (GET /api/zonas y /api/especialidades)
  zonas: Catalogo[] = [];
  especialidades: Catalogo[] = [];

  readonly niveles = [1, 2, 3, 4, 5];
  especialidadesMarcadas: Record<number, boolean> = {};
  nivelesEspecialidad: Record<number, number> = {};

  constructor(
    private auth: AuthService,
    private catalogos: CatalogoService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.catalogos.zonas().subscribe({
      next: (z) => (this.zonas = z),
      error: (err) => (this.mensaje = this.auth.mensajeDeError(err)),
    });
    this.catalogos.especialidades().subscribe({
      next: (e) => {
        this.especialidades = e;
        e.forEach((x) => (this.nivelesEspecialidad[x.id] = 1));
      },
      error: (err) => (this.mensaje = this.auth.mensajeDeError(err)),
    });
  }

  get contraseniasCoinciden(): boolean {
    return this.contrasenia === this.confirmacion;
  }

  registrar(form: NgForm): void {
    this.mensaje = '';

    if (!this.aceptaTerminos) {
      this.mensaje = 'Debes aceptar los términos y condiciones para crear una cuenta.';
      return;
    }

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.mensaje = 'Completa correctamente todos los campos obligatorios.';
      return;
    }

    if (!this.contraseniasCoinciden) {
      this.mensaje = 'Las contraseñas no coinciden.';
      return;
    }

    const esCazador = this.rolInicial === 'CAZARRECOMPENSAS';
    const seleccionadas = this.especialidades.filter((e) => this.especialidadesMarcadas[e.id]);

    if (esCazador) {
      if (!this.descripcion.trim()) {
        this.mensaje = 'La descripción es obligatoria para cazarrecompensas.';
        return;
      }
      if (this.zonaId === null) {
        this.mensaje = 'Selecciona tu zona base.';
        return;
      }
      if (seleccionadas.length === 0) {
        this.mensaje = 'Selecciona al menos una especialidad.';
        return;
      }
    }

    // Armamos exactamente lo que espera CuentaDto.Registro en el back
    const datos: RegistroPeticion = {
      correo: this.correo.trim(),
      alias: this.alias.trim(),
      contrasena: this.contrasenia,
      rol: esCazador ? 'CAZARRECOMPENSAS' : 'USUARIO',
      biografia: this.descripcion.trim() || null,
      idZona: esCazador ? this.zonaId : null,
      especialidades: esCazador
        ? seleccionadas.map((e) => ({ id: e.id, nivel: this.nivelesEspecialidad[e.id] }))
        : null,
    };

    this.cargando = true;
    this.auth.registrar(datos).subscribe({
      next: (sesion) => {
        this.cargando = false;
        void this.router.navigate([this.auth.rutaInicio(sesion.rol)]);
      },
      error: (err) => {
        this.cargando = false;
        this.mensaje = this.auth.mensajeDeError(err);
      },
    });
  }
}
