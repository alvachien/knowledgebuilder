import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuestionBankItemsRoutingModule } from './question-bank-items-routing.module';
import { QuestionBankItemsComponent } from './question-bank-items.component';
import { QuestionBankItemDetailComponent } from './question-bank-item-detail/question-bank-item-detail.component';


@NgModule({
  declarations: [QuestionBankItemsComponent, QuestionBankItemDetailComponent],
  imports: [
    CommonModule,
    QuestionBankItemsRoutingModule
  ]
})
export class QuestionBankItemsModule { }
