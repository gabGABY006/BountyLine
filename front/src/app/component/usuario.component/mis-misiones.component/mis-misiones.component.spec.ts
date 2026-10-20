import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisMisionesComponent } from './mis-misiones.component';

describe('MisMisionesComponent', () => {
  let component: MisMisionesComponent;
  let fixture: ComponentFixture<MisMisionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MisMisionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MisMisionesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
