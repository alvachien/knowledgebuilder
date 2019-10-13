import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownEditorExampleComponent } from './markdown-editor-example.component';

describe('MarkdownEditorExampleComponent', () => {
  let component: MarkdownEditorExampleComponent;
  let fixture: ComponentFixture<MarkdownEditorExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkdownEditorExampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownEditorExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
