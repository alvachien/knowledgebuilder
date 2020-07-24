import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MonacoEditorModule } from 'ngx-monaco-editor';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { MaterialModulesModule } from '../../material-modules';

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
    FormsModule,
    ReactiveFormsModule,
    QuestionBankItemsRoutingModule,

    MonacoEditorModule,
    MarkdownModule.forChild(),
    MaterialModulesModule,
  ]
})
export class QuestionBankItemsModule { }
