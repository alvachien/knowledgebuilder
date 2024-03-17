import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeniorPhysicsComponent } from './senior-physics.component';

describe('SeniorMathComponent', () => {
  let component: SeniorPhysicsComponent;
  let fixture: ComponentFixture<SeniorPhysicsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeniorPhysicsComponent],
    });
    fixture = TestBed.createComponent(SeniorPhysicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
