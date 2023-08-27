import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { JuniorMathComponent } from './junior-math';
import { SeniorMathComponent } from './senior-math';
import { ItemDisplayComponent } from './item-display';

const routes: Routes = [
  {
    path: 'junior-math',
    component: JuniorMathComponent,
  },
  {
    path: 'senior-math',
    component: SeniorMathComponent,
  },
  {
    path: 'display-hsmath-item/:file',
    component: ItemDisplayComponent,
  },
  {
    path: 'display-jrmath-item/:file',
    component: ItemDisplayComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HighSchoolRoutingModule {}
