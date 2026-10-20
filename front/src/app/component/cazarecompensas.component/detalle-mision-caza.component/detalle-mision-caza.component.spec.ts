import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleMisionCazaComponent } from './detalle-mision-caza.component';

describe('DetalleMisionCazaComponent', () => {
  let component: DetalleMisionCazaComponent;
  let fixture: ComponentFixture<DetalleMisionCazaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalleMisionCazaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleMisionCazaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
