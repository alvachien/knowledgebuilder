import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuestionBankItemsComponent } from './question-bank-items.component';
import { QuestionBankItemDetailComponent } from './question-bank-item-detail';

const routes: Routes = [
  { path: '', component: QuestionBankItemsComponent },
  { path: 'create', component: QuestionBankItemDetailComponent },
  { path: 'display/:id', component: QuestionBankItemDetailComponent },
  { path: 'edit/:id', component: QuestionBankItemDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestionBankItemsRoutingModule { }
