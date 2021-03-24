import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeItemSearchComponent } from './knowledge-item-search.component';

describe('KnowledgeItemSearchComponent', () => {
  let component: KnowledgeItemSearchComponent;
  let fixture: ComponentFixture<KnowledgeItemSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeItemSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeItemSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
