import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModulesModule } from '../../material-modules';
import { KnowledgeItemsRoutingModule } from './knowledge-items-routing.module';
import { KnowledgeItemsComponent } from './knowledge-items.component';
import { KnowledgeItemDetailComponent } from './knowledge-item-detail/knowledge-item-detail.component';


@NgModule({
  declarations: [
    KnowledgeItemsComponent,
    KnowledgeItemDetailComponent
  ],
  imports: [
    CommonModule,
    MaterialModulesModule,
    KnowledgeItemsRoutingModule,
  ]
})
export class KnowledgeItemsModule { }
