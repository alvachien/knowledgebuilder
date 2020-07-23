import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModulesModule } from '../../material-modules';
import { MonacoEditorModule } from 'ngx-monaco-editor';

import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';


@NgModule({
  declarations: [
    MarkdownEditorComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MonacoEditorModule,
    MaterialModulesModule,
  ],
  exports: [
    MarkdownEditorComponent,
  ]
})
export class MarkdownEditorModule { }
