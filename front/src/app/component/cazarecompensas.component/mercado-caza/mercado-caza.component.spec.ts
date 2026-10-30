import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MercadoCazaComponent } from './mercado-caza.component';

describe('MercadoCazaComponent', () => {
  let component: MercadoCazaComponent;
  let fixture: ComponentFixture<MercadoCazaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MercadoCazaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MercadoCazaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
