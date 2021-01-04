import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeItemsComponent } from './knowledge-items.component';

describe('KnowledgeItemsComponent', () => {
  let component: KnowledgeItemsComponent;
  let fixture: ComponentFixture<KnowledgeItemsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KnowledgeItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
