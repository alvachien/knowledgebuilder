import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonacoEditorComponentComponent } from './monaco-editor-component/monaco-editor-component.component';
import { MonacoEditorService } from './monaco-editor.service';

@NgModule({
  declarations: [
    MonacoEditorComponentComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
    MonacoEditorService,
  ],
  exports: [
    MonacoEditorComponentComponent
  ]
})
export class ReusableComponentsModule { }
