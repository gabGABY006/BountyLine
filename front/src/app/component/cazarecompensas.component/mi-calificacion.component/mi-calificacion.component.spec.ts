import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiCalificacionComponent } from './mi-calificacion.component';

describe('MiCalificacionComponent', () => {
  let component: MiCalificacionComponent;
  let fixture: ComponentFixture<MiCalificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MiCalificacionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MiCalificacionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
