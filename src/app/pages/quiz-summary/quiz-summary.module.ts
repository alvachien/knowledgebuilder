import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { QuizSummaryComponent } from './quiz-summary.component';
import { QuizSummaryRoutingModule } from './quiz-summary-routing.module';
import { QuizSummaryDetailComponent } from './quiz-summary-detail';

@NgModule({
  declarations: [
    QuizSummaryComponent,
    QuizSummaryDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    MonacoEditorModule,
    MarkdownModule.forChild(),
    QuizSummaryRoutingModule,
    TranslocoModule,
  ],
})
export class QuizSummaryModule { }
