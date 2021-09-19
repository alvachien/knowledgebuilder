import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCollectionDetailComponent } from './user-collection-detail.component';

describe('UserCollectionDetailComponent', () => {
  let component: UserCollectionDetailComponent;
  let fixture: ComponentFixture<UserCollectionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserCollectionDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCollectionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
