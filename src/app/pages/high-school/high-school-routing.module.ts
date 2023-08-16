import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { JuniorMathComponent } from './junior-math';
import { SeniorMathComponent } from './senior-math';

const routes: Routes = [{
    path: 'junior-math',
    component: JuniorMathComponent,
  }, {
    path: 'senior-math',
    component: SeniorMathComponent,
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HighSchoolRoutingModule { }
