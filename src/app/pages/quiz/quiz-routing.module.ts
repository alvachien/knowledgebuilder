import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuizComponent } from './quiz.component';
import { QuizCreateComponent } from './quiz-create';

const routes: Routes = [
  { path: '', component: QuizComponent },
  { path: 'create', component: QuizCreateComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuizRoutingModule { }
