import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisMisionesCazaComponent } from './mis-misiones-caza.component';

describe('MisMisionesCazaComponent', () => {
  let component: MisMisionesCazaComponent;
  let fixture: ComponentFixture<MisMisionesCazaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MisMisionesCazaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MisMisionesCazaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
