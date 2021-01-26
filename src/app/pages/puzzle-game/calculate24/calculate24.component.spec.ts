import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Calculate24Component } from './calculate24.component';

describe('Calculate24Component', () => {
  let component: Calculate24Component;
  let fixture: ComponentFixture<Calculate24Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Calculate24Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Calculate24Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
