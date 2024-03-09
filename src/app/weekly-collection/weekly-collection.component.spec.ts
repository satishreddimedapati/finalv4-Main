import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyCollectionComponent } from './weekly-collection.component';

describe('WeeklyCollectionComponent', () => {
  let component: WeeklyCollectionComponent;
  let fixture: ComponentFixture<WeeklyCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WeeklyCollectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WeeklyCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
