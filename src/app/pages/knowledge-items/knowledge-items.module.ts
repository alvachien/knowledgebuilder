import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModulesModule } from '../../material-modules';
import { KnowledgeItemsRoutingModule } from './knowledge-items-routing.module';
import { KnowledgeItemsComponent } from './knowledge-items.component';
import { KnowledgeItemDetailComponent } from './knowledge-item-detail/knowledge-item-detail.component';
import { MarkdownEditorModule } from '../markdown-editor/markdown-editor.module';


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
    MarkdownEditorModule,
    KnowledgeItemsRoutingModule,
  ],
})
export class KnowledgeItemsModule { }
