import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KnowledgeItemsRoutingModule } from './knowledge-items-routing.module';
import { KnowledgeItemsComponent } from './knowledge-items.component';


@NgModule({
  declarations: [KnowledgeItemsComponent],
  imports: [
    CommonModule,
    KnowledgeItemsRoutingModule
  ]
})
export class KnowledgeItemsModule { }
