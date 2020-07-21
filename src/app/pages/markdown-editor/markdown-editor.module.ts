import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModulesModule } from '../../material-modules';
import { CodeEditorComponent } from '../code-editor/code-editor.component';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';


@NgModule({
  declarations: [
    CodeEditorComponent,
    MarkdownEditorComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
  ],
  exports: [
    CodeEditorComponent,
    MarkdownEditorComponent,
  ]
})
export class MarkdownEditorModule { }
