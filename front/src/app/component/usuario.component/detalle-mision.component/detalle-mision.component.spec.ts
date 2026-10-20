import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleMisionComponent } from './detalle-mision.component';

describe('DetalleMisionComponent', () => {
  let component: DetalleMisionComponent;
  let fixture: ComponentFixture<DetalleMisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalleMisionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleMisionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
