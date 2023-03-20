import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { QuizSummaryComponent } from './quiz-summary.component';
import { QuizSummaryRoutingModule } from './quiz-summary-routing.module';
import { QuizSummaryDetailComponent } from './quiz-summary-detail';

@NgModule({
  declarations: [QuizSummaryComponent, QuizSummaryDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    QuizSummaryRoutingModule,
    TranslocoModule,
  ],
})
export class QuizSummaryModule {}
