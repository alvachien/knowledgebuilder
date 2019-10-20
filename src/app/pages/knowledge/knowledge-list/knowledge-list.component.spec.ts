import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeListComponent } from './knowledge-list.component';

describe('KnowledgeListComponent', () => {
  let component: KnowledgeListComponent;
  let fixture: ComponentFixture<KnowledgeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnowledgeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
