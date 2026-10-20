import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevaMisionComponent } from './nueva-mision.component';

describe('NuevaMisionComponent', () => {
  let component: NuevaMisionComponent;
  let fixture: ComponentFixture<NuevaMisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NuevaMisionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevaMisionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
