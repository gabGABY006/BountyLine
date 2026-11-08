import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../config/api';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('changes the password with PUT and the expected body', () => {
    api.cambiarContrasena('claveActual1', 'claveNueva2').subscribe();
    const req = http.expectOne(`${API_URL}/cuentas/yo/contrasena`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ actual: 'claveActual1', nueva: 'claveNueva2' });
    req.flush(null);
  });
  it('loads filtered audit events', () => {
    api.bitacora(100, 'PAGO').subscribe();
    const req = http.expectOne((request) => request.url === `${API_URL}/bitacora`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limite')).toBe('100');
    expect(req.request.params.get('tipo')).toBe('PAGO');
    req.flush([]);
  });
});
