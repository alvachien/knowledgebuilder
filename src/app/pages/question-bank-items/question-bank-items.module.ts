import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuestionBankItemsRoutingModule } from './question-bank-items-routing.module';
import { QuestionBankItemsComponent } from './question-bank-items.component';


@NgModule({
  declarations: [QuestionBankItemsComponent],
  imports: [
    CommonModule,
    QuestionBankItemsRoutingModule
  ]
})
export class QuestionBankItemsModule { }
