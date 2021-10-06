import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardRuleDisplayComponent } from './award-rule-display.component';

describe('AwardRuleDisplayComponent', () => {
  let component: AwardRuleDisplayComponent;
  let fixture: ComponentFixture<AwardRuleDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwardRuleDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardRuleDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
