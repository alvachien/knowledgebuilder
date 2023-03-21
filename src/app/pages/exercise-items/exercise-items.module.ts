import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { ImageUploadModule } from '../image-upload/image-upload.module';
import { ExerciseItemsRoutingModule } from './exercise-items-routing.module';
import { ExerciseItemsComponent } from './exercise-items.component';
import { ExerciseItemDetailComponent } from './exercise-item-detail';
import { ExerciseItemSearchComponent } from './exercise-item-search';
import { AppUIModule } from 'src/app/app-ui.module';
import { ExerciseItemScoreComponent } from './exercise-item-score/exercise-item-score.component';
import { ExerciseItemAddToCollDialog } from './exercise-items-add-coll-dlg.component';
import { ExerciseItemNewPracticeDialog } from './exercise-items-newpractice-dlg.component';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';

// import { MY_DATE_FORMATS, AppDateAdapter, } from 'src/app/models';

@NgModule({
  declarations: [
    ExerciseItemsComponent,
    ExerciseItemDetailComponent,
    ExerciseItemSearchComponent,
    ExerciseItemScoreComponent,
    ExerciseItemAddToCollDialog,
    ExerciseItemNewPracticeDialog,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    ImageUploadModule,
    NuMonacoEditorModule,
    MarkdownModule.forChild(),
    ExerciseItemsRoutingModule,
    TranslocoModule,
    AppUIModule,
  ],
  providers: [
    // { provide: DateAdapter, useClass: AppDateAdapter },
    // { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class ExerciseItemsModule {}
