import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { MiPerfilComponent } from './mi-perfil.component';

describe('MiPerfilComponent', () => {
  let component: MiPerfilComponent;
  let fixture: ComponentFixture<MiPerfilComponent>;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [MiPerfilComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } }],
    }).compileComponents();
    fixture = TestBed.createComponent(MiPerfilComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    await fixture.whenStable();
  });
  afterEach(() => http.verify());
  it('should create', () => { expect(component).toBeTruthy(); });
  it('hides specialties for a normal user profile', () => {
    expect(component.mostrarEspecialidades).toBe(false);
    expect(fixture.nativeElement.querySelector('.specialty-editor')).toBeNull();
    expect(fixture.nativeElement.querySelector('.modal-backdrop')).toBeNull();
  });
  it('does not send a request when the new passwords do not match', () => {
    component.contrasenaActual = 'claveActual1';
    component.contrasenaNueva = 'claveNueva2';
    component.contrasenaConfirmar = 'otraClaveNueva';
    component.cambiarContrasena(new Event('submit'));
    http.expectNone((request) => request.url.endsWith('/cuentas/yo/contrasena'));
    expect(component.errorContrasena).toBe('Las contraseñas nuevas no coinciden.');
  });
});
