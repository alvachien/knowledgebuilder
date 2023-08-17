import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentencesListComponent } from './sentences-list.component';

describe('SentencesListComponent', () => {
  let component: SentencesListComponent;
  let fixture: ComponentFixture<SentencesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SentencesListComponent]
    });
    fixture = TestBed.createComponent(SentencesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
