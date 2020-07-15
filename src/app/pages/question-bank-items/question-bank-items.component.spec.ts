import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionBankItemsComponent } from './question-bank-items.component';

describe('QuestionBankItemsComponent', () => {
  let component: QuestionBankItemsComponent;
  let fixture: ComponentFixture<QuestionBankItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionBankItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionBankItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
