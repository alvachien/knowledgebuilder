import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FunctionCurveComponent } from './function-curve.component';

const routes: Routes = [
  { path: '', component: FunctionCurveComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FunctionCurveRoutingModule { }
