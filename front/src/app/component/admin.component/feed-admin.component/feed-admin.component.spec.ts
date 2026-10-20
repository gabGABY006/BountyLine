import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedAdminComponent } from './feed-admin.component';

describe('FeedAdminComponent', () => {
  let component: FeedAdminComponent;
  let fixture: ComponentFixture<FeedAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeedAdminComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedAdminComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
