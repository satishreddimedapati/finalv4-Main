import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedUsersComponent } from './red-users.component';

describe('RedUsersComponent', () => {
  let component: RedUsersComponent;
  let fixture: ComponentFixture<RedUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RedUsersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RedUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
