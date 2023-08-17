import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentencesDetailComponent } from './sentences-detail.component';

describe('SentencesDetailComponent', () => {
  let component: SentencesDetailComponent;
  let fixture: ComponentFixture<SentencesDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SentencesDetailComponent]
    });
    fixture = TestBed.createComponent(SentencesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
