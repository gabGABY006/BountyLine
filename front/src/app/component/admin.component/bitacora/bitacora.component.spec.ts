import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter, RouterModule } from '@angular/router';
import { API_URL } from '../../../config/api';
import { BitacoraComponent } from './bitacora.component';

describe('BitacoraComponent', () => {
  let component: BitacoraComponent;
  let fixture: ComponentFixture<BitacoraComponent>;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BitacoraComponent],
      imports: [FormsModule, RouterModule],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(BitacoraComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(`${API_URL}/bitacora?limite=500`).flush([]);
    await fixture.whenStable();
  });
  afterEach(() => http.verify());
  it('should create', () => { expect(component).toBeTruthy(); });
  it('displays MISION events as MISIÓN and finishes loading', () => {
    component.ngOnInit();
    http.expectOne(`${API_URL}/bitacora?limite=500`).flush([{
      tipo: 'MISION', accion: 'Misión publicada', fecha: '2026-11-02T18:21:00', idCuenta: 4,
      operador: 'AXIOM_47', referencia: 'MISIÓN-8', idMision: 8, detalle: 'Distrito Centro',
    }]);
    expect(component.events[0].type).toBe('MISIÓN');
    expect(component.cargando).toBe(false);
  });
});
