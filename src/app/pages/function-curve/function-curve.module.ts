import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgxEchartsModule } from 'ngx-echarts';

import { FunctionCurveRoutingModule } from './function-curve-routing.module';
import { FunctionCurveComponent } from './function-curve.component';

@NgModule({
  declarations: [FunctionCurveComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzPageHeaderModule,
    NzCascaderModule,
    NzButtonModule,
    NgxEchartsModule,

    FunctionCurveRoutingModule,
  ],
  exports: [FunctionCurveComponent]
})
export class FunctionCurveModule { }
