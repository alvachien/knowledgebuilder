import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { TranslateModule } from '@ngx-translate/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { ReusableComponentModule } from '../../components/reusable-component/reusable-component.module';

import { KnowledgeRoutingModule } from './knowledge-routing.module';
import { KnowledgeComponent } from './knowledge.component';
import { KnowledgeListComponent } from './knowledge-list/knowledge-list.component';
import { KnowledgeDetailComponent } from './knowledge-detail/knowledge-detail.component';

@NgModule({
  declarations: [
    KnowledgeComponent,
    KnowledgeListComponent,
    KnowledgeDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzPageHeaderModule,
    NzCascaderModule,
    NzButtonModule,
    NzRadioModule,
    NzSpinModule,
    NzTableModule,
    NzBreadCrumbModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzFormModule,
    TranslateModule.forChild(),

    ReusableComponentModule,
    KnowledgeRoutingModule,
  ],
})
export class KnowledgeModule { }
