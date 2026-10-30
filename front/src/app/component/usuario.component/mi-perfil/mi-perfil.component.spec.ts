import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MiPerfilComponent } from './mi-perfil.component';

describe('MiPerfilComponent', () => {
  let component: MiPerfilComponent;
  let fixture: ComponentFixture<MiPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [MiPerfilComponent],
      providers: [{
        provide: ActivatedRoute,
        useValue: { snapshot: { data: {} } },
      }],
    }).compileComponents();

    fixture = TestBed.createComponent(MiPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hides specialties for a normal user profile', () => {
    expect(component.mostrarEspecialidades).toBe(false);
    expect(fixture.nativeElement.querySelector('.specialty-editor')).toBeNull();
    expect(fixture.nativeElement.querySelector('.modal-backdrop')).toBeNull();
  });
});
