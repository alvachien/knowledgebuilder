import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FunctionCurveComponent } from './function-curve';

const routes: Routes = [
  {
    path: '',
    component: FunctionCurveComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FunctionCurveRoutingModule {}
