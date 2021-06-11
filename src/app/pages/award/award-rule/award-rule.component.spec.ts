import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardRuleComponent } from './award-rule.component';

describe('AwardRuleComponent', () => {
  let component: AwardRuleComponent;
  let fixture: ComponentFixture<AwardRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwardRuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
