import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HighSchoolRoutingModule } from './high-school-routing.module';
import { JuniorMathComponent } from './junior-math';
import { SeniorMathComponent } from './senior-math';


@NgModule({
  declarations: [
    JuniorMathComponent,
    SeniorMathComponent
  ],
  imports: [
    CommonModule,
    HighSchoolRoutingModule
  ]
})
export class HighSchoolModule { }
