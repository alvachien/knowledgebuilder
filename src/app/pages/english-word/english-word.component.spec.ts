import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnglishWordComponent } from './english-word.component';

describe('EnglishWordComponent', () => {
  let component: EnglishWordComponent;
  let fixture: ComponentFixture<EnglishWordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnglishWordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnglishWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
