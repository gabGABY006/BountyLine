import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CazadoresComponent } from './cazadores.component';

describe('CazadoresComponent', () => {
  let component: CazadoresComponent;
  let fixture: ComponentFixture<CazadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CazadoresComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CazadoresComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
