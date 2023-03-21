import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';
import { MarkdownModule } from 'ngx-markdown';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { ImageUploadModule } from '../image-upload/image-upload.module';
import { KnowledgeItemsRoutingModule } from './knowledge-items-routing.module';
import { KnowledgeItemsComponent } from './knowledge-items.component';
import { KnowledgeItemDetailComponent } from './knowledge-item-detail';
import { KnowledgeItemSearchComponent } from './knowledge-item-search';
// import { MY_DATE_FORMATS, AppDateAdapter, } from 'src/app/models';
import { AppUIModule } from 'src/app/app-ui.module';
import { KnowledgeItemAddToCollDialog } from './knowledge-items-add-coll-dlg.component';

@NgModule({
  declarations: [
    KnowledgeItemsComponent,
    KnowledgeItemDetailComponent,
    KnowledgeItemSearchComponent,
    KnowledgeItemAddToCollDialog,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    ImageUploadModule,
    NuMonacoEditorModule,
    MarkdownModule.forChild(),
    KnowledgeItemsRoutingModule,
    TranslocoModule,
    AppUIModule,
  ],
  providers: [],
})
export class KnowledgeItemsModule {}
