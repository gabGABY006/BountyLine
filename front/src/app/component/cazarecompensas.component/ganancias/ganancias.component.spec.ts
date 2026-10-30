import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GananciasComponent } from './ganancias.component';

describe('GananciasComponent', () => {
  let component: GananciasComponent;
  let fixture: ComponentFixture<GananciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GananciasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GananciasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
