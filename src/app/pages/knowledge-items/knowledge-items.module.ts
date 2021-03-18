import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { ImageUploadModule } from '../image-upload/image-upload.module';
import { KnowledgeItemsRoutingModule } from './knowledge-items-routing.module';
import { KnowledgeItemsComponent } from './knowledge-items.component';
import { KnowledgeItemDetailComponent } from './knowledge-item-detail/knowledge-item-detail.component';
// import { MY_DATE_FORMATS, AppDateAdapter, } from 'src/app/models';

@NgModule({
  declarations: [
    KnowledgeItemsComponent,
    KnowledgeItemDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    ImageUploadModule,
    MonacoEditorModule,
    MarkdownModule.forChild(),
    KnowledgeItemsRoutingModule,
    TranslocoModule,
  ],
  providers: [
    // { provide: DateAdapter, useClass: AppDateAdapter },
    // { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ]
})
export class KnowledgeItemsModule { }
