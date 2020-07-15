import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionBankItemDetailComponent } from './question-bank-item-detail.component';

describe('QuestionBankItemDetailComponent', () => {
  let component: QuestionBankItemDetailComponent;
  let fixture: ComponentFixture<QuestionBankItemDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionBankItemDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionBankItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
