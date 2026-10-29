import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisionesComponent } from './misiones.component';

describe('MisionesComponent', () => {
  let component: MisionesComponent;
  let fixture: ComponentFixture<MisionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MisionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MisionesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
