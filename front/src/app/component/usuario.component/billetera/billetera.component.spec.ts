import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BilleteraComponent } from './billetera.component';

describe('BilleteraComponent', () => {
  let component: BilleteraComponent;
  let fixture: ComponentFixture<BilleteraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BilleteraComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BilleteraComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
