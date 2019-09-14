import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcMarkdownEditorComponent } from './ac-markdown-editor.component';

describe('AcMarkdownEditorComponent', () => {
  let component: AcMarkdownEditorComponent;
  let fixture: ComponentFixture<AcMarkdownEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcMarkdownEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcMarkdownEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
