import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FunctionCurveRoutingModule } from './function-curve-routing.module';
import { FunctionCurveComponent } from './function-curve';

@NgModule({
  declarations: [
    FunctionCurveComponent
  ],
  imports: [
    CommonModule,
    FunctionCurveRoutingModule
  ]
})
export class FunctionCurveModule { }
