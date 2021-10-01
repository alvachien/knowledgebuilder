import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardRuleGenerationComponent } from './award-rule-generation.component';

describe('AwardRuleGenerationComponent', () => {
  let component: AwardRuleGenerationComponent;
  let fixture: ComponentFixture<AwardRuleGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwardRuleGenerationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardRuleGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
