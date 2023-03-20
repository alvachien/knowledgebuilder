import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuizSummaryComponent } from './quiz-summary.component';
import { QuizSummaryDetailComponent } from './quiz-summary-detail';

const routes: Routes = [
  { path: '', component: QuizSummaryComponent },
  { path: 'display/:id', component: QuizSummaryDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuizSummaryRoutingModule {}
