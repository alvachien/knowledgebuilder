import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { PrimarySchoolMathComponent } from './primary-school-math.component';
import { AdditionExerciseComponent } from './addition-exercise';
import { SubtractionExerciseComponent } from './subtraction-exercise';
import { MultiplicationExerciseComponent } from './multiplication-exercise';
import { DivisionExerciseComponent } from './division-exercise';
import { MixedOperationsComponent } from './mixed-operations';
import { PrimarySchoolMathRoutingModule } from './primary-school-math-routing.module';
import { PrintableQuizComponent } from './printable-quiz/printable-quiz.component';
import { PrintableQuizSectionComponent } from './printable-quiz-section/printable-quiz-section.component';
import { PrintableQuizSectionItemComponent } from './printable-quiz-section-item/printable-quiz-section-item.component';

@NgModule({
  declarations: [
    PrimarySchoolMathComponent,
    AdditionExerciseComponent,
    SubtractionExerciseComponent,
    MultiplicationExerciseComponent,
    DivisionExerciseComponent,
    MixedOperationsComponent,
    PrintableQuizComponent,
    PrintableQuizSectionComponent,
    PrintableQuizSectionItemComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    MarkdownModule.forChild(),
    PrimarySchoolMathRoutingModule,
    TranslocoModule,
  ],
})
export class PrimarySchoolMathModule { }
