import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CazarecompensasComponent } from './cazarecompensas.component';

describe('CazarecompensasComponent', () => {
  let component: CazarecompensasComponent;
  let fixture: ComponentFixture<CazarecompensasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CazarecompensasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CazarecompensasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
