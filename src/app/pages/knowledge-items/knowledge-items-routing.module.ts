import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KnowledgeItemsComponent } from './knowledge-items.component';
import { KnowledgeItemDetailComponent } from './knowledge-item-detail';
import { KnowledgeItemSearchComponent } from './knowledge-item-search';

const routes: Routes = [
  { path: '', component: KnowledgeItemsComponent },
  { path: 'create', component: KnowledgeItemDetailComponent },
  { path: 'display/:id', component: KnowledgeItemDetailComponent },
  { path: 'edit/:id', component: KnowledgeItemDetailComponent },
  { path: 'search', component: KnowledgeItemSearchComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KnowledgeItemsRoutingModule {}
