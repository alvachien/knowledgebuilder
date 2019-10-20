import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { KnowledgeComponent } from './knowledge.component';
import { KnowledgeListComponent } from './knowledge-list/knowledge-list.component';
import { KnowledgeDetailComponent } from './knowledge-detail/knowledge-detail.component';

@NgModule({
  declarations: [KnowledgeComponent, KnowledgeListComponent, KnowledgeDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzPageHeaderModule,
    NzCascaderModule,
    NzButtonModule,
  ],
  exports: [KnowledgeComponent]
})
export class KnowledgeModule { }
