import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';

import { TranslocoModule } from '@ngneat/transloco';

import { FunctionCurveRoutingModule } from './function-curve-routing.module';
import { FunctionCurveComponent } from './function-curve';

@NgModule({
  declarations: [
    FunctionCurveComponent
  ],
  imports: [
    CommonModule,
    FormsModule,

    MatFormFieldModule,
    MatSelectModule,
    MatToolbarModule,

    TranslocoModule,

    FunctionCurveRoutingModule
  ]
})
export class FunctionCurveModule { }
