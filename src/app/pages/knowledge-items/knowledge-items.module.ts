import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MonacoEditorModule } from 'ngx-monaco-editor';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { MaterialModulesModule } from '../../material-modules';
import { KnowledgeItemsRoutingModule } from './knowledge-items-routing.module';
import { KnowledgeItemsComponent } from './knowledge-items.component';
import { KnowledgeItemDetailComponent } from './knowledge-item-detail/knowledge-item-detail.component';


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
    MonacoEditorModule,
    MarkdownModule.forChild(),
    KnowledgeItemsRoutingModule,
  ],
})
export class KnowledgeItemsModule { }
