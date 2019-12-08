import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NgxEchartsModule } from 'ngx-echarts';
import { TranslateModule } from '@ngx-translate/core';

import { EnglishWordRoutingModule } from './english-word-routing.module';
import { EnglishWordComponent } from './english-word.component';

@NgModule({
  declarations: [EnglishWordComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzPageHeaderModule,
    NzCascaderModule,
    NzButtonModule,
    NgxEchartsModule,
    NzGridModule,
    TranslateModule.forChild(),

    EnglishWordRoutingModule,
  ],
  exports: [EnglishWordComponent]
})
export class EnglishWordModule { }
