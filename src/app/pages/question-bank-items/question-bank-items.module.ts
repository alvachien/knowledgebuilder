import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonacoEditorModule } from 'ngx-monaco-editor';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { QuestionBankItemsRoutingModule } from './question-bank-items-routing.module';
import { QuestionBankItemsComponent } from './question-bank-items.component';
import { QuestionBankItemDetailComponent } from './question-bank-item-detail/question-bank-item-detail.component';


@NgModule({
  declarations: [
    QuestionBankItemsComponent,
    QuestionBankItemDetailComponent,
  ],
  imports: [
    CommonModule,
    QuestionBankItemsRoutingModule,

    MonacoEditorModule,
    MarkdownModule.forChild(),
  ]
})
export class QuestionBankItemsModule { }
