import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { PreviewRoutingModule } from './preview-routing.module';
import { PreviewComponent } from './preview.component';
import { MarkdownModule } from 'ngx-markdown';
import { PreviewNewScoreSheet } from './preview-newscore-sheet';

@NgModule({
  declarations: [
    PreviewComponent,
    PreviewNewScoreSheet,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslocoModule,
    MaterialModulesModule,
    MarkdownModule,
    PreviewRoutingModule
  ]
})
export class PreviewModule { }
