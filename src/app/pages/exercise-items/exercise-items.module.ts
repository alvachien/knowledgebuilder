import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { TranslocoModule } from '@ngneat/transloco';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';

import { MaterialModulesModule } from '../../material-modules';
import { ImageUploadModule } from '../image-upload/image-upload.module';
import { ExerciseItemsRoutingModule } from './exercise-items-routing.module';
import { ExerciseItemsComponent } from './exercise-items.component';
import { ExerciseItemDetailComponent } from './exercise-item-detail';
import { MY_DATE_FORMATS, AppDateAdapter, } from 'src/app/models';

@NgModule({
  declarations: [
    ExerciseItemsComponent,
    ExerciseItemDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    ImageUploadModule,
    MonacoEditorModule,
    MarkdownModule.forChild(),
    ExerciseItemsRoutingModule,
    TranslocoModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ]
})
export class ExerciseItemsModule { }
