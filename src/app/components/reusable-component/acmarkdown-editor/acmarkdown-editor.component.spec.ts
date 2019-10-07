import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ACMarkdownEditorComponent } from './acmarkdown-editor.component';

describe('ACMarkdownEditorComponent', () => {
  let component: ACMarkdownEditorComponent;
  let fixture: ComponentFixture<ACMarkdownEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ACMarkdownEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ACMarkdownEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
