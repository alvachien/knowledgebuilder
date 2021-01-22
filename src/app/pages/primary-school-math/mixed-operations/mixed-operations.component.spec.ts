import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MixedOperationsComponent } from './mixed-operations.component';

describe('MixedOperationsComponent', () => {
  let component: MixedOperationsComponent;
  let fixture: ComponentFixture<MixedOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MixedOperationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MixedOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
