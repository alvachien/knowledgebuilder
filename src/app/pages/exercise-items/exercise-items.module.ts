import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';

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
    EditorModule,
    ExerciseItemsRoutingModule,
    TranslocoModule,
    AppUIModule
  ],
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
  ]
})
export class ExerciseItemsModule { }
