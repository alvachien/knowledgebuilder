import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { MaterialModulesModule } from '../../material-modules';
import { ImageUploadComponent } from './image-upload.component';


@NgModule({
  declarations: [
    ImageUploadComponent,
  ],
  entryComponents: [
    ImageUploadComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    MonacoEditorModule,
    MarkdownModule.forChild(),
  ],
  exports: [
    ImageUploadComponent,
  ]
})
export class ImageUploadModule { }
