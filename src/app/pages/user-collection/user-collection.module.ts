import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { TranslocoModule } from '@ngneat/transloco';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';

import { MaterialModulesModule } from '../../material-modules';
import { ImageUploadModule } from '../image-upload/image-upload.module';
import { AppUIModule } from 'src/app/app-ui.module';
import { UserCollectionRoutingModule } from './user-collection-routing.module';
import { UserCollectionComponent } from './user-collection/user-collection.component';
import { UserCollectionDetailComponent } from './user-collection-detail/user-collection-detail.component';

@NgModule({
  declarations: [
    UserCollectionComponent,
    UserCollectionDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    ImageUploadModule,
    MonacoEditorModule,
    MarkdownModule.forChild(),
    TranslocoModule,
    AppUIModule,
    UserCollectionRoutingModule,
  ]
})
export class UserCollectionModule { }
