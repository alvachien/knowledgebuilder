import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ACMarkdownEditorComponent } from './acmarkdown-editor/acmarkdown-editor.component';

@NgModule({
  declarations: [ACMarkdownEditorComponent],
  imports: [
    CommonModule
  ],
  exports: [
    ACMarkdownEditorComponent,
  ]
})
export class ReusableComponentModule { }
