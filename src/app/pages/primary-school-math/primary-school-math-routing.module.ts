import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrimarySchoolMathComponent } from './primary-school-math.component';
import { AdditionExerciseComponent } from './addition-exercise';
import { SubtractionExerciseComponent } from './subtraction-exercise';
import { MultiplicationExerciseComponent } from './multiplication-exercise';
import { DivisionExerciseComponent } from './division-exercise';

const routes: Routes = [
  { path: '', component: PrimarySchoolMathComponent },
  { path: 'add-ex', component: AdditionExerciseComponent },
  { path: 'sub-ex', component: SubtractionExerciseComponent },
  { path: 'multi-ex', component: MultiplicationExerciseComponent },
  { path: 'div-ex', component: DivisionExerciseComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrimarySchoolMathRoutingModule { }
