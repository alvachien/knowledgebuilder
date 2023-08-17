import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnglishLearningRoutingModule } from './english-learning-routing.module';
import { SentencesListComponent } from './sentences-list';
import { SentencesDetailComponent } from './sentences-detail';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModulesModule } from 'src/app/material-modules';
import { MarkdownModule } from 'ngx-markdown';
import { TranslocoModule } from '@ngneat/transloco';
import { AppUIModule } from 'src/app/app-ui.module';

@NgModule({
  declarations: [
    SentencesListComponent,
    SentencesDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    MarkdownModule.forChild(),
    TranslocoModule,
    AppUIModule,

    EnglishLearningRoutingModule
  ]
})
export class EnglishLearningModule { }
