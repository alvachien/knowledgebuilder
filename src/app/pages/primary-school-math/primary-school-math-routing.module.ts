import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrimarySchoolMathComponent } from './primary-school-math.component';
import { AdditionExerciseComponent } from './addition-exercise';
import { SubtractionExerciseComponent } from './subtraction-exercise';
import { MultiplicationExerciseComponent } from './multiplication-exercise';
import { DivisionExerciseComponent } from './division-exercise';
import { MixedOperationsComponent } from './mixed-operations';
import { PrintableQuizComponent } from './printable-quiz';

import { CanDeactivateGuard } from '../../services';

const routes: Routes = [
  { path: '', component: PrimarySchoolMathComponent },
  { path: 'add-ex', component: AdditionExerciseComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'sub-ex', component: SubtractionExerciseComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'multi-ex', component: MultiplicationExerciseComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'div-ex', component: DivisionExerciseComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'mixed-op', component: MixedOperationsComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'printable-quiz', component: PrintableQuizComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrimarySchoolMathRoutingModule { }
