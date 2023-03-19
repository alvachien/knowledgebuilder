import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonacoEditorComponentComponent } from './monaco-editor-component.component';

describe('MonacoEditorComponentComponent', () => {
  let component: MonacoEditorComponentComponent;
  let fixture: ComponentFixture<MonacoEditorComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonacoEditorComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonacoEditorComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
