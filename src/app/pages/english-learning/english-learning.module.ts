import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { TranslocoModule } from '@ngneat/transloco';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';

import { EnglishLearningRoutingModule } from './english-learning-routing.module';
import { SentencesListComponent, ExerciseSentenceDialog } from './sentences-list';
import { SentencesDetailComponent } from './sentences-detail';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModulesModule } from 'src/app/material-modules';
import { AppUIModule } from 'src/app/app-ui.module';
import { DictationSettingDialog } from './dictation-setting-dlg.component';

@NgModule({
  declarations: [
    SentencesListComponent,
    SentencesDetailComponent,
    DictationSettingDialog,
    ExerciseSentenceDialog,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    MarkdownModule.forChild(),
    TranslocoModule,
    NuMonacoEditorModule,
    AppUIModule,

    EnglishLearningRoutingModule,
  ],
})
export class EnglishLearningModule {}
