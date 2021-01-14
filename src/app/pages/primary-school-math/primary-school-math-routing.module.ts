import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrimarySchoolMathComponent } from './primary-school-math.component';
import { AdditionExerciseComponent } from './addition-exercise';

const routes: Routes = [
  { path: '', component: PrimarySchoolMathComponent },
  { path: 'add-ex', component: AdditionExerciseComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrimarySchoolMathRoutingModule { }
