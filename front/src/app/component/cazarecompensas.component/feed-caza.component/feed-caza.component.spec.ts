import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedCazaComponent } from './feed-caza.component';

describe('FeedCazaComponent', () => {
  let component: FeedCazaComponent;
  let fixture: ComponentFixture<FeedCazaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeedCazaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedCazaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
