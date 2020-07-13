import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeDetailComponent } from './knowledge-detail.component';

describe('KnowledgeDetailComponent', () => {
  let component: KnowledgeDetailComponent;
  let fixture: ComponentFixture<KnowledgeDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnowledgeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
