import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModulesModule } from '../../material-modules';
import { QuizRoutingModule } from './quiz-routing.module';
import { QuizComponent } from '../quiz/quiz.component';
import { QuizCreateComponent } from './quiz-create/quiz-create.component';


@NgModule({
  declarations: [
    QuizComponent,
    QuizCreateComponent,
  ],
  imports: [
    CommonModule,
    QuizRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
  ]
})
export class QuizModule { }
