import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor';
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

@NgModule({
  declarations: [
    PrimarySchoolMathComponent,
    AdditionExerciseComponent,
    SubtractionExerciseComponent,
    MultiplicationExerciseComponent,
    DivisionExerciseComponent,
    MixedOperationsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    MonacoEditorModule,
    MarkdownModule.forChild(),
    PrimarySchoolMathRoutingModule,
    TranslocoModule,
  ],
})
export class PrimarySchoolMathModule { }
